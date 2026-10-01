-- Homework Tracker Database Schema
-- For Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table (5 materias)
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert the 5 subjects (Semester 4)
INSERT OR IGNORE INTO subjects (name, description, color) VALUES
  ('Fisiología II', 'Dra. Giselle Vert', '#FF6B6B'),
  ('Bioquímica II', 'Dra. Andrea López', '#4ECDC4'),
  ('Bioética', 'Lic. Silvia Nuarte', '#95E1D3'),
  ('Epidemiología y Salud Pública', 'Dra. Andrea Isasi', '#F9CA24'),
  ('Nutrición', 'Sem 4', '#6C5CE7');

-- Homework table
CREATE TABLE IF NOT EXISTS homework (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Files/Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  homework_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (homework_id) REFERENCES homework(id)
);

-- Create indexes for better performance
CREATE INDEX idx_homework_user ON homework(user_id);
CREATE INDEX idx_homework_subject ON homework(subject_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_attachments_homework ON attachments(homework_id);
