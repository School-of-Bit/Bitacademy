const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

async function getAuthorizedSubject(teacherId, subjectSlug) {
  const rows = await sql`
    SELECT s.id, s.name, s.slug
    FROM teacher_subjects ts
    JOIN subjects s ON s.id = ts.subject_id
    JOIN users u ON u.id = ts.teacher_id
    WHERE ts.teacher_id = ${teacherId}
      AND u.account_type = 'Professor'
      AND s.slug = ${subjectSlug}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function listMaterials(teacherId, subjectSlug, res) {
  const authorized = await getAuthorizedSubject(teacherId, subjectSlug);
  if (!authorized) return res.status(403).json({ error: "Você não pode acessar esta disciplina." });
  const rows = await sql`
    SELECT m.id, m.title, m.content, m.link, m.status, m.created_at, m.updated_at, m.published_at
    FROM materials m
    JOIN subjects s ON s.id = m.subject_id
    WHERE m.teacher_id = ${teacherId}
      AND s.slug = ${subjectSlug}
    ORDER BY m.created_at DESC
  `;
  return res.status(200).json({ materials: rows });
}

function validateMaterial(body) {
  const subject = String(body.subjectSlug || "").trim().toLowerCase();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const link = String(body.link || "").trim() || null;
  const status = String(body.status || "draft").trim().toLowerCase();
  if (!subject || !title || !content) return { error: "Disciplina, título e conteúdo são obrigatórios." };
  if (title.length > 200 || content.length > 30000) return { error: "O título deve ter até 200 caracteres e o conteúdo até 30.000." };
  if (!['draft', 'published'].includes(status)) return { error: "Estado de publicação inválido." };
  if (link && (link.length > 2048 || !/^https?:\/\//i.test(link))) return { error: "O link deve começar com http:// ou https:// e ter até 2.048 caracteres." };
  return { subject, title, content, link, status };
}

async function createMaterial(teacherId, body, res) {
  const material = validateMaterial(body);
  if (material.error) return res.status(400).json({ error: material.error });

  const authorized = await getAuthorizedSubject(teacherId, material.subject);
  if (!authorized) {
    return res.status(403).json({ error: "Você não pode publicar nesta disciplina." });
  }

  const rows = await sql`
    INSERT INTO materials (teacher_id, subject_id, title, content, link, status, published_at)
    VALUES (${teacherId}, ${authorized.id}, ${material.title}, ${material.content}, ${material.link}, ${material.status},
      CASE WHEN ${material.status} = 'published' THEN NOW() ELSE NULL END)
    RETURNING id, title, content, link, status, created_at, updated_at, published_at
  `;

  return res.status(201).json({ material: rows[0] });
}

async function updateMaterial(teacherId, body, res) {
  const id = String(body.id || "").trim();
  const material = validateMaterial(body);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: "Material inválido." });
  }
  if (material.error) return res.status(400).json({ error: material.error });
  const subject = await getAuthorizedSubject(teacherId, material.subject);
  if (!subject) return res.status(403).json({ error: "Você não pode editar materiais desta disciplina." });
  const rows = await sql`UPDATE materials SET title = ${material.title}, content = ${material.content},
      link = ${material.link},
      published_at = CASE WHEN ${material.status} = 'published' THEN COALESCE(published_at, NOW()) ELSE NULL END,
      status = ${material.status}, updated_at = NOW()
    WHERE id = ${id} AND teacher_id = ${teacherId} AND subject_id = ${subject.id}
    RETURNING id, title, content, link, status, created_at, updated_at, published_at`;
  if (!rows.length) return res.status(404).json({ error: "Material não encontrado." });
  return res.status(200).json({ material: rows[0] });
}

async function listPublicSubjects(res) {
  const rows = await sql`SELECT s.id, s.slug, s.name, s.description, s.icon,
      COUNT(m.id)::int AS published_material_count
    FROM subjects s
    LEFT JOIN materials m ON m.subject_id = s.id AND m.status = 'published'
    GROUP BY s.id ORDER BY s.name`;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ subjects: rows });
}

async function listPublishedMaterials(subjectSlug, res) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subjectSlug)) {
    return res.status(400).json({ error: "Identificador de disciplina inválido." });
  }
  const subjects = await sql`SELECT id, slug, name, description, icon FROM subjects WHERE slug = ${subjectSlug} LIMIT 1`;
  if (!subjects.length) return res.status(404).json({ error: "Disciplina não encontrada." });
  const materials = await sql`SELECT m.id, m.title, m.content, m.link, m.published_at, u.name AS teacher_name
    FROM materials m JOIN users u ON u.id = m.teacher_id
    WHERE m.subject_id = ${subjects[0].id} AND m.status = 'published'
    ORDER BY m.created_at ASC LIMIT 100`;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ subject: subjects[0], materials });
}

async function listActivities(teacherId, subjectSlug, res) {
  const authorized = await getAuthorizedSubject(teacherId, subjectSlug);
  if (!authorized) return res.status(403).json({ error: "Você não pode acessar esta disciplina." });
  const rows = await sql`
    SELECT a.id, a.title, a.description, a.activity_type, a.max_score, a.due_at, a.created_at, a.updated_at
    FROM activities a
    JOIN subjects s ON s.id = a.subject_id
    WHERE a.teacher_id = ${teacherId}
      AND s.slug = ${subjectSlug}
    ORDER BY a.created_at DESC
  `;
  return res.status(200).json({ activities: rows });
}

async function createActivity(teacherId, body, res) {
  const subject = String(body.subjectSlug || "").trim();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const type = String(body.activityType || "manual").trim().toLowerCase();
  const score = Number(body.maxScore ?? 10);
  const deadline = body.dueAt ? new Date(body.dueAt) : null;

  if (!subject || !title || !description) {
    return res.status(400).json({ error: "Disciplina, título e descrição são obrigatórios." });
  }

  if (!["automatic", "manual"].includes(type)) {
    return res.status(400).json({ error: "Tipo de atividade inválido." });
  }

  if (!Number.isFinite(score) || score <= 0 || score > 100) {
    return res.status(400).json({ error: "A pontuação deve estar entre 0 e 100." });
  }

  if (deadline && Number.isNaN(deadline.getTime())) {
    return res.status(400).json({ error: "Prazo inválido." });
  }

  const authorized = await getAuthorizedSubject(teacherId, subject);
  if (!authorized) {
    return res.status(403).json({ error: "Você não pode criar atividades nesta disciplina." });
  }

  const rows = await sql`
    INSERT INTO activities (teacher_id, subject_id, title, description, activity_type, max_score, due_at)
    VALUES (
      ${teacherId},
      ${authorized.id},
      ${title},
      ${description},
      ${type},
      ${score},
      ${deadline ? deadline.toISOString() : null}
    )
    RETURNING id, title, description, activity_type, max_score, due_at, created_at, updated_at
  `;

  return res.status(201).json({ activity: rows[0] });
}

module.exports = async function handler(req, res) {
  try {
    const query = req.query || {};
    const resource = String(query.resource || "").trim().toLowerCase();
    const action = String(query.action || (req.method === "GET" ? "list" : "create")).trim().toLowerCase();

    if (req.method === "GET" && action === "subjects") return listPublicSubjects(res);
    if (req.method === "GET" && action === "published") {
      return listPublishedMaterials(String(query.subject || "").trim().toLowerCase(), res);
    }
    if (req.method === "GET" && action === "student-activities") {
      const studentId = await getSessionUserId(req);
      if (!studentId) return res.status(401).json({ error: "Não autenticado." });
      const users = await sql`SELECT account_type FROM users WHERE id = ${studentId} LIMIT 1`;
      if (!users.length || users[0].account_type !== "Aluno") {
        return res.status(403).json({ error: "Esta consulta está disponível para contas de aluno." });
      }
      const activities = await sql`SELECT a.id, a.title, a.description, a.activity_type,
          a.max_score, a.due_at, a.created_at, s.name AS subject_name, s.slug AS subject_slug,
          u.name AS teacher_name
        FROM activities a
        JOIN subjects s ON s.id = a.subject_id
        JOIN users u ON u.id = a.teacher_id
        ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC
        LIMIT 100`;
      return res.status(200).json({ activities });
    }

    const teacherId = await getSessionUserId(req);
    if (!teacherId) return res.status(401).json({ error: "Não autenticado." });

    if (!["materials", "activities"].includes(resource)) {
      return res.status(400).json({ error: "Recurso acadêmico inválido." });
    }

    if (action === "list" && req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido." });
    }

    if (["create", "update"].includes(action) && req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido." });
    }

    if (!["list", "create", "update"].includes(action)) {
      return res.status(400).json({ error: "Ação acadêmica inválida." });
    }

    if (action === "list") {
      const subject = String(query.subject || "").trim();
      if (!subject) return res.status(400).json({ error: "Informe a disciplina." });
      return resource === "materials"
        ? listMaterials(teacherId, subject, res)
        : listActivities(teacherId, subject, res);
    }

    const body = jsonBody(req);
    if (action === "update") {
      if (resource !== "materials") return res.status(400).json({ error: "Ação de edição inválida para este recurso." });
      return updateMaterial(teacherId, body, res);
    }
    return resource === "materials"
      ? createMaterial(teacherId, body, res)
      : createActivity(teacherId, body, res);
  } catch (error) {
    console.error("Academic API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação acadêmica." });
  }
};
