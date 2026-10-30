const { sql } = require("../lib/db");
const { getSessionUserId } = require("../lib/_auth");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function jsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

function weightedAverage(rows, valueKey = "score") {
  const available = rows.filter((row) => row[valueKey] !== null && row[valueKey] !== undefined);
  const totalWeight = available.reduce((sum, row) => sum + Number(row.weight), 0);
  if (!totalWeight) return null;
  return Math.round(available.reduce((sum, row) => sum + Number(row[valueKey]) * Number(row.weight), 0) / totalWeight * 100) / 100;
}

function applyRecovery(base, recovery, policy) {
  if (base === null || recovery === null) return base ?? recovery;
  return policy === "average"
    ? Math.round((base + recovery) * 50) / 100
    : Math.max(base, recovery);
}

async function getUser(req) {
  const id = await getSessionUserId(req);
  if (!id) return null;
  const rows = await sql`SELECT id, name, account_type FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

async function adminSetup(res) {
  const [years, classes, students, teachers, subjects] = await Promise.all([
    sql`SELECT y.*, COALESCE(json_agg(json_build_object('id', p.id, 'name', p.name, 'sequence', p.sequence,
          'starts_on', p.starts_on, 'ends_on', p.ends_on, 'weight', p.weight, 'status', p.status)
          ORDER BY p.sequence) FILTER (WHERE p.id IS NOT NULL), '[]'::json) AS periods
      FROM academic_years y LEFT JOIN grading_periods p ON p.academic_year_id = y.id
      GROUP BY y.id ORDER BY y.starts_on DESC`,
    sql`SELECT c.*, y.name AS academic_year_name,
        (SELECT COUNT(*)::int FROM student_enrollments e WHERE e.class_group_id = c.id AND e.status = 'active') AS student_count
      FROM class_groups c JOIN academic_years y ON y.id = c.academic_year_id
      ORDER BY y.starts_on DESC, c.name`,
    sql`SELECT id, name, email FROM users WHERE account_type = 'Aluno' ORDER BY name LIMIT 1000`,
    sql`SELECT id, name, email FROM users WHERE account_type = 'Professor' ORDER BY name LIMIT 500`,
    sql`SELECT id, slug, name FROM subjects ORDER BY name`
  ]);
  return res.status(200).json({ years, classes, students, teachers, subjects });
}

async function createYear(body, res) {
  const name = String(body.name || "").trim();
  const startsOn = String(body.startsOn || "").trim();
  const endsOn = String(body.endsOn || "").trim();
  const passingScore = Number(body.passingScore ?? 6);
  const periodRecoveryPolicy = String(body.periodRecoveryPolicy || "higher");
  const finalRecoveryPolicy = String(body.finalRecoveryPolicy || "higher");
  if (name.length < 2 || name.length > 80) return res.status(400).json({ error: "Informe um nome de ano letivo com 2 a 80 caracteres." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn) || endsOn < startsOn) return res.status(400).json({ error: "Informe datas válidas para o ano letivo." });
  if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 10) return res.status(400).json({ error: "A média de aprovação deve estar entre 0 e 10." });
  if (!["higher", "average"].includes(periodRecoveryPolicy) || !["higher", "average"].includes(finalRecoveryPolicy)) return res.status(400).json({ error: "Política de recuperação inválida." });
  const rows = await sql`INSERT INTO academic_years (name, starts_on, ends_on, passing_score, period_recovery_policy, final_recovery_policy)
    VALUES (${name}, ${startsOn}, ${endsOn}, ${passingScore}, ${periodRecoveryPolicy}, ${finalRecoveryPolicy}) RETURNING *`;
  return res.status(201).json({ year: rows[0] });
}

async function createPeriod(body, res) {
  const yearId = String(body.academicYearId || "");
  const name = String(body.name || "").trim();
  const sequence = Number(body.sequence);
  const startsOn = String(body.startsOn || "");
  const endsOn = String(body.endsOn || "");
  const weight = Number(body.weight ?? 1);
  if (!UUID.test(yearId)) return res.status(400).json({ error: "Selecione um ano letivo válido." });
  if (name.length < 2 || name.length > 80 || !Number.isInteger(sequence) || sequence < 1) return res.status(400).json({ error: "Informe o nome e a ordem do período." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn) || endsOn < startsOn) return res.status(400).json({ error: "Informe datas válidas para o período." });
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) return res.status(400).json({ error: "O peso do período deve ser maior que zero." });
  const validYear = await sql`SELECT id FROM academic_years WHERE id = ${yearId} AND status <> 'closed'
    AND starts_on <= ${startsOn}::date AND ends_on >= ${endsOn}::date LIMIT 1`;
  if (!validYear.length) return res.status(400).json({ error: "As datas do período devem estar dentro do ano letivo." });
  const overlaps = await sql`SELECT id FROM grading_periods WHERE academic_year_id = ${yearId}
    AND daterange(starts_on, ends_on, '[]') && daterange(${startsOn}::date, ${endsOn}::date, '[]') LIMIT 1`;
  if (overlaps.length) return res.status(409).json({ error: "As datas do período se sobrepõem a outro período do mesmo ano." });
  const rows = await sql`INSERT INTO grading_periods (academic_year_id, name, sequence, starts_on, ends_on, weight)
    SELECT id, ${name}, ${sequence}, ${startsOn}, ${endsOn}, ${weight} FROM academic_years WHERE id = ${yearId} AND status <> 'closed'
    RETURNING *`;
  if (!rows.length) return res.status(404).json({ error: "Ano letivo não encontrado ou encerrado." });
  return res.status(201).json({ period: rows[0] });
}

async function createClass(body, res) {
  const yearId = String(body.academicYearId || "");
  const name = String(body.name || "").trim();
  const gradeLevel = String(body.gradeLevel || "").trim() || null;
  if (!UUID.test(yearId) || name.length < 2 || name.length > 100) return res.status(400).json({ error: "Informe um ano letivo e o nome da turma." });
  const rows = await sql`INSERT INTO class_groups (academic_year_id, name, grade_level)
    SELECT id, ${name}, ${gradeLevel} FROM academic_years WHERE id = ${yearId} AND status <> 'closed' RETURNING *`;
  if (!rows.length) return res.status(404).json({ error: "Ano letivo não encontrado ou encerrado." });
  return res.status(201).json({ classGroup: rows[0] });
}

async function updatePeriodStatus(body, res) {
  const periodId = String(body.periodId || "");
  const status = String(body.status || "");
  if (!UUID.test(periodId) || !["open", "closed"].includes(status)) return res.status(400).json({ error: "Período ou estado inválido." });
  if (status === "closed") {
    const incomplete = await sql`SELECT 1 FROM grading_periods p
      JOIN class_groups c ON c.academic_year_id = p.academic_year_id AND c.status = 'active'
      JOIN course_offerings o ON o.class_group_id = c.id AND o.status = 'active'
      WHERE p.id = ${periodId} AND (
        NOT EXISTS (SELECT 1 FROM assessments a WHERE a.course_offering_id = o.id AND a.grading_period_id = p.id
          AND a.assessment_type = 'regular' AND a.status = 'published')
        OR (SELECT COALESCE(SUM(ac.weight_percent), 0) FROM assessment_components ac
          WHERE ac.course_offering_id = o.id AND ac.grading_period_id = p.id) <> 100
        OR EXISTS (SELECT 1 FROM assessment_components ac WHERE ac.course_offering_id = o.id AND ac.grading_period_id = p.id
          AND NOT EXISTS (SELECT 1 FROM assessments a WHERE a.component_id = ac.id AND a.assessment_type = 'regular' AND a.status = 'published'))
        OR EXISTS (SELECT 1 FROM assessments a JOIN student_enrollments se ON se.class_group_id = c.id AND se.status = 'active'
          LEFT JOIN grades g ON g.assessment_id = a.id AND g.enrollment_id = se.id
          WHERE a.course_offering_id = o.id AND a.grading_period_id = p.id
            AND a.status = 'published' AND (g.id IS NULL OR g.grade_status = 'pending'))
      ) LIMIT 1`;
    if (incomplete.length) return res.status(409).json({ error: "Há disciplinas com componentes incompletos, pesos diferentes de 100%, avaliações não publicadas ou notas pendentes. Complete o diário antes de encerrar o período." });
  }
  const rows = await sql`UPDATE grading_periods p SET status = ${status}
    FROM academic_years y WHERE p.id = ${periodId} AND p.academic_year_id = y.id AND y.status <> 'closed'
    RETURNING p.id, p.status`;
  if (!rows.length) return res.status(404).json({ error: "Período não encontrado ou ano letivo encerrado." });
  return res.status(200).json({ period: rows[0] });
}

async function updateYearStatus(body, res) {
  const yearId = String(body.academicYearId || "");
  const status = String(body.status || "");
  if (!UUID.test(yearId) || !["draft", "active", "closed"].includes(status)) return res.status(400).json({ error: "Ano letivo ou estado inválido." });
  if (status === "closed") {
    const periodStatus = await sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status <> 'closed')::int AS open
      FROM grading_periods WHERE academic_year_id = ${yearId}`;
    if (!periodStatus[0]?.total) return res.status(409).json({ error: "Cadastre e feche os períodos antes de encerrar o ano letivo." });
    if (periodStatus[0].open) return res.status(409).json({ error: "Feche todos os períodos antes de encerrar o ano letivo." });
  }
  const rows = await sql`UPDATE academic_years SET status = ${status}, updated_at = NOW() WHERE id = ${yearId} RETURNING id, status`;
  if (!rows.length) return res.status(404).json({ error: "Ano letivo não encontrado." });
  return res.status(200).json({ year: rows[0] });
}

async function enrollStudent(body, res) {
  const classId = String(body.classGroupId || "");
  const studentId = String(body.studentId || "");
  if (!UUID.test(classId) || !UUID.test(studentId)) return res.status(400).json({ error: "Selecione uma turma e um aluno válidos." });
  const rows = await sql`INSERT INTO student_enrollments (class_group_id, academic_year_id, student_id)
    SELECT c.id, c.academic_year_id, u.id FROM class_groups c CROSS JOIN users u
    WHERE c.id = ${classId} AND c.status = 'active' AND u.id = ${studentId} AND u.account_type = 'Aluno'
    RETURNING *`;
  if (!rows.length) return res.status(404).json({ error: "Turma ativa ou aluno não encontrado." });
  return res.status(201).json({ enrollment: rows[0] });
}

async function assignCourse(body, res) {
  const classId = String(body.classGroupId || "");
  const subjectId = String(body.subjectId || "");
  const teacherId = String(body.teacherId || "");
  if (![classId, subjectId, teacherId].every((id) => UUID.test(id))) return res.status(400).json({ error: "Turma, disciplina e professor são obrigatórios." });
  const rows = await sql`INSERT INTO course_offerings (class_group_id, subject_id, teacher_id)
    SELECT c.id, s.id, u.id FROM class_groups c CROSS JOIN subjects s CROSS JOIN users u
    JOIN teacher_subjects ts ON ts.teacher_id = u.id AND ts.subject_id = s.id
    WHERE c.id = ${classId} AND c.status = 'active' AND s.id = ${subjectId} AND u.id = ${teacherId} AND u.account_type = 'Professor'
    RETURNING *`;
  if (!rows.length) return res.status(400).json({ error: "Atribuição inválida. O professor precisa estar vinculado à disciplina no painel administrativo." });
  return res.status(201).json({ offering: rows[0] });
}

async function listTeacherCourses(user, res) {
  const rows = await sql`SELECT o.id, o.class_group_id, c.name AS class_name, y.id AS academic_year_id,
      y.name AS academic_year_name, s.id AS subject_id, s.name AS subject_name,
      (SELECT COUNT(*)::int FROM student_enrollments e WHERE e.class_group_id = c.id AND e.status = 'active') AS student_count
    FROM course_offerings o JOIN class_groups c ON c.id = o.class_group_id
    JOIN academic_years y ON y.id = c.academic_year_id JOIN subjects s ON s.id = o.subject_id
    WHERE o.teacher_id = ${user.id} AND o.status = 'active' AND c.status = 'active'
    ORDER BY y.starts_on DESC, c.name, s.name`;
  return res.status(200).json({ courses: rows });
}

async function getCourseDetails(user, offeringId, res) {
  if (!UUID.test(offeringId)) return res.status(400).json({ error: "Turma e disciplina inválidas." });
  const offering = await sql`SELECT o.id, o.class_group_id, c.name AS class_name, c.academic_year_id,
      y.name AS academic_year_name, y.passing_score, y.period_recovery_policy, y.final_recovery_policy,
      y.status AS year_status, s.name AS subject_name
    FROM course_offerings o JOIN class_groups c ON c.id = o.class_group_id
    JOIN academic_years y ON y.id = c.academic_year_id JOIN subjects s ON s.id = o.subject_id
    WHERE o.id = ${offeringId} AND o.teacher_id = ${user.id} AND o.status = 'active' LIMIT 1`;
  if (!offering.length) return res.status(404).json({ error: "Turma não encontrada entre suas disciplinas." });
  const [periods, components, assessments, students, grades] = await Promise.all([
    sql`SELECT id, name, sequence, starts_on, ends_on, weight, status FROM grading_periods
      WHERE academic_year_id = ${offering[0].academic_year_id} ORDER BY sequence`,
    sql`SELECT id, grading_period_id, name, weight_percent, status FROM assessment_components
      WHERE course_offering_id = ${offeringId} ORDER BY grading_period_id, created_at`,
    sql`SELECT a.id, a.grading_period_id, a.component_id, c.name AS component_name,
        a.title, a.description, a.assessment_type, a.weight, a.due_at, a.status
      FROM assessments a LEFT JOIN assessment_components c ON c.id = a.component_id
      WHERE a.course_offering_id = ${offeringId} ORDER BY a.created_at DESC`,
    sql`SELECT e.id AS enrollment_id, u.id AS student_id, u.name AS student_name
      FROM student_enrollments e JOIN users u ON u.id = e.student_id
      WHERE e.class_group_id = ${offering[0].class_group_id} AND e.status = 'active' ORDER BY u.name`,
    sql`SELECT g.id, g.enrollment_id, g.assessment_id, g.score, g.grade_status, g.feedback
      FROM grades g JOIN assessments a ON a.id = g.assessment_id
      WHERE a.course_offering_id = ${offeringId}`
  ]);
  return res.status(200).json({ course: offering[0], periods, components, assessments, students, grades });
}

async function createComponent(user, body, res) {
  const offeringId = String(body.courseOfferingId || "");
  const periodId = String(body.gradingPeriodId || "");
  const name = String(body.name || "").trim();
  const weight = Number(body.weightPercent);
  if (!UUID.test(offeringId) || !UUID.test(periodId)) return res.status(400).json({ error: "Selecione uma turma e um período válidos." });
  if (name.length < 2 || name.length > 100) return res.status(400).json({ error: "O componente deve ter entre 2 e 100 caracteres." });
  if (!Number.isFinite(weight) || weight <= 0 || weight > 100 || Math.abs(weight * 100 - Math.round(weight * 100)) > 1e-8) return res.status(400).json({ error: "O peso deve estar entre 0 e 100%, com no máximo duas casas decimais." });
  const target = await sql`SELECT o.id FROM course_offerings o JOIN class_groups c ON c.id = o.class_group_id
    JOIN grading_periods p ON p.academic_year_id = c.academic_year_id
    WHERE o.id = ${offeringId} AND o.teacher_id = ${user.id} AND o.status = 'active'
      AND p.id = ${periodId} AND p.status = 'open' LIMIT 1`;
  if (!target.length) return res.status(404).json({ error: "Turma ou período não encontrado entre suas disciplinas." });
  const locked = await sql`SELECT id FROM assessment_components WHERE course_offering_id = ${offeringId}
    AND grading_period_id = ${periodId} AND status = 'locked' LIMIT 1`;
  if (locked.length) return res.status(409).json({ error: "A composição foi congelada depois da primeira publicação." });
  const total = await sql`SELECT COALESCE(SUM(weight_percent), 0)::numeric AS value FROM assessment_components
    WHERE course_offering_id = ${offeringId} AND grading_period_id = ${periodId}`;
  if (Number(total[0].value) + weight > 100) return res.status(400).json({ error: "A soma dos pesos dos componentes não pode ultrapassar 100%." });
  const rows = await sql`INSERT INTO assessment_components (course_offering_id, grading_period_id, name, weight_percent)
    VALUES (${offeringId}, ${periodId}, ${name}, ${weight}) RETURNING *`;
  return res.status(201).json({ component: rows[0] });
}

async function updateComponent(user, body, res) {
  const componentId = String(body.componentId || "");
  const name = String(body.name || "").trim();
  const weight = Number(body.weightPercent);
  if (!UUID.test(componentId)) return res.status(400).json({ error: "Componente inválido." });
  if (name.length < 2 || name.length > 100 || !Number.isFinite(weight) || weight <= 0 || weight > 100 || Math.abs(weight * 100 - Math.round(weight * 100)) > 1e-8) return res.status(400).json({ error: "Informe nome válido e peso entre 0 e 100%, com no máximo duas casas decimais." });
  const current = await sql`SELECT c.id, c.course_offering_id, c.grading_period_id FROM assessment_components c
    JOIN course_offerings o ON o.id = c.course_offering_id JOIN grading_periods p ON p.id = c.grading_period_id
    WHERE c.id = ${componentId} AND o.teacher_id = ${user.id} AND c.status = 'draft' AND p.status = 'open' LIMIT 1`;
  if (!current.length) return res.status(409).json({ error: "Componente não encontrado, bloqueado ou de período encerrado." });
  const total = await sql`SELECT COALESCE(SUM(weight_percent), 0)::numeric AS value FROM assessment_components
    WHERE course_offering_id = ${current[0].course_offering_id} AND grading_period_id = ${current[0].grading_period_id} AND id <> ${componentId}`;
  if (Number(total[0].value) + weight > 100) return res.status(400).json({ error: "A soma dos pesos dos componentes não pode ultrapassar 100%." });
  const rows = await sql`UPDATE assessment_components SET name = ${name}, weight_percent = ${weight}, updated_at = NOW()
    WHERE id = ${componentId} AND status = 'draft' RETURNING *`;
  if (!rows.length) return res.status(409).json({ error: "A composição foi congelada por uma publicação recente." });
  return res.status(200).json({ component: rows[0] });
}

async function deleteComponent(user, body, res) {
  const componentId = String(body.componentId || "");
  if (!UUID.test(componentId)) return res.status(400).json({ error: "Componente inválido." });
  const rows = await sql`DELETE FROM assessment_components c USING course_offerings o, grading_periods p
    WHERE c.id = ${componentId} AND c.course_offering_id = o.id AND o.teacher_id = ${user.id}
      AND c.grading_period_id = p.id AND c.status = 'draft' AND p.status = 'open'
      AND NOT EXISTS (SELECT 1 FROM assessments a WHERE a.component_id = c.id)
    RETURNING c.id`;
  if (!rows.length) return res.status(409).json({ error: "O componente está bloqueado, possui avaliações ou não pertence às suas turmas." });
  return res.status(200).json({ ok: true });
}

async function createAssessment(user, body, res) {
  const offeringId = String(body.courseOfferingId || "");
  const periodId = String(body.gradingPeriodId || "");
  const componentId = String(body.componentId || "");
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim() || null;
  const type = String(body.assessmentType || "regular");
  const weight = Number(body.weight ?? 1);
  const dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if (!UUID.test(offeringId) || title.length < 2 || title.length > 160) return res.status(400).json({ error: "Informe uma turma e um título válidos." });
  if (!["regular", "period_recovery", "final_recovery"].includes(type)) return res.status(400).json({ error: "Tipo de avaliação inválido." });
  if ((type === "final_recovery" && periodId) || (type !== "final_recovery" && !UUID.test(periodId))) return res.status(400).json({ error: "Selecione o período para esta avaliação." });
  if ((type === "regular" && !UUID.test(componentId)) || (type !== "regular" && componentId)) return res.status(400).json({ error: "Selecione um componente para a avaliação regular." });
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) return res.status(400).json({ error: "O peso da avaliação deve ser maior que zero." });
  if (body.dueAt && Number.isNaN(dueAt.getTime())) return res.status(400).json({ error: "Data de entrega inválida." });
  const course = await sql`SELECT o.id, c.academic_year_id FROM course_offerings o JOIN class_groups c ON c.id = o.class_group_id
    JOIN academic_years y ON y.id = c.academic_year_id WHERE o.id = ${offeringId} AND o.teacher_id = ${user.id}
      AND o.status = 'active' AND c.status = 'active' AND y.status <> 'closed' LIMIT 1`;
  if (!course.length) return res.status(404).json({ error: "Turma não encontrada ou ano letivo encerrado." });
  if (type !== "final_recovery") {
    const period = await sql`SELECT id FROM grading_periods WHERE id = ${periodId} AND academic_year_id = ${course[0].academic_year_id} AND status = 'open' LIMIT 1`;
    if (!period.length) return res.status(400).json({ error: "O período não pertence ao ano letivo ou está encerrado." });
  }
  if (type === "regular") {
    const component = await sql`SELECT id FROM assessment_components WHERE id = ${componentId}
      AND course_offering_id = ${offeringId} AND grading_period_id = ${periodId} LIMIT 1`;
    if (!component.length) return res.status(400).json({ error: "O componente não pertence a esta disciplina e período." });
  }
  if (type === "final_recovery") {
    const openPeriods = await sql`SELECT id FROM grading_periods WHERE academic_year_id = ${course[0].academic_year_id} AND status <> 'closed' LIMIT 1`;
    if (openPeriods.length) return res.status(409).json({ error: "Feche todos os períodos antes de criar a recuperação final." });
  }
  const created = await sql`INSERT INTO assessments (course_offering_id, grading_period_id, component_id, title, description, assessment_type, weight, due_at, created_by)
    VALUES (${offeringId}, ${periodId || null}, ${componentId || null}, ${title}, ${description}, ${type}, ${weight}, ${dueAt ? dueAt.toISOString() : null}, ${user.id}) RETURNING *`;
  return res.status(201).json({ assessment: created[0] });
}

async function updateGrade(user, body, res) {
  const assessmentId = String(body.assessmentId || "");
  const enrollmentId = String(body.enrollmentId || "");
  const score = body.score === "" || body.score === null || body.score === undefined ? null : Number(body.score);
  const gradeStatus = String(body.gradeStatus || (score === null ? "pending" : "scored"));
  const feedback = String(body.feedback || "").trim() || null;
  if (!UUID.test(assessmentId) || !UUID.test(enrollmentId)) return res.status(400).json({ error: "Avaliação ou matrícula inválida." });
  if (!["pending", "scored", "excused"].includes(gradeStatus)) return res.status(400).json({ error: "Situação da nota inválida." });
  if (gradeStatus === "scored" && score === null) return res.status(400).json({ error: "Informe uma nota para uma avaliação corrigida." });
  if (gradeStatus !== "scored" && score !== null) return res.status(400).json({ error: "Notas pendentes ou dispensadas não podem conter pontuação." });
  if (score !== null && (!Number.isFinite(score) || score < 0 || score > 10)) return res.status(400).json({ error: "A nota deve estar entre 0 e 10." });
  const target = await sql`SELECT a.id, a.status AS assessment_status, o.class_group_id, p.status AS period_status, y.status AS year_status
    FROM assessments a JOIN course_offerings o ON o.id = a.course_offering_id
    JOIN class_groups c ON c.id = o.class_group_id JOIN academic_years y ON y.id = c.academic_year_id
    LEFT JOIN grading_periods p ON p.id = a.grading_period_id
    JOIN student_enrollments e ON e.class_group_id = c.id AND e.id = ${enrollmentId} AND e.status = 'active'
    WHERE a.id = ${assessmentId} AND o.teacher_id = ${user.id} LIMIT 1`;
  if (!target.length) return res.status(404).json({ error: "A avaliação ou aluno não pertence a uma turma sua." });
  if (target[0].assessment_status === "closed" || target[0].period_status === "closed" || target[0].year_status === "closed") return res.status(409).json({ error: "Este período está encerrado e não aceita alterações." });
  const saved = await sql`WITH previous AS (
      SELECT id, score, grade_status, feedback, TRUE AS existed FROM grades WHERE assessment_id = ${assessmentId} AND enrollment_id = ${enrollmentId}
    ), changed AS (
      INSERT INTO grades (assessment_id, enrollment_id, score, grade_status, feedback, entered_by)
      VALUES (${assessmentId}, ${enrollmentId}, ${score}, ${gradeStatus}, ${feedback}, ${user.id})
      ON CONFLICT (assessment_id, enrollment_id) DO UPDATE SET score = EXCLUDED.score, grade_status = EXCLUDED.grade_status, feedback = EXCLUDED.feedback,
        entered_by = EXCLUDED.entered_by, updated_at = NOW()
      RETURNING *
    ), audit AS (
      INSERT INTO grade_change_log (grade_id, changed_by, previous_score, new_score, previous_grade_status, new_grade_status, previous_feedback, new_feedback)
      SELECT changed.id, ${user.id}, previous.score, changed.score, previous.grade_status, changed.grade_status, previous.feedback, changed.feedback
      FROM changed LEFT JOIN previous ON TRUE
      WHERE NOT COALESCE(previous.existed, FALSE)
        OR previous.score IS DISTINCT FROM changed.score OR previous.grade_status IS DISTINCT FROM changed.grade_status
        OR previous.feedback IS DISTINCT FROM changed.feedback
      RETURNING id
    ) SELECT changed.* FROM changed`;
  return res.status(200).json({ grade: saved[0] });
}

async function publishAssessment(user, body, res) {
  const id = String(body.assessmentId || "");
  if (!UUID.test(id)) return res.status(400).json({ error: "Avaliação inválida." });
  const target = await sql`SELECT a.id, a.assessment_type, a.component_id, a.grading_period_id, a.course_offering_id,
      y.id AS academic_year_id, p.status AS period_status, y.status AS year_status
    FROM assessments a JOIN course_offerings o ON o.id = a.course_offering_id
    JOIN class_groups c ON c.id = o.class_group_id JOIN academic_years y ON y.id = c.academic_year_id
    LEFT JOIN grading_periods p ON p.id = a.grading_period_id
    WHERE a.id = ${id} AND o.teacher_id = ${user.id} AND o.status = 'active' LIMIT 1`;
  if (!target.length || target[0].year_status === "closed" || target[0].period_status === "closed") return res.status(404).json({ error: "Avaliação não encontrada ou período encerrado." });
  if (target[0].assessment_type !== "final_recovery") {
    const totals = await sql`SELECT COALESCE(SUM(weight_percent), 0)::numeric AS value FROM assessment_components
      WHERE course_offering_id = ${target[0].course_offering_id} AND grading_period_id = ${target[0].grading_period_id}`;
    if (Number(totals[0].value) !== 100) return res.status(409).json({ error: "Os componentes avaliativos precisam somar exatamente 100% antes da publicação." });
    await sql`UPDATE assessment_components SET status = 'locked', updated_at = NOW()
      WHERE course_offering_id = ${target[0].course_offering_id} AND grading_period_id = ${target[0].grading_period_id}`;
  }
  const rows = await sql`UPDATE assessments a SET status = 'published', updated_at = NOW()
    FROM course_offerings o, class_groups c, academic_years y
    WHERE a.id = ${id} AND a.course_offering_id = o.id AND o.teacher_id = ${user.id} AND o.status = 'active'
      AND o.class_group_id = c.id AND c.academic_year_id = y.id AND y.status <> 'closed'
      AND (a.grading_period_id IS NULL OR EXISTS (SELECT 1 FROM grading_periods p WHERE p.id = a.grading_period_id AND p.status = 'open'))
    RETURNING a.id, a.status`;
  if (!rows.length) return res.status(404).json({ error: "Avaliação não encontrada ou período encerrado." });
  return res.status(200).json({ assessment: rows[0] });
}

async function studentReport(user, res) {
  const rows = await sql`SELECT e.id AS enrollment_id, c.name AS class_name, y.id AS year_id, y.name AS year_name,
      y.status AS year_status, y.passing_score, y.period_recovery_policy, y.final_recovery_policy,
      o.id AS offering_id, s.id AS subject_id, s.name AS subject_name,
      p.id AS period_id, p.name AS period_name, p.sequence, p.weight AS period_weight, p.status AS period_status,
      a.id AS assessment_id, a.component_id, ac.name AS component_name, ac.weight_percent AS component_weight,
      a.title AS assessment_title, a.assessment_type, a.weight AS assessment_weight,
      a.due_at, g.score, g.grade_status, g.feedback
    FROM student_enrollments e JOIN class_groups c ON c.id = e.class_group_id
    JOIN academic_years y ON y.id = c.academic_year_id
    JOIN course_offerings o ON o.class_group_id = c.id AND o.status = 'active'
    JOIN subjects s ON s.id = o.subject_id
    LEFT JOIN grading_periods p ON p.academic_year_id = y.id
    LEFT JOIN assessments a ON a.course_offering_id = o.id AND a.status = 'published'
      AND (a.grading_period_id = p.id OR (a.grading_period_id IS NULL AND a.assessment_type = 'final_recovery'))
    LEFT JOIN assessment_components ac ON ac.id = a.component_id
    LEFT JOIN grades g ON g.assessment_id = a.id AND g.enrollment_id = e.id
    WHERE e.student_id = ${user.id} AND e.status = 'active'
    ORDER BY y.starts_on DESC, s.name, p.sequence, a.created_at`;
  const reportMap = new Map();
  for (const row of rows) {
    const key = `${row.enrollment_id}:${row.offering_id}`;
    if (!reportMap.has(key)) reportMap.set(key, {
      yearId: row.year_id, year: row.year_name, yearStatus: row.year_status, className: row.class_name,
      subject: row.subject_name, passingScore: Number(row.passing_score), periodRecoveryPolicy: row.period_recovery_policy,
      finalRecoveryPolicy: row.final_recovery_policy, periods: new Map(), finalRecovery: null
    });
    const report = reportMap.get(key);
    if (row.assessment_type === "final_recovery") {
      if (row.score !== null) report.finalRecovery = Number(row.score);
      continue;
    }
    if (!row.period_id) {
      continue;
    }
    if (!report.periods.has(row.period_id)) report.periods.set(row.period_id, {
      id: row.period_id, name: row.period_name, sequence: Number(row.sequence), weight: Number(row.period_weight),
      status: row.period_status, components: new Map(), recovery: null, average: null
    });
    const period = report.periods.get(row.period_id);
    if (!row.assessment_id) continue;
    const assessment = {
      id: row.assessment_id, title: row.assessment_title, type: row.assessment_type,
      weight: Number(row.assessment_weight), score: row.score === null ? null : Number(row.score),
      feedback: row.feedback, gradeStatus: row.grade_status || (row.score === null ? "pending" : "scored"), dueAt: row.due_at
    };
    if (assessment.type === "period_recovery") period.recovery = assessment.score;
    else if (assessment.type === "regular" && row.component_id) {
      if (!period.components.has(row.component_id)) period.components.set(row.component_id, {
        id: row.component_id, name: row.component_name, weight: Number(row.component_weight), assessments: []
      });
      period.components.get(row.component_id).assessments.push(assessment);
    }
  }
  const reports = [...reportMap.values()].map((report) => {
    const periods = [...report.periods.values()].map((period) => {
      const components = [...period.components.values()].map((component) => ({
        ...component,
        average: weightedAverage(component.assessments, "score")
      }));
      const baseAverage = weightedAverage(components, "average");
      period.average = applyRecovery(baseAverage, period.recovery, report.periodRecoveryPolicy);
      return { ...period, components, baseAverage, average: period.average };
    });
    const allPeriodsEvaluated = periods.length > 0 && periods.every((period) => period.average !== null && period.status === "closed");
    const annualAverage = weightedAverage(periods, "average");
    const finalScore = allPeriodsEvaluated ? applyRecovery(annualAverage, report.finalRecovery, report.finalRecoveryPolicy) : null;
    const result = finalScore === null ? "in_progress"
      : finalScore >= report.passingScore ? "passed"
        : report.finalRecovery === null && report.yearStatus !== "closed" ? "recovery_pending" : "not_passed";
    return { ...report, periods, allPeriodsEvaluated, annualAverage, finalScore, result };
  });
  return res.status(200).json({ reports });
}

module.exports = async function handler(req, res) {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Não autenticado." });
    const action = String(req.query?.action || "").trim().toLowerCase();
    const body = jsonBody(req);

    if (req.method === "GET" && action === "setup") {
      if (user.account_type !== "Administrador") return res.status(403).json({ error: "Apenas administradores podem configurar o ano letivo." });
      return adminSetup(res);
    }
    if (req.method === "GET" && action === "courses") {
      if (user.account_type !== "Professor") return res.status(403).json({ error: "Área exclusiva para professores." });
      return listTeacherCourses(user, res);
    }
    if (req.method === "GET" && action === "course") {
      if (user.account_type !== "Professor") return res.status(403).json({ error: "Área exclusiva para professores." });
      return getCourseDetails(user, String(req.query?.offering || ""), res);
    }
    if (req.method === "GET" && action === "report") {
      if (user.account_type !== "Aluno") return res.status(403).json({ error: "O boletim está disponível para contas de aluno." });
      return studentReport(user, res);
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

    if (["create-year", "create-period", "create-class", "enroll-student", "assign-course", "update-period-status", "update-year-status"].includes(action)) {
      if (user.account_type !== "Administrador") return res.status(403).json({ error: "Apenas administradores podem configurar turmas e períodos." });
      if (action === "create-year") return createYear(body, res);
      if (action === "create-period") return createPeriod(body, res);
      if (action === "create-class") return createClass(body, res);
      if (action === "update-period-status") return updatePeriodStatus(body, res);
      if (action === "update-year-status") return updateYearStatus(body, res);
      if (action === "enroll-student") return enrollStudent(body, res);
      return assignCourse(body, res);
    }
    if (["create-component", "update-component", "delete-component", "create-assessment", "save-grade", "publish-assessment"].includes(action)) {
      if (user.account_type !== "Professor") return res.status(403).json({ error: "Apenas professores podem lançar notas." });
      if (action === "create-component") return createComponent(user, body, res);
      if (action === "update-component") return updateComponent(user, body, res);
      if (action === "delete-component") return deleteComponent(user, body, res);
      if (action === "create-assessment") return createAssessment(user, body, res);
      if (action === "save-grade") return updateGrade(user, body, res);
      return publishAssessment(user, body, res);
    }
    return res.status(400).json({ error: "Ação do boletim inválida." });
  } catch (error) {
    console.error("Gradebook API failed:", error);
    if (error?.code === "23505") return res.status(409).json({ error: "Já existe um registro com esses dados." });
    return res.status(500).json({ error: "Não foi possível concluir a operação do boletim." });
  }
};
