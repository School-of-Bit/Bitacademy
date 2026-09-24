const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");
const bcrypt = require("bcryptjs");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    const users = await sql`SELECT account_type FROM users WHERE id = ${userId} LIMIT 1`;
    if (!users.length) return res.status(401).json({ error: "Sessão inválida." });
    if (users[0].account_type !== "Administrador") {
      return res.status(403).json({ error: "Acesso restrito a administradores." });
    }

    const action = String(req.query?.action || (req.method === "GET" ? "dashboard" : "")).trim().toLowerCase();
    if (req.method === "GET" && action === "dashboard") {
      const [teachers, subjects] = await Promise.all([
        sql`SELECT u.id, u.name, u.email, u.created_at,
                   COALESCE(json_agg(json_build_object('id', s.id, 'slug', s.slug, 'name', s.name))
                     FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS subjects
            FROM users u LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
            LEFT JOIN subjects s ON s.id = ts.subject_id
            WHERE u.account_type = 'Professor'
            GROUP BY u.id ORDER BY u.name`,
        sql`SELECT id, slug, name, icon, description FROM subjects ORDER BY name`
      ]);
      return res.status(200).json({ teachers, subjects });
    }

    if (req.method === "GET" && action === "users") {
      const rows = await sql`SELECT id, name, email, account_type, created_at
        FROM users ORDER BY created_at DESC LIMIT 500`;
      return res.status(200).json({ users: rows });
    }

    if (req.method === "POST" && ["update-user", "reset-password"].includes(action)) {
      const body = jsonBody(req);
      const targetId = String(body.userId || "").trim();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
        return res.status(400).json({ error: "Usuário inválido." });
      }
      const target = await sql`SELECT id, account_type FROM users WHERE id = ${targetId} LIMIT 1`;
      if (!target.length) return res.status(404).json({ error: "Usuário não encontrado." });
      if (target[0].account_type === "Administrador" && (action !== "reset-password" || targetId !== userId)) {
        return res.status(403).json({ error: "Contas de administrador devem ser alteradas diretamente no banco." });
      }

      if (action === "reset-password") {
        const password = String(body.password || "");
        if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
          return res.status(400).json({ error: "A senha temporária deve ter de 8 a 72 bytes." });
        }
        const hash = await bcrypt.hash(password, 12);
        await sql`UPDATE users SET password_hash = ${hash}, auth_version = auth_version + 1, updated_at = NOW() WHERE id = ${targetId}`;
        return res.status(200).json({ ok: true });
      }

      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const type = String(body.type || "").trim();
      if (name.length < 2 || name.length > 150) return res.status(400).json({ error: "O nome deve ter entre 2 e 150 caracteres." });
      if (email.length > 255 || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });
      if (!["Aluno", "Professor"].includes(type)) return res.status(400).json({ error: "Perfil inválido." });
      const updated = await sql`WITH removed AS (
          DELETE FROM teacher_subjects WHERE teacher_id = ${targetId} AND ${type} = 'Aluno'
        ), changed AS (
          UPDATE users SET name = ${name}, email = ${email}, account_type = ${type}, auth_version = auth_version + 1, updated_at = NOW()
          WHERE id = ${targetId} RETURNING id
        ) SELECT id FROM changed`;
      if (!updated.length) return res.status(404).json({ error: "Usuário não encontrado." });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "POST" && ["create-subject", "update-subject"].includes(action)) {
      const body = jsonBody(req);
      const id = String(body.id || "").trim();
      const slug = String(body.slug || "").trim().toLowerCase();
      const name = String(body.name || "").trim();
      const icon = String(body.icon || "").trim() || null;
      const description = String(body.description || "").trim() || null;
      if (name.length < 2 || name.length > 100) return res.status(400).json({ error: "O nome deve ter entre 2 e 100 caracteres." });
      if (icon && [...icon].length > 10) return res.status(400).json({ error: "O ícone deve ter até 10 caracteres." });

      if (action === "create-subject") {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 50) {
          return res.status(400).json({ error: "Use um identificador curto com letras minúsculas, números e hífens." });
        }
        await sql`INSERT INTO subjects (slug, name, icon, description)
          VALUES (${slug}, ${name}, ${icon}, ${description})`;
        return res.status(201).json({ ok: true });
      }
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return res.status(400).json({ error: "Disciplina inválida." });
      const updated = await sql`UPDATE subjects SET name = ${name}, icon = ${icon}, description = ${description}
        WHERE id = ${id} RETURNING id`;
      if (!updated.length) return res.status(404).json({ error: "Disciplina não encontrada." });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "POST" && ["assign-subject", "remove-subject"].includes(action)) {
      const body = jsonBody(req);
      const teacherId = String(body.teacherId || "").trim();
      const subjectId = String(body.subjectId || "").trim();
      if (!teacherId || !subjectId) return res.status(400).json({ error: "Professor e disciplina são obrigatórios." });
      const teacher = await sql`SELECT id FROM users WHERE id = ${teacherId} AND account_type = 'Professor' LIMIT 1`;
      if (!teacher.length) return res.status(404).json({ error: "Professor não encontrado." });
      if (action === "assign-subject") {
        const inserted = await sql`INSERT INTO teacher_subjects (teacher_id, subject_id)
          SELECT ${teacherId}, id FROM subjects WHERE id = ${subjectId}
          ON CONFLICT DO NOTHING RETURNING teacher_id`;
        const subject = await sql`SELECT id FROM subjects WHERE id = ${subjectId} LIMIT 1`;
        if (!subject.length) return res.status(404).json({ error: "Disciplina não encontrada." });
        return res.status(200).json({ ok: true, assigned: inserted.length > 0 });
      }
      const removed = await sql`DELETE FROM teacher_subjects
        WHERE teacher_id = ${teacherId} AND subject_id = ${subjectId} RETURNING teacher_id`;
      return res.status(200).json({ ok: true, removed: removed.length > 0 });
    }

    if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
    return res.status(400).json({ error: "Ação administrativa inválida." });
  } catch (error) {
    console.error("Admin API failed:", error);
    if (error?.code === "23505") return res.status(409).json({ error: "Já existe um usuário ou uma disciplina com esses dados." });
    return res.status(500).json({ error: "Não foi possível concluir a operação administrativa." });
  }
};
