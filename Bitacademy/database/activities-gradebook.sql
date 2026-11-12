-- BitAcademy - Integração de Atividades com Turmas, Entregas e Diário de Classe/Boletim
-- Execute este script no Neon após academic.sql e gradebook.sql. O script é idempotente (seguro para reexecuções).

-- 1. Permitir que atividades se vinculem a uma turma/oferta específica, componente e avaliação do diário
ALTER TABLE activities
    ADD COLUMN IF NOT EXISTS course_offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS grading_period_id UUID REFERENCES grading_periods(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS component_id UUID REFERENCES assessment_components(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL;

-- 2. Tabela de submissões/entregas dos alunos para as atividades
CREATE TABLE IF NOT EXISTS activity_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    content TEXT,
    link TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    feedback TEXT,
    score NUMERIC(4,2) CHECK (score BETWEEN 0 AND 10),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT activity_submission_unique UNIQUE (activity_id, enrollment_id)
);

-- 3. Índices para performance de busca
CREATE INDEX IF NOT EXISTS idx_activities_course_offering ON activities(course_offering_id);
CREATE INDEX IF NOT EXISTS idx_activities_assessment ON activities(assessment_id);
CREATE INDEX IF NOT EXISTS idx_activity_submissions_activity ON activity_submissions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_submissions_enrollment ON activity_submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_activity_submissions_status ON activity_submissions(status);
