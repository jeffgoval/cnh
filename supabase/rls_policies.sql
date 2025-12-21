-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- AgendaCNH Platform Security
-- =====================================================
-- Execute este arquivo no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vnnuwpgmzfqrzsameytl/sql/new
-- =====================================================

-- =====================================================
-- PROFILES TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role and document_verified)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id
    -- Prevent users from changing their own role or verification status
    AND (
        role = (SELECT role FROM profiles WHERE id = auth.uid())
        OR role IS NULL
    )
    AND (
        document_verified = (SELECT document_verified FROM profiles WHERE id = auth.uid())
        OR document_verified IS NULL
    )
);

-- Policy: Students can view instructor profiles (public info only)
CREATE POLICY "Students can view instructor profiles"
ON profiles FOR SELECT
TO authenticated
USING (
    role = 'INSTRUTOR'
    OR auth.uid() = id
);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Policy: New users can insert their own profile on signup
CREATE POLICY "Users can insert own profile on signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- =====================================================
-- INSTRUCTOR_ASSETS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE instructor_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Instructors can view their own assets
CREATE POLICY "Instructors can view own assets"
ON instructor_assets FOR SELECT
TO authenticated
USING (
    instructor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Policy: Instructors can insert their own assets
CREATE POLICY "Instructors can insert own assets"
ON instructor_assets FOR INSERT
TO authenticated
WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'INSTRUTOR'
    )
);

-- Policy: Instructors can update their own assets (but not verification_status)
CREATE POLICY "Instructors can update own assets"
ON instructor_assets FOR UPDATE
TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'INSTRUTOR'
    )
    -- Prevent changing verification_status
    AND (
        verification_status = (
            SELECT verification_status
            FROM instructor_assets
            WHERE instructor_id = auth.uid()
        )
        OR verification_status IS NULL
    )
);

-- Policy: Admins can update any instructor assets
CREATE POLICY "Admins can update instructor assets"
ON instructor_assets FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Policy: Students can view approved instructor assets (for booking)
CREATE POLICY "Students can view approved instructor assets"
ON instructor_assets FOR SELECT
TO authenticated
USING (
    verification_status = 'approved'
    OR instructor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- =====================================================
-- SLOTS TABLE (Instructor availability)
-- =====================================================

-- Enable RLS
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Policy: Instructors can view their own slots
CREATE POLICY "Instructors can view own slots"
ON slots FOR SELECT
TO authenticated
USING (
    instructor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('ALUNO', 'ADMIN')
    )
);

-- Policy: Instructors can insert their own slots
CREATE POLICY "Instructors can insert own slots"
ON slots FOR INSERT
TO authenticated
WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'INSTRUTOR'
    )
);

-- Policy: Instructors can update their own slots
CREATE POLICY "Instructors can update own slots"
ON slots FOR UPDATE
TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'INSTRUTOR'
    )
);

-- Policy: Instructors can delete their own slots (if not booked)
CREATE POLICY "Instructors can delete own unbooked slots"
ON slots FOR DELETE
TO authenticated
USING (
    instructor_id = auth.uid()
    AND is_booked = false
);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own appointments
CREATE POLICY "Students can view own appointments"
ON appointments FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR instructor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Policy: Students can create appointments for themselves
CREATE POLICY "Students can create own appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ALUNO'
    )
);

-- Policy: Students and instructors can update appointments (status changes)
CREATE POLICY "Participants can update appointments"
ON appointments FOR UPDATE
TO authenticated
USING (
    student_id = auth.uid()
    OR instructor_id = auth.uid()
)
WITH CHECK (
    student_id = auth.uid()
    OR instructor_id = auth.uid()
);

-- Policy: Only students can delete their own pending appointments
CREATE POLICY "Students can delete own pending appointments"
ON appointments FOR DELETE
TO authenticated
USING (
    student_id = auth.uid()
    AND status = 'pending'
);

-- =====================================================
-- AUDIT LOGGING
-- =====================================================

-- Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON admin_audit_log FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
);

-- Policy: System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
ON admin_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- TRIGGER FUNCTIONS FOR AUDIT LOGGING
-- =====================================================

-- Function to log admin approval/rejection of instructors
CREATE OR REPLACE FUNCTION log_instructor_asset_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.verification_status != NEW.verification_status) THEN
        INSERT INTO admin_audit_log (
            admin_id,
            action,
            target_table,
            target_id,
            old_value,
            new_value
        ) VALUES (
            auth.uid(),
            'UPDATE_VERIFICATION_STATUS',
            'instructor_assets',
            NEW.instructor_id,
            jsonb_build_object('verification_status', OLD.verification_status),
            jsonb_build_object('verification_status', NEW.verification_status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to instructor_assets table
DROP TRIGGER IF EXISTS audit_instructor_asset_changes ON instructor_assets;
CREATE TRIGGER audit_instructor_asset_changes
AFTER UPDATE ON instructor_assets
FOR EACH ROW
EXECUTE FUNCTION log_instructor_asset_changes();

-- =====================================================
-- VERIFICAÇÃO - Execute após aplicar tudo acima
-- =====================================================

-- Verificar se RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'instructor_assets', 'slots', 'appointments')
ORDER BY tablename;

-- Listar todas as policies criadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
