-- Add DELETE policies for students and student_courses tables
CREATE POLICY "Anyone can delete students" ON students FOR DELETE USING (true);
CREATE POLICY "Anyone can delete student_courses" ON student_courses FOR DELETE USING (true);