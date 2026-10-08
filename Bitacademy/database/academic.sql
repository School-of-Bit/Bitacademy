-- BitAcademy - módulo acadêmico
-- Execute este arquivo no Neon para criar ou atualizar Materiais e Atividades.

CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID,
    subject_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    status VARCHAR(12) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    display_order INTEGER NOT NULL DEFAULT 1000,
    legacy_key VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_materials_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_materials_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT materials_status_check CHECK (status IN ('draft', 'published'))
);

-- Mantém materiais já existentes visíveis e habilita rascunhos para novos materiais.
ALTER TABLE materials ADD COLUMN IF NOT EXISTS status VARCHAR(12) NOT NULL DEFAULT 'published';
ALTER TABLE materials ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_status_check;
ALTER TABLE materials ADD CONSTRAINT materials_status_check CHECK (status IN ('draft', 'published'));
ALTER TABLE materials ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE materials ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS legacy_key VARCHAR(100);
UPDATE materials SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;

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

CREATE TABLE IF NOT EXISTS subject_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    resource_type VARCHAR(10) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(300),
    html_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT subject_resources_type_check CHECK (resource_type IN ('quiz', 'game')),
    CONSTRAINT subject_resources_subject_path_unique UNIQUE (subject_id, html_path)
);

CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_teacher ON materials(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_published_subject ON materials(subject_id, created_at DESC) WHERE status = 'published';
CREATE UNIQUE INDEX IF NOT EXISTS idx_materials_legacy_key ON materials(legacy_key) WHERE legacy_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_subject ON activities(subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_teacher ON activities(teacher_id, created_at DESC);

INSERT INTO subject_resources (subject_id, resource_type, title, description, html_path)
SELECT s.id, r.resource_type, r.title, r.description, r.html_path
FROM (VALUES
    ('artes', 'quiz', 'Quiz de Artes', 'Revise movimentos e conceitos artísticos.', 'Quiz/quiz-artes.html'),
    ('ciencias', 'quiz', 'Quiz de Ciências', 'Pratique Biologia, Química e Física.', 'Quiz/quiz-ciencias.html'),
    ('filosofia', 'quiz', 'Quiz de Filosofia', 'Teste conceitos de ética e pensamento crítico.', 'Quiz/quiz-filosofia.html'),
    ('geografia', 'quiz', 'Quiz de Geografia', 'Revise clima, relevo e espaço geográfico.', 'Quiz/quiz-geografia.html'),
    ('historia', 'quiz', 'Quiz de História', 'Pratique os períodos e processos históricos.', 'Quiz/quiz-historia.html'),
    ('ingles', 'quiz', 'Quiz de Inglês', 'Pratique vocabulário e gramática.', 'Quiz/quiz-ingles.html'),
    ('matematica', 'quiz', 'Quiz de Matemática', 'Teste seus conhecimentos matemáticos.', 'Quiz/quiz-matematica.html'),
    ('matematica', 'game', 'Matemática Infinita', 'Resolva desafios contra o relógio.', 'Jogos/matematica-infinita.html'),
    ('portugues', 'quiz', 'Quiz de Português', 'Pratique leitura, gramática e interpretação.', 'Quiz/quiz-portugues.html')
) AS r(subject_slug, resource_type, title, description, html_path)
JOIN subjects s ON s.slug = r.subject_slug
ON CONFLICT (subject_id, html_path) DO NOTHING;
