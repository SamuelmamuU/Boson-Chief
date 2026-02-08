-- ============================================
-- Enterprise Multi-Agent System Database Schema
-- MySQL 8.0+
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS enterprise_agent_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE enterprise_agent_system;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  availability ENUM('available', 'busy', 'focus', 'offline') DEFAULT 'available',
  cognitive_load INT DEFAULT 0 CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- User roles (separate table for security)
CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_role (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_roles_user (user_id)
) ENGINE=InnoDB;

-- Refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  health ENUM('healthy', 'at-risk', 'critical', 'blocked') DEFAULT 'healthy',
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  manager_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_projects_manager (manager_id),
  INDEX idx_projects_health (health),
  INDEX idx_projects_priority (priority)
) ENGINE=InnoDB;

-- Project members (many-to-many)
CREATE TABLE project_members (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_project_member (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project_members_project (project_id),
  INDEX idx_project_members_user (user_id)
) ENGINE=InnoDB;

-- ============================================
-- TASKS
-- ============================================

CREATE TABLE tasks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  project_id CHAR(36) NOT NULL,
  assigned_to CHAR(36),
  due_date DATE,
  estimated_hours INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tasks_project (project_id),
  INDEX idx_tasks_assigned (assigned_to),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_due_date (due_date)
) ENGINE=InnoDB;

-- ============================================
-- EVENTS (Timeline)
-- ============================================

CREATE TABLE events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  type ENUM('meeting', 'milestone', 'decision', 'conflict', 'insight', 'update', 'alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_events_project (project_id),
  INDEX idx_events_type (type),
  INDEX idx_events_created (created_at)
) ENGINE=InnoDB;

-- Event participants
CREATE TABLE event_participants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  
  UNIQUE KEY unique_event_participant (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_event_participants_event (event_id)
) ENGINE=InnoDB;

-- ============================================
-- CAPACITY PLANNING
-- ============================================

CREATE TABLE capacity_allocations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  project_id CHAR(36) NOT NULL,
  week_start DATE NOT NULL,
  hours_allocated INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_allocation (user_id, project_id, week_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_capacity_user (user_id),
  INDEX idx_capacity_project (project_id),
  INDEX idx_capacity_week (week_start)
) ENGINE=InnoDB;

-- ============================================
-- MEETINGS
-- ============================================

CREATE TABLE meetings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  project_id CHAR(36),
  created_by CHAR(36),
  location VARCHAR(500),
  meeting_type ENUM('internal', 'external', 'review', 'standup') DEFAULT 'internal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_meetings_project (project_id),
  INDEX idx_meetings_creator (created_by),
  INDEX idx_meetings_start (start_time),
  INDEX idx_meetings_end (end_time),
  INDEX idx_meetings_type (meeting_type)
) ENGINE=InnoDB;

-- Meeting participants
CREATE TABLE meeting_participants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  meeting_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_meeting_participant (meeting_id, user_id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meeting_participants_meeting (meeting_id),
  INDEX idx_meeting_participants_user (user_id)
) ENGINE=InnoDB;

-- ============================================
-- AI AGENT CHAT HISTORY (Optional)
-- ============================================

CREATE TABLE chat_sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  project_id CHAR(36),
  agent_type ENUM('global', 'local') DEFAULT 'global',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  INDEX idx_chat_sessions_user (user_id),
  INDEX idx_chat_sessions_project (project_id)
) ENGINE=InnoDB;

CREATE TABLE chat_messages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id CHAR(36) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  INDEX idx_chat_messages_session (session_id),
  INDEX idx_chat_messages_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Users with roles
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.avatar_url,
  u.availability,
  u.cognitive_load,
  u.created_at,
  u.updated_at,
  GROUP_CONCAT(ur.role) AS roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY u.id;

-- View: Meetings with details
CREATE OR REPLACE VIEW v_meetings_with_details AS
SELECT 
  m.id,
  m.title,
  m.description,
  m.start_time,
  m.end_time,
  m.location,
  m.meeting_type,
  m.created_at,
  m.updated_at,
  m.project_id,
  p.name AS project_name,
  m.created_by,
  u.full_name AS creator_name,
  u.avatar_url AS creator_avatar
FROM meetings m
LEFT JOIN projects p ON m.project_id = p.id
LEFT JOIN users u ON m.created_by = u.id;

-- View: Project summary
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.health,
  p.progress,
  p.priority,
  p.created_at,
  p.updated_at,
  u.full_name AS manager_name,
  (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS member_count,
  (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
  (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') AS completed_tasks
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Check if user has role
CREATE PROCEDURE check_user_role(
  IN p_user_id CHAR(36),
  IN p_role VARCHAR(20),
  OUT p_has_role BOOLEAN
)
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id AND role = p_role
  ) INTO p_has_role;
END //

-- Procedure: Get user's meetings for date range
CREATE PROCEDURE get_user_meetings(
  IN p_user_id CHAR(36),
  IN p_start_date DATETIME,
  IN p_end_date DATETIME
)
BEGIN
  SELECT DISTINCT m.*
  FROM meetings m
  LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
  WHERE (m.created_by = p_user_id OR mp.user_id = p_user_id)
    AND m.start_time >= p_start_date
    AND m.start_time <= p_end_date
  ORDER BY m.start_time;
END //

-- Procedure: Calculate user capacity for a week
CREATE PROCEDURE calculate_user_capacity(
  IN p_user_id CHAR(36),
  IN p_week_start DATE,
  OUT p_total_hours INT,
  OUT p_utilization_percent INT
)
BEGIN
  DECLARE v_available_hours INT DEFAULT 40;
  
  SELECT COALESCE(SUM(hours_allocated), 0) INTO p_total_hours
  FROM capacity_allocations
  WHERE user_id = p_user_id AND week_start = p_week_start;
  
  SET p_utilization_percent = ROUND((p_total_hours / v_available_hours) * 100);
END //

DELIMITER ;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert admin user (password: admin123 - use proper hashing in production!)
INSERT INTO users (id, email, password_hash, full_name, availability) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VB3sSi8L8z8K9a', 'System Admin', 'available');

INSERT INTO user_roles (user_id, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin');

-- Insert sample manager
INSERT INTO users (id, email, password_hash, full_name, availability) VALUES
('22222222-2222-2222-2222-222222222222', 'manager@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VB3sSi8L8z8K9a', 'Project Manager', 'available');

INSERT INTO user_roles (user_id, role) VALUES
('22222222-2222-2222-2222-222222222222', 'manager');

-- Insert sample project
INSERT INTO projects (id, name, description, health, progress, priority, manager_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Enterprise Migration Q2', 'Migrate legacy systems to cloud infrastructure', 'healthy', 45, 'high', '22222222-2222-2222-2222-222222222222');

COMMIT;
