-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can modify courses" ON courses;
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Only admins can update students" ON students;
DROP POLICY IF EXISTS "Students can view their own courses" ON student_courses;
DROP POLICY IF EXISTS "Admins can view admin data" ON admin_users;

-- Create more permissive policies for development
CREATE POLICY "Anyone can modify courses" ON courses FOR ALL USING (true);
CREATE POLICY "Anyone can view students" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Anyone can view student_courses" ON student_courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view admin_users" ON admin_users FOR SELECT USING (true);