const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!UUID.test(id)) {
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
  const rows = await sql`SELECT id, slug, name, description, icon
    FROM subjects ORDER BY name`;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ subjects: rows });
}

async function listPublishedMaterials(subjectSlug, res) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subjectSlug)) {
    return res.status(400).json({ error: "Identificador de disciplina inválido." });
  }
  const subjects = await sql`SELECT id, slug, name, description, icon FROM subjects WHERE slug = ${subjectSlug} LIMIT 1`;
  if (!subjects.length) return res.status(404).json({ error: "Disciplina não encontrada." });
  const materials = await sql`SELECT m.id, m.title, m.content, m.link, m.published_at,
      COALESCE(u.name, 'Equipe BitAcademy') AS teacher_name
    FROM materials m LEFT JOIN users u ON u.id = m.teacher_id
    WHERE m.subject_id = ${subjects[0].id} AND m.status = 'published'
    ORDER BY m.display_order ASC, m.created_at ASC LIMIT 100`;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ subject: subjects[0], materials });
}

async function listSubjectResources(subjectSlug, res) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subjectSlug)) return res.status(400).json({ error: "Identificador de disciplina inválido." });
  const rows = await sql`SELECT r.id, r.resource_type, r.title, r.description, r.html_path
    FROM subject_resources r JOIN subjects s ON s.id = r.subject_id
    WHERE s.slug = ${subjectSlug} ORDER BY CASE r.resource_type WHEN 'quiz' THEN 0 ELSE 1 END, r.title`;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ resources: rows });
}

async function listActivities(teacherId, subjectSlug, res) {
  const authorized = await getAuthorizedSubject(teacherId, subjectSlug);
  if (!authorized) return res.status(403).json({ error: "Você não pode acessar esta disciplina." });
  const rows = await sql`
    SELECT a.id, a.title, a.description, a.activity_type, a.max_score, a.due_at, a.created_at, a.updated_at,
           a.course_offering_id, a.grading_period_id, a.component_id, a.assessment_id,
           c.name AS class_name, y.name AS academic_year_name,
           (SELECT COUNT(*)::int FROM activity_submissions s WHERE s.activity_id = a.id) AS submission_count,
           (SELECT COUNT(*)::int FROM activity_submissions s WHERE s.activity_id = a.id AND s.status = 'graded') AS graded_count
    FROM activities a
    JOIN subjects s ON s.id = a.subject_id
    LEFT JOIN course_offerings o ON o.id = a.course_offering_id
    LEFT JOIN class_groups c ON c.id = o.class_group_id
    LEFT JOIN academic_years y ON y.id = c.academic_year_id
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
  const courseOfferingId = body.courseOfferingId ? String(body.courseOfferingId).trim() : null;
  const gradingPeriodId = body.gradingPeriodId ? String(body.gradingPeriodId).trim() : null;
  const componentId = body.componentId ? String(body.componentId).trim() : null;
  const linkToGradebook = Boolean(body.linkToGradebook);

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

  let createdAssessmentId = null;

  if (linkToGradebook && courseOfferingId && gradingPeriodId && componentId) {
    if (![courseOfferingId, gradingPeriodId, componentId].every((id) => UUID.test(id))) {
      return res.status(400).json({ error: "IDs do diário/boletim inválidos." });
    }

    const course = await sql`
      SELECT o.id, c.academic_year_id, y.status AS year_status
      FROM course_offerings o
      JOIN class_groups c ON c.id = o.class_group_id
      JOIN academic_years y ON y.id = c.academic_year_id
      WHERE o.id = ${courseOfferingId} AND o.teacher_id = ${teacherId}
        AND o.status = 'active' AND c.status = 'active' AND y.status <> 'closed'
      LIMIT 1
    `;
    if (!course.length) {
      return res.status(400).json({ error: "Turma/oferta não encontrada ou ano letivo fechado." });
    }

    const period = await sql`
      SELECT id FROM grading_periods
      WHERE id = ${gradingPeriodId} AND academic_year_id = ${course[0].academic_year_id} AND status = 'open'
      LIMIT 1
    `;
    if (!period.length) {
      return res.status(400).json({ error: "Período avaliativo fechado ou não pertence ao ano letivo." });
    }

    const component = await sql`
      SELECT id FROM assessment_components
      WHERE id = ${componentId} AND course_offering_id = ${courseOfferingId} AND grading_period_id = ${gradingPeriodId}
      LIMIT 1
    `;
    if (!component.length) {
      return res.status(400).json({ error: "Componente avaliativo não pertence à turma e período selecionados." });
    }

    const createdAssessment = await sql`
      INSERT INTO assessments (course_offering_id, grading_period_id, component_id, title, description, assessment_type, weight, due_at, created_by, status)
      VALUES (${courseOfferingId}, ${gradingPeriodId}, ${componentId}, ${title}, ${description}, 'regular', 1, ${deadline ? deadline.toISOString() : null}, ${teacherId}, 'draft')
      RETURNING id
    `;
    createdAssessmentId = createdAssessment[0]?.id || null;
  }

  const rows = await sql`
    INSERT INTO activities (teacher_id, subject_id, title, description, activity_type, max_score, due_at, course_offering_id, grading_period_id, component_id, assessment_id)
    VALUES (
      ${teacherId},
      ${authorized.id},
      ${title},
      ${description},
      ${type},
      ${score},
      ${deadline ? deadline.toISOString() : null},
      ${courseOfferingId || null},
      ${gradingPeriodId || null},
      ${componentId || null},
      ${createdAssessmentId}
    )
    RETURNING id, title, description, activity_type, max_score, due_at, created_at, updated_at, course_offering_id, assessment_id
  `;

  return res.status(201).json({ activity: rows[0] });
}

// Mesa de correção: listar entregas de uma atividade
async function listActivitySubmissions(teacherId, activityId, res) {
  if (!UUID.test(activityId)) return res.status(400).json({ error: "Atividade inválida." });

  const activity = await sql`
    SELECT a.*, s.name AS subject_name, c.name AS class_name
    FROM activities a
    JOIN subjects s ON s.id = a.subject_id
    LEFT JOIN course_offerings o ON o.id = a.course_offering_id
    LEFT JOIN class_groups c ON c.id = o.class_group_id
    WHERE a.id = ${activityId} AND a.teacher_id = ${teacherId}
    LIMIT 1
  `;
  if (!activity.length) return res.status(404).json({ error: "Atividade não encontrada ou você não tem acesso." });

  let students = [];
  if (activity[0].course_offering_id) {
    students = await sql`
      SELECT se.id AS enrollment_id, u.id AS student_id, u.name AS student_name, u.email AS student_email,
             sub.id AS submission_id, sub.content, sub.link, sub.status AS submission_status,
             sub.submitted_at, sub.feedback, sub.score, sub.graded_at
      FROM course_offerings o
      JOIN student_enrollments se ON se.class_group_id = o.class_group_id AND se.status = 'active'
      JOIN users u ON u.id = se.student_id
      LEFT JOIN activity_submissions sub ON sub.activity_id = ${activityId} AND sub.enrollment_id = se.id
      WHERE o.id = ${activity[0].course_offering_id}
      ORDER BY u.name
    `;
  } else {
    students = await sql`
      SELECT sub.id AS submission_id, sub.enrollment_id, u.id AS student_id, u.name AS student_name, u.email AS student_email,
             sub.content, sub.link, sub.status AS submission_status, sub.submitted_at, sub.feedback, sub.score, sub.graded_at
      FROM activity_submissions sub
      JOIN student_enrollments se ON se.id = sub.enrollment_id
      JOIN users u ON u.id = se.student_id
      WHERE sub.activity_id = ${activityId}
      ORDER BY sub.submitted_at DESC
    `;
  }

  return res.status(200).json({ activity: activity[0], students });
}

// Lançamento de nota de uma submissão com sincronização direta no diário de classe
async function gradeSubmission(teacherId, body, res) {
  const activityId = String(body.activityId || "");
  const enrollmentId = String(body.enrollmentId || "");
  const rawScore = body.score === "" || body.score === null || body.score === undefined ? null : Number(body.score);
  const feedback = String(body.feedback || "").trim() || null;

  if (!UUID.test(activityId) || !UUID.test(enrollmentId)) {
    return res.status(400).json({ error: "Atividade ou matrícula inválida." });
  }

  const activity = await sql`
    SELECT a.*, o.class_group_id
    FROM activities a
    LEFT JOIN course_offerings o ON o.id = a.course_offering_id
    WHERE a.id = ${activityId} AND a.teacher_id = ${teacherId}
    LIMIT 1
  `;
  if (!activity.length) {
    return res.status(404).json({ error: "Atividade não encontrada ou sem permissão." });
  }

  let finalScore = null;
  if (rawScore !== null) {
    if (!Number.isFinite(rawScore) || rawScore < 0 || rawScore > 10) {
      return res.status(400).json({ error: "A nota deve estar entre 0 e 10." });
    }
    finalScore = rawScore;
  }

  const subStatus = finalScore !== null ? "graded" : "submitted";

  const savedSub = await sql`
    INSERT INTO activity_submissions (activity_id, enrollment_id, score, feedback, status, graded_at, graded_by)
    VALUES (${activityId}, ${enrollmentId}, ${finalScore}, ${feedback}, ${subStatus},
            ${finalScore !== null ? sql`NOW()` : null}, ${teacherId})
    ON CONFLICT (activity_id, enrollment_id)
    DO UPDATE SET score = EXCLUDED.score, feedback = EXCLUDED.feedback,
                  status = EXCLUDED.status, graded_at = EXCLUDED.graded_at,
                  graded_by = EXCLUDED.graded_by, updated_at = NOW()
    RETURNING *
  `;

  // Se a atividade possui uma avaliação vinculada no diário de classe, sincronizar diretamente na tabela `grades`
  let gradeSynced = false;
  if (activity[0].assessment_id) {
    const assessmentId = activity[0].assessment_id;
    const gradeStatus = finalScore !== null ? "scored" : "pending";

    const savedGrade = await sql`
      WITH previous AS (
        SELECT id, score, grade_status, feedback, TRUE AS existed
        FROM grades WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
      ), changed AS (
        INSERT INTO grades (assessment_id, enrollment_id, score, grade_status, feedback, entered_by)
        VALUES (${assessmentId}, ${enrollmentId}, ${finalScore}, ${gradeStatus}, ${feedback}, ${teacherId})
        ON CONFLICT (assessment_id, enrollment_id)
        DO UPDATE SET score = EXCLUDED.score, grade_status = EXCLUDED.grade_status, feedback = EXCLUDED.feedback,
                      entered_by = EXCLUDED.entered_by, updated_at = NOW()
        RETURNING *
      ), audit AS (
        INSERT INTO grade_change_log (grade_id, changed_by, previous_score, new_score, previous_grade_status, new_grade_status, previous_feedback, new_feedback)
        SELECT changed.id, ${teacherId}, previous.score, changed.score, previous.grade_status, changed.grade_status, previous.feedback, changed.feedback
        FROM changed LEFT JOIN previous ON TRUE
        WHERE NOT COALESCE(previous.existed, FALSE)
           OR previous.score IS DISTINCT FROM changed.score OR previous.grade_status IS DISTINCT FROM changed.grade_status
           OR previous.feedback IS DISTINCT FROM changed.feedback
        RETURNING id
      )
      SELECT changed.* FROM changed
    `;
    if (savedGrade.length) gradeSynced = true;
  }

  return res.status(200).json({ submission: savedSub[0], gradeSynced });
}

// Aluno envia sua entrega/trabalho
async function submitStudentActivity(studentId, body, res) {
  const activityId = String(body.activityId || "");
  const content = String(body.content || "").trim() || null;
  const link = String(body.link || "").trim() || null;

  if (!UUID.test(activityId)) return res.status(400).json({ error: "Atividade inválida." });
  if (!content && !link) return res.status(400).json({ error: "Preencha a resposta escrita ou informe um link do trabalho." });
  if (link && (link.length > 2048 || !/^https?:\/\//i.test(link))) {
    return res.status(400).json({ error: "O link deve começar com http:// ou https:// e ter até 2.048 caracteres." });
  }

  const activity = await sql`
    SELECT a.*, o.class_group_id
    FROM activities a
    LEFT JOIN course_offerings o ON o.id = a.course_offering_id
    WHERE a.id = ${activityId}
    LIMIT 1
  `;
  if (!activity.length) return res.status(404).json({ error: "Atividade não encontrada." });

  let enrollment = null;
  if (activity[0].class_group_id) {
    const enrRows = await sql`
      SELECT id FROM student_enrollments
      WHERE student_id = ${studentId} AND class_group_id = ${activity[0].class_group_id} AND status = 'active'
      LIMIT 1
    `;
    if (!enrRows.length) return res.status(403).json({ error: "Você não está matriculado na turma desta atividade." });
    enrollment = enrRows[0];
  } else {
    const enrRows = await sql`
      SELECT id FROM student_enrollments
      WHERE student_id = ${studentId} AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `;
    if (!enrRows.length) return res.status(403).json({ error: "Matrícula ativa não encontrada." });
    enrollment = enrRows[0];
  }

  const saved = await sql`
    INSERT INTO activity_submissions (activity_id, enrollment_id, content, link, status, submitted_at)
    VALUES (${activityId}, ${enrollment.id}, ${content}, ${link}, 'submitted', NOW())
    ON CONFLICT (activity_id, enrollment_id)
    DO UPDATE SET content = EXCLUDED.content, link = EXCLUDED.link,
                  status = 'submitted', submitted_at = NOW(), updated_at = NOW()
    RETURNING *
  `;

  return res.status(200).json({ submission: saved[0] });
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
    if (req.method === "GET" && action === "resources") {
      return listSubjectResources(String(query.subject || "").trim().toLowerCase(), res);
    }

    if (req.method === "GET" && action === "student-activities") {
      const studentId = await getSessionUserId(req);
      if (!studentId) return res.status(401).json({ error: "Não autenticado." });
      const users = await sql`SELECT account_type FROM users WHERE id = ${studentId} LIMIT 1`;
      if (!users.length || users[0].account_type !== "Aluno") {
        return res.status(403).json({ error: "Esta consulta está disponível para contas de aluno." });
      }

      // Buscar atividades de turmas em que o aluno está matriculado ou atividades gerais
      const activities = await sql`
        SELECT a.id, a.title, a.description, a.activity_type, a.max_score, a.due_at, a.created_at,
               s.name AS subject_name, s.slug AS subject_slug,
               u.name AS teacher_name,
               c.name AS class_name,
               sub.id AS submission_id, sub.status AS submission_status, sub.content AS submission_content,
               sub.link AS submission_link, sub.score AS submission_score, sub.feedback AS submission_feedback,
               sub.submitted_at
        FROM activities a
        JOIN subjects s ON s.id = a.subject_id
        JOIN users u ON u.id = a.teacher_id
        LEFT JOIN course_offerings o ON o.id = a.course_offering_id
        LEFT JOIN class_groups c ON c.id = o.class_group_id
        LEFT JOIN student_enrollments se ON se.student_id = ${studentId} AND (se.class_group_id = c.id OR a.course_offering_id IS NULL) AND se.status = 'active'
        LEFT JOIN activity_submissions sub ON sub.activity_id = a.id AND sub.enrollment_id = se.id
        WHERE (a.course_offering_id IS NULL OR EXISTS (
          SELECT 1 FROM student_enrollments e
          WHERE e.student_id = ${studentId} AND e.class_group_id = o.class_group_id AND e.status = 'active'
        ))
        ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC
        LIMIT 100
      `;
      return res.status(200).json({ activities });
    }

    if (action === "submit-activity") {
      if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
      const studentId = await getSessionUserId(req);
      if (!studentId) return res.status(401).json({ error: "Não autenticado." });
      return submitStudentActivity(studentId, jsonBody(req), res);
    }

    const teacherId = await getSessionUserId(req);
    if (!teacherId) return res.status(401).json({ error: "Não autenticado." });

    if (action === "activity-submissions") {
      if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });
      return listActivitySubmissions(teacherId, String(query.activityId || ""), res);
    }

    if (action === "grade-submission") {
      if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
      return gradeSubmission(teacherId, jsonBody(req), res);
    }

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
