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
    SELECT m.id, m.title, m.content, m.link, m.created_at, m.updated_at
    FROM materials m
    JOIN subjects s ON s.id = m.subject_id
    WHERE m.teacher_id = ${teacherId}
      AND s.slug = ${subjectSlug}
    ORDER BY m.created_at DESC
  `;
  return res.status(200).json({ materials: rows });
}

async function createMaterial(teacherId, body, res) {
  const subject = String(body.subjectSlug || "").trim();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const link = String(body.link || "").trim() || null;

  if (!subject || !title || !content) {
    return res.status(400).json({ error: "Disciplina, título e conteúdo são obrigatórios." });
  }

  if (link && !/^https?:\/\//i.test(link)) {
    return res.status(400).json({ error: "O link deve começar com http:// ou https://." });
  }

  const authorized = await getAuthorizedSubject(teacherId, subject);
  if (!authorized) {
    return res.status(403).json({ error: "Você não pode publicar nesta disciplina." });
  }

  const rows = await sql`
    INSERT INTO materials (teacher_id, subject_id, title, content, link)
    VALUES (${teacherId}, ${authorized.id}, ${title}, ${content}, ${link})
    RETURNING id, title, content, link, created_at, updated_at
  `;

  return res.status(201).json({ material: rows[0] });
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
    const teacherId = getSessionUserId(req);
    if (!teacherId) return res.status(401).json({ error: "Não autenticado." });

    const query = req.query || {};
    const resource = String(query.resource || "").trim().toLowerCase();
    const action = String(query.action || (req.method === "GET" ? "list" : "create")).trim().toLowerCase();

    if (!["materials", "activities"].includes(resource)) {
      return res.status(400).json({ error: "Recurso acadêmico inválido." });
    }

    if (action === "list" && req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido." });
    }

    if (action === "create" && req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido." });
    }

    if (!["list", "create"].includes(action)) {
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
    return resource === "materials"
      ? createMaterial(teacherId, body, res)
      : createActivity(teacherId, body, res);
  } catch (error) {
    console.error("Academic API failed:", error);
    return res.status(500).json({ error: "Não foi possível concluir a operação acadêmica." });
  }
};
