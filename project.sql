-- All the sql table to run on Neon Database
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IDX_session_expire ON sessions(expire);

-- users
CREATE TABLE users (
  id VARCHAR PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- admin
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);


-- students
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  date_of_birth DATE,
  gender VARCHAR,
  nationality VARCHAR,
  address TEXT,
  grade_level VARCHAR,
  father_name VARCHAR,
  mother_name VARCHAR,
  guardian_phone VARCHAR,
  guardian_email VARCHAR,
  medical_conditions TEXT,
  special_needs TEXT,
  passport_photo TEXT, -- Base64 encoded image data
  status VARCHAR DEFAULT 'active', -- active, inactive, graduated, transferred
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- results
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR NOT NULL,
  session VARCHAR NOT NULL,
  term VARCHAR NOT NULL,
  class VARCHAR NOT NULL, -- JSS 1, JSS 2, JSS 3, SS 1, SS 2, SS 3
  subjects JSONB NOT NULL, -- Array of {subject, score, grade, remark}
  total_score INTEGER,
  average DECIMAL(5, 2),
  gpa DECIMAL(3, 2),
  position INTEGER,
  out_of INTEGER, -- Total students in class
  class_teacher VARCHAR,
  principal_comment TEXT,
  next_term_begins VARCHAR,
  attendance JSONB, -- {present, absent, total}
  psychomotor JSONB, -- {handWriting, drawing, painting, sports, speaking, handling}
  affective JSONB, -- {punctuality, attendance, attentiveness, neatness, politeness, honesty, relationship, selfControl, leadership}
  remarks TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);


-- Scratch Card
CREATE TABLE scratch_cards (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR UNIQUE NOT NULL,
  pin VARCHAR NOT NULL, -- Removed unique constraint to allow regeneration
  pin_hash VARCHAR NOT NULL, -- Encrypted/hashed PIN for security
  student_id VARCHAR, -- Link PIN to specific student (optional for now)
  status VARCHAR NOT NULL DEFAULT 'unused', -- unused, used, expired, deactivated
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  used_by VARCHAR,
  expiry_date TIMESTAMP NOT NULL,
  usage_limit INTEGER DEFAULT 30, -- Increased to 30 attempts
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- blog
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR NOT NULL,
  author VARCHAR,
  image_url VARCHAR,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- adminssion Application
CREATE TABLE admission_applications (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  date_of_birth DATE,
  gender VARCHAR,
  nationality VARCHAR,
  address TEXT,
  grade_level VARCHAR,
  preferred_start_date DATE,
  previous_school VARCHAR,
  previous_school_address TEXT,
  last_grade_completed VARCHAR,
  father_name VARCHAR,
  mother_name VARCHAR,
  father_occupation VARCHAR,
  mother_occupation VARCHAR,
  guardian_phone VARCHAR,
  guardian_email VARCHAR,
  medical_conditions TEXT,
  special_needs TEXT,
  heard_about_us VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- contact us
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  subject VARCHAR NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);


-- School Info
CREATE TABLE school_info (
  id SERIAL PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT now()
);



