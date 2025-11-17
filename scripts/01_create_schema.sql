-- Faculties (Fakultetlar)
CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Departments (Kafedralar/Katedra)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  description TEXT,
  head_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Teachers (O'qituvchilar)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  specialization_uz VARCHAR(255),
  specialization_ru VARCHAR(255),
  experience_years INT,
  photo_url VARCHAR(500),
  qr_code_data TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Reviews (Fikrlar/Sharhlar)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(255),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  teaching_quality INT CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  communication INT CHECK (communication >= 1 AND communication <= 5),
  professional_knowledge INT CHECK (professional_knowledge >= 1 AND professional_knowledge <= 5),
  approachability INT CHECK (approachability >= 1 AND approachability <= 5),
  anonymous BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Users (Foydalanuvchilar - Admin uchun)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer', -- 'admin', 'teacher', 'viewer'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_faculty_id ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_teachers_department_id ON teachers(department_id);
CREATE INDEX IF NOT EXISTS idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can read
CREATE POLICY "Enable read access for all users" ON faculties
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON departments
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON teachers
  FOR SELECT
  USING (true);

CREATE POLICY "Enable read access for all users" ON reviews
  FOR SELECT
  USING (true);

-- RLS Policies - Only authenticated users can write reviews
CREATE POLICY "Enable insert for authenticated users only" ON reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies - Admin can manage data
CREATE POLICY "Enable admin operations on faculties" ON faculties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Enable admin operations on departments" ON departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Enable admin operations on teachers" ON teachers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
