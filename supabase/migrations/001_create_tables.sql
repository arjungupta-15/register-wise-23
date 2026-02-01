-- Create courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  fee TEXT NOT NULL,
  center TEXT NOT NULL CHECK (center IN ('rajasthan', 'centerexam', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  address TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  obtained_marks INTEGER,
  total_marks INTEGER,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_marks > 0 THEN ROUND((obtained_marks::DECIMAL / total_marks::DECIMAL) * 100, 2)
      ELSE NULL 
    END
  ) STORED,
  aadhaar TEXT NOT NULL,
  caste TEXT NOT NULL CHECK (caste IN ('general', 'obc', 'sc', 'st')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  center TEXT NOT NULL CHECK (center IN ('rajasthan', 'centerexam', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_courses junction table
CREATE TABLE student_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Create admin_users table for authentication
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name) VALUES 
('admin@scrs.com', '$2b$10$rQZ8kHWf5r.Yk6.eR8.8aeJ8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8', 'Admin User');

-- Insert default courses
INSERT INTO courses (id, name, duration, fee, center, description) VALUES 
-- Rajasthan Center Courses
('rs-cfa', 'Computer Fundamentals & Applications', '6 Months', '₹5,000', 'rajasthan', 'Basic computer skills and applications'),
('rs-dca', 'Diploma in Computer Applications', '1 Year', '₹12,000', 'rajasthan', 'Comprehensive computer applications course'),
('rs-pgdca', 'PG Diploma in Computer Applications', '1 Year', '₹18,000', 'rajasthan', 'Advanced computer applications for graduates'),
('rs-tally', 'Tally & Accounting', '3 Months', '₹4,000', 'rajasthan', 'Accounting software training'),
('rs-web', 'Web Development', '6 Months', '₹8,000', 'rajasthan', 'HTML, CSS, JavaScript web development'),
('rs-python', 'Python Programming', '4 Months', '₹6,000', 'rajasthan', 'Python programming language course'),

-- Center Exam Courses
('ce-ccc', 'CCC (Course on Computer Concepts)', '3 Months', '₹3,500', 'centerexam', 'Government certified computer course'),
('ce-bcc', 'BCC (Basic Computer Course)', '2 Months', '₹2,500', 'centerexam', 'Basic computer literacy course'),
('ce-acc', 'ACC (Advanced Computer Course)', '4 Months', '₹5,500', 'centerexam', 'Advanced computer skills certification'),
('ce-nielit', 'NIELIT Courses', '6 Months', '₹8,000', 'centerexam', 'National Institute of Electronics & IT courses'),
('ce-doeacc', 'DOEACC Courses', '1 Year', '₹15,000', 'centerexam', 'Department of Electronics & Accreditation courses'),
('ce-typing', 'Typing & Stenography', '3 Months', '₹3,000', 'centerexam', 'Professional typing and stenography skills'),

-- Other Center Courses
('ot-bca', 'Bachelor in Computer Applications', '3 Years', '₹45,000/year', 'other', 'Undergraduate degree in computer applications'),
('ot-mca', 'Master in Computer Applications', '2 Years', '₹55,000/year', 'other', 'Postgraduate degree in computer applications'),
('ot-data', 'Data Science & Analytics', '1 Year', '₹25,000', 'other', 'Data analysis and machine learning course'),
('ot-ai', 'Artificial Intelligence', '1 Year', '₹30,000', 'other', 'AI and machine learning specialization'),
('ot-cyber', 'Cyber Security', '6 Months', '₹15,000', 'other', 'Information security and ethical hacking'),
('ot-cloud', 'Cloud Computing', '6 Months', '₹12,000', 'other', 'AWS, Azure cloud platform training');

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for courses (public read and write for now)
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Anyone can modify courses" ON courses FOR ALL USING (true);

-- Create policies for students (allow all operations for now)
CREATE POLICY "Anyone can view students" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON students FOR UPDATE USING (true);

-- Create policies for student_courses (allow all operations for now)
CREATE POLICY "Anyone can view student_courses" ON student_courses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert student_courses" ON student_courses FOR INSERT WITH CHECK (true);

-- Create policies for admin_users (allow all operations for now)
CREATE POLICY "Anyone can view admin_users" ON admin_users FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();