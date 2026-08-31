-- ============================================
-- MVP PORTFOLIO DATABASE
-- Copy this entire script into DBeaver SQL Editor
-- ============================================

-- Drop existing tables (clean start)
DROP TABLE IF EXISTS project_skills CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS personal_info CASCADE;

-- ============================================
-- TABLE 1: USERS (Admin login)
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 2: PERSONAL INFO (About you)
-- ============================================
CREATE TABLE personal_info (
    info_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    bio TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    profile_image VARCHAR(255),
    resume_url VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 3: SKILLS (What you know)
-- ============================================
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
    icon_class VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 4: PROJECTS (Your work)
-- ============================================
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(50),
    featured BOOLEAN DEFAULT false,
    featured_image VARCHAR(255),
    technologies TEXT[] DEFAULT '{}',
    github_link VARCHAR(255),
    live_demo_link VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 5: PROJECT SKILLS (Link projects to skills)
-- ============================================
CREATE TABLE project_skills (
    project_skill_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE(project_id, skill_id)
);

-- ============================================
-- TABLE 6: EXPERIENCE (Work history)
-- ============================================
CREATE TABLE experiences (
    experience_id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 7: EDUCATION (Your degrees)
-- ============================================
CREATE TABLE education (
    education_id SERIAL PRIMARY KEY,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(200),
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    gpa DECIMAL(3,2),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 8: TESTIMONIALS (What people say)
-- ============================================
CREATE TABLE testimonials (
    testimonial_id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    client_position VARCHAR(100),
    client_company VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    client_image VARCHAR(255),
    is_approved BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 9: BLOG POSTS (Articles)
-- ============================================
CREATE TABLE blog_posts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 10: CONTACT MESSAGES (Form submissions)
-- ============================================
CREATE TABLE contact_messages (
    message_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES (For speed)
-- ============================================
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at) WHERE is_published = true;
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Admin (password: admin123)
INSERT INTO users (username, email, password_hash, full_name) VALUES
('admin', 'admin@portfolio.com', '$2a$10$H7P6Yq5X3ZR2W1V9U8I7O6E5D4C3B2A1Z0X9C8V7B6N5M4L3K2J1H0G9F8', 'John Doe');

-- Personal Info
INSERT INTO personal_info (full_name, title, bio, email, github_url, linkedin_url) VALUES
('John Doe', 'Full Stack Developer', 'Building awesome web applications. 5+ years experience.', 'john@portfolio.com', 'https://github.com/johndoe', 'https://linkedin.com/in/johndoe');

-- Skills
INSERT INTO skills (name, category, proficiency, icon_class, display_order) VALUES
('JavaScript', 'programming', 90, 'devicon-javascript-plain', 1),
('React', 'programming', 85, 'devicon-react-original', 2),
('Node.js', 'programming', 80, 'devicon-nodejs-plain', 3),
('Python', 'programming', 75, 'devicon-python-plain', 4),
('HTML5', 'programming', 95, 'devicon-html5-plain', 5),
('CSS3', 'programming', 90, 'devicon-css3-plain', 6),
('PostgreSQL', 'database', 75, 'devicon-postgresql-plain', 7),
('MongoDB', 'database', 70, 'devicon-mongodb-plain', 8),
('Figma', 'design', 65, 'devicon-figma-plain', 9),
('Photoshop', 'design', 60, 'devicon-photoshop-plain', 10);

-- Projects
INSERT INTO projects (title, slug, description, content, category, featured, featured_image, technologies, github_link, live_demo_link, display_order) VALUES
('E-Commerce Platform', 'ecommerce-platform', 'Full-featured e-commerce website', 'Detailed project description...', 'Web App', true, '/images/projects/ecommerce.jpg', ARRAY['React', 'Node.js', 'MongoDB'], 'https://github.com/johndoe/ecommerce', 'https://ecommerce-demo.com', 1),
('Portfolio Dashboard', 'portfolio-dashboard', 'Admin dashboard for portfolio', 'Detailed project description...', 'Web App', true, '/images/projects/dashboard.jpg', ARRAY['React', 'TypeScript', 'PostgreSQL'], 'https://github.com/johndoe/dashboard', 'https://dashboard-demo.com', 2),
('Mobile App UI Kit', 'mobile-app-ui-kit', 'Modern UI kit for mobile', 'Detailed project description...', 'Design', false, '/images/projects/uikit.jpg', ARRAY['Figma', 'Sketch'], NULL, 'https://uikit-demo.com', 3);

-- Project Skills
INSERT INTO project_skills (project_id, skill_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 8),
(2, 1), (2, 2), (2, 3), (2, 7),
(3, 9), (3, 10);

-- Experience
INSERT INTO experiences (company_name, position, location, description, start_date, end_date, is_current, display_order) VALUES
('Tech Corp', 'Senior Full Stack Developer', 'San Francisco, CA', 'Leading development of enterprise web applications. Built scalable solutions using React and Node.js.', '2023-01-01', NULL, true, 1),
('Web Solutions Inc', 'Full Stack Developer', 'New York, NY', 'Built and maintained 20+ client websites. Improved performance by 60%.', '2020-06-01', '2022-12-31', false, 2);

-- Education
INSERT INTO education (institution, degree, field_of_study, location, start_date, end_date, gpa, display_order) VALUES
('Stanford University', 'B.S. Computer Science', 'Computer Science', 'Stanford, CA', '2016-09-01', '2020-06-30', 3.8, 1),
('MIT', 'M.S. Software Engineering', 'Software Engineering', 'Cambridge, MA', '2020-09-01', '2022-06-30', 3.9, 2);

-- Testimonials
INSERT INTO testimonials (client_name, client_position, client_company, content, rating, display_order) VALUES
('Sarah Johnson', 'CTO', 'Tech Corp', 'John delivered our project ahead of schedule. Exceptional developer!', 5, 1),
('Mike Chen', 'Product Manager', 'Web Solutions Inc', 'A pleasure to work with. Understands business needs perfectly.', 5, 2);

-- Blog Posts
INSERT INTO blog_posts (title, slug, excerpt, content, tags, is_published, published_at) VALUES
('Web Development Trends 2024', 'web-development-trends-2024', 'Top trends in web development for 2024', 'Full blog content here...', ARRAY['trends', 'web-dev'], true, '2024-01-15 10:00:00'),
('React Performance Tips', 'react-performance-tips', 'Boost your React app performance', 'Full blog content here...', ARRAY['react', 'performance'], true, '2024-02-20 14:30:00');

-- Contact Messages (sample)
INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES
('Jane Smith', 'jane@example.com', 'Project Inquiry', 'I would like to discuss a potential project.', false);

-- ============================================
-- VIEWS (For easier queries)
-- ============================================

-- Projects with their skills
CREATE OR REPLACE VIEW project_details_view AS
SELECT 
    p.*,
    array_agg(DISTINCT s.name) as skill_names
FROM projects p
LEFT JOIN project_skills ps ON p.project_id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.skill_id
GROUP BY p.project_id
ORDER BY p.display_order;

-- Featured projects
CREATE OR REPLACE VIEW featured_projects_view AS
SELECT * FROM project_details_view
WHERE featured = true
ORDER BY display_order;

-- Published blog posts
CREATE OR REPLACE VIEW published_blog_posts_view AS
SELECT * FROM blog_posts
WHERE is_published = true
ORDER BY published_at DESC;

-- Active testimonials
CREATE OR REPLACE VIEW active_testimonials_view AS
SELECT * FROM testimonials
WHERE is_approved = true
ORDER BY display_order;

-- ============================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_personal_info_updated_at 
    BEFORE UPDATE ON personal_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at 
    BEFORE UPDATE ON experiences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at 
    BEFORE UPDATE ON education 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFY INSTALLATION
-- ============================================

-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check data count
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM personal_info) as personal_info,
    (SELECT COUNT(*) FROM skills) as skills,
    (SELECT COUNT(*) FROM projects) as projects,
    (SELECT COUNT(*) FROM experiences) as experiences,
    (SELECT COUNT(*) FROM education) as education,
    (SELECT COUNT(*) FROM testimonials) as testimonials,
    (SELECT COUNT(*) FROM blog_posts) as blog_posts,
    (SELECT COUNT(*) FROM contact_messages) as contact_messages;

-- ============================================
-- DONE! MVP READY TO USE.
-- ============================================
