-- ============================================
-- NexusAI Enterprise Hub - MySQL Database Schema
-- ============================================
-- Run this script to create the complete database structure
-- Compatible with MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS nexusai_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nexusai_db;

-- ============================================
-- ENUM TYPE EQUIVALENTS (MySQL uses inline ENUMs)
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    availability ENUM('available', 'busy', 'away', 'offline') DEFAULT 'available',
    cognitive_load INT DEFAULT 0 CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_availability (availability)
) ENGINE=InnoDB;

-- ============================================
-- USER ROLES TABLE (Separate for security)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    role ENUM('manager', 'employee') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_roles_user (user_id),
    INDEX idx_user_roles_role (role)
) ENGINE=InnoDB;

-- ============================================
-- PROJECTS TABLE (Knowledge Cells)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    health ENUM('healthy', 'at-risk', 'critical', 'blocked') DEFAULT 'healthy',
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    manager_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_projects_manager (manager_id),
    INDEX idx_projects_health (health),
    INDEX idx_projects_priority (priority)
) ENGINE=InnoDB;

-- ============================================
-- PROJECT MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_member (project_id, user_id),
    INDEX idx_project_members_project (project_id),
    INDEX idx_project_members_user (user_id)
) ENGINE=InnoDB;

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    project_id VARCHAR(36) NOT NULL,
    assigned_to VARCHAR(36) NULL,
    due_date DATETIME NULL,
    estimated_hours DECIMAL(5,2) NULL,
    actual_hours DECIMAL(5,2) NULL,
    completed_at DATETIME NULL,
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
-- EVENTS TABLE (Event-based logging)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id VARCHAR(36) NOT NULL,
    type ENUM('meeting', 'milestone', 'decision', 'conflict', 'insight', 'update', 'alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    event_metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_events_project (project_id),
    INDEX idx_events_type (type),
    INDEX idx_events_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    location VARCHAR(255),
    meeting_type ENUM('internal', 'external', 'review', 'standup') DEFAULT 'internal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_meetings_project (project_id),
    INDEX idx_meetings_start (start_time),
    INDEX idx_meetings_created_by (created_by)
) ENGINE=InnoDB;

-- ============================================
-- MEETING PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meeting_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meeting_id VARCHAR(36) NOT NULL,
    profile_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
    responded_at DATETIME NULL,
    
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_participant (meeting_id, profile_id),
    INDEX idx_meeting_participants_meeting (meeting_id),
    INDEX idx_meeting_participants_profile (profile_id)
) ENGINE=InnoDB;

-- ============================================
-- CAPACITY ALLOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS capacity_allocations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    week_start DATE NOT NULL,
    hours_allocated DECIMAL(5,2) DEFAULT 0 CHECK (hours_allocated >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_allocation (profile_id, project_id, week_start),
    INDEX idx_allocations_profile (profile_id),
    INDEX idx_allocations_project (project_id),
    INDEX idx_allocations_week (week_start)
) ENGINE=InnoDB;

-- ============================================
-- AI CHAT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NULL,
    agent_type ENUM('global', 'local') NOT NULL,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_chat_user (user_id),
    INDEX idx_chat_project (project_id),
    INDEX idx_chat_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- SESSION TOKENS TABLE (for JWT invalidation)
-- ============================================
CREATE TABLE IF NOT EXISTS session_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- User with roles view
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
    GROUP_CONCAT(ur.role) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY u.id;

-- Project summary view
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
    p.*,
    u.full_name as manager_name,
    (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as completed_task_count
FROM projects p
JOIN users u ON p.manager_id = u.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Check if user has specific role
CREATE PROCEDURE sp_has_role(
    IN p_user_id VARCHAR(36),
    IN p_role VARCHAR(20),
    OUT has_role BOOLEAN
)
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM user_roles 
        WHERE user_id = p_user_id AND role = p_role
    ) INTO has_role;
END //

-- Update project progress based on tasks
CREATE PROCEDURE sp_update_project_progress(IN p_project_id VARCHAR(36))
BEGIN
    DECLARE total_tasks INT;
    DECLARE completed_tasks INT;
    DECLARE new_progress INT;
    
    SELECT COUNT(*), SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)
    INTO total_tasks, completed_tasks
    FROM tasks WHERE project_id = p_project_id;
    
    IF total_tasks > 0 THEN
        SET new_progress = ROUND((completed_tasks / total_tasks) * 100);
    ELSE
        SET new_progress = 0;
    END IF;
    
    UPDATE projects SET progress = new_progress WHERE id = p_project_id;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Auto-update project progress when task status changes
CREATE TRIGGER tr_task_status_change
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        CALL sp_update_project_progress(NEW.project_id);
    END IF;
END //

-- Set completed_at when task is marked done
CREATE TRIGGER tr_task_completed
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        SET NEW.completed_at = NOW();
    ELSEIF NEW.status != 'done' AND OLD.status = 'done' THEN
        SET NEW.completed_at = NULL;
    END IF;
END //

-- Add manager as project member automatically
CREATE TRIGGER tr_project_created
AFTER INSERT ON projects
FOR EACH ROW
BEGIN
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.manager_id, 'owner');
END //

DELIMITER ;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert test users
INSERT INTO users (id, email, password_hash, full_name, availability, cognitive_load) VALUES
('user-001', 'john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HFh3JmV0wGGLji', 'John Doe', 'available', 45),
('user-002', 'jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HFh3JmV0wGGLji', 'Jane Smith', 'available', 30),
('user-003', 'bob.wilson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HFh3JmV0wGGLji', 'Bob Wilson', 'busy', 80);

-- Assign roles
INSERT INTO user_roles (user_id, role) VALUES
('user-001', 'manager'),
('user-001', 'employee'),
('user-002', 'employee'),
('user-003', 'employee');

-- Note: Default password for test users is "password123"
