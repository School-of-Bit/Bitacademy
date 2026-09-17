-- BitAcademy - módulo acadêmico
-- Execute este arquivo uma vez no Neon antes de usar Materiais e Atividades.

CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_materials_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_materials_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    activity_type VARCHAR(20) NOT NULL DEFAULT 'manual',
    max_score NUMERIC(5,2) NOT NULL DEFAULT 10,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_activities_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT activities_type_check CHECK (activity_type IN ('automatic', 'manual')),
    CONSTRAINT activities_score_check CHECK (max_score > 0 AND max_score <= 100)
);

CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_teacher ON materials(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_subject ON activities(subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_teacher ON activities(teacher_id, created_at DESC);
