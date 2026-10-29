-- Gradebook: configurable school years, grading periods, classes, assessments and grades.
-- Run after schema.sql, admin-migration.sql and academic.sql. Safe to rerun.

CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE,
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    passing_score NUMERIC(4,2) NOT NULL DEFAULT 6.00 CHECK (passing_score BETWEEN 0 AND 10),
    period_recovery_policy VARCHAR(12) NOT NULL DEFAULT 'higher'
        CHECK (period_recovery_policy IN ('higher', 'average')),
    final_recovery_policy VARCHAR(12) NOT NULL DEFAULT 'higher'
        CHECK (final_recovery_policy IN ('higher', 'average')),
    status VARCHAR(12) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT academic_year_dates_check CHECK (ends_on >= starts_on)
);

CREATE TABLE IF NOT EXISTS grading_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    sequence INTEGER NOT NULL CHECK (sequence > 0),
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    weight NUMERIC(7,3) NOT NULL DEFAULT 1 CHECK (weight > 0),
    status VARCHAR(12) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT grading_period_dates_check CHECK (ends_on >= starts_on),
    CONSTRAINT grading_period_sequence_unique UNIQUE (academic_year_id, sequence),
    CONSTRAINT grading_period_name_unique UNIQUE (academic_year_id, name),
    CONSTRAINT grading_period_id_year_unique UNIQUE (id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS class_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(80),
    status VARCHAR(12) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT class_group_name_unique UNIQUE (academic_year_id, name),
    CONSTRAINT class_group_id_year_unique UNIQUE (id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_group_id UUID NOT NULL REFERENCES class_groups(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(12) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'transferred', 'withdrawn', 'completed')),
    enrolled_on DATE NOT NULL DEFAULT CURRENT_DATE,
    ended_on DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT student_enrollment_unique UNIQUE (class_group_id, student_id),
    CONSTRAINT student_enrollment_class_year_fk FOREIGN KEY (class_group_id, academic_year_id)
        REFERENCES class_groups(id, academic_year_id) ON DELETE RESTRICT,
    CONSTRAINT student_enrollment_dates_check CHECK (ended_on IS NULL OR ended_on >= enrolled_on),
    CONSTRAINT student_enrollment_id_class_unique UNIQUE (id, class_group_id)
);

CREATE TABLE IF NOT EXISTS course_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_group_id UUID NOT NULL REFERENCES class_groups(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(12) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT course_offering_class_subject_unique UNIQUE (class_group_id, subject_id),
    CONSTRAINT course_offering_id_class_unique UNIQUE (id, class_group_id)
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE RESTRICT,
    grading_period_id UUID REFERENCES grading_periods(id) ON DELETE RESTRICT,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    assessment_type VARCHAR(20) NOT NULL DEFAULT 'regular'
        CHECK (assessment_type IN ('regular', 'period_recovery', 'final_recovery')),
    weight NUMERIC(7,3) NOT NULL DEFAULT 1 CHECK (weight > 0),
    due_at TIMESTAMPTZ,
    status VARCHAR(12) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'closed')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT assessment_recovery_period_check CHECK (
        (assessment_type IN ('regular', 'period_recovery') AND grading_period_id IS NOT NULL)
        OR (assessment_type = 'final_recovery' AND grading_period_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE RESTRICT,
    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE RESTRICT,
    score NUMERIC(4,2) CHECK (score BETWEEN 0 AND 10),
    feedback TEXT,
    entered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT grade_per_assessment_student_unique UNIQUE (assessment_id, enrollment_id)
);

CREATE TABLE IF NOT EXISTS grade_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    previous_score NUMERIC(4,2),
    new_score NUMERIC(4,2),
    previous_feedback TEXT,
    new_feedback TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_periods_year_order ON grading_periods(academic_year_id, sequence);
CREATE INDEX IF NOT EXISTS idx_classes_year_status ON class_groups(academic_year_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_status ON student_enrollments(student_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_class_per_student_year
    ON student_enrollments(student_id, academic_year_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_offerings_teacher_status ON course_offerings(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_assessments_offering_period ON assessments(course_offering_id, grading_period_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_period_recovery_per_offering
    ON assessments(course_offering_id, grading_period_id) WHERE assessment_type = 'period_recovery';
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_final_recovery_per_offering
    ON assessments(course_offering_id) WHERE assessment_type = 'final_recovery';
CREATE INDEX IF NOT EXISTS idx_grades_enrollment ON grades(enrollment_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_grade_change_log_grade_date ON grade_change_log(grade_id, changed_at DESC);
