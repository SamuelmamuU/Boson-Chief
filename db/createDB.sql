-- Creación de la base de datos y manejo de permisos.
--CREATE DATABASE IF NOT EXISTS boson_agent;

--USE boson_agent;

--CREATE USER IF NOT EXISTS 'boson_user'@'%' IDENTIFIED BY 'secure_password';

--GRANT ALL PRIVILEGES ON boson_agent.* TO 'boson_user'@'%';

--FLUSH PRIVILEGES;

-- 1. Crear tabla de usuarios
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  raw_user_meta_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de perfiles
CREATE TABLE profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  availability ENUM('available', 'busy', 'focus', 'offline') DEFAULT 'available',
  cognitive_load INTEGER DEFAULT 0 CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabla de roles
CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role),
  CONSTRAINT fk_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabla de proyectos
CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  health ENUM('healthy', 'at-risk', 'critical', 'blocked') DEFAULT 'healthy',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  manager_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_manager FOREIGN KEY (manager_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- 5. Tabla de miembros de proyecto
CREATE TABLE project_members (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  profile_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, profile_id),
  CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pm_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 6. Tabla de tareas
CREATE TABLE tasks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in-progress', 'completed', 'blocked') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  assigned_to CHAR(36),
  due_date DATE,
  estimated_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL
);

-- 7. Tabla de planificación de capacidad
CREATE TABLE capacity_allocations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36) NOT NULL,
  project_id CHAR(36) NOT NULL,
  week_start DATE NOT NULL,
  hours_allocated INTEGER DEFAULT 0 CHECK (hours_allocated >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(profile_id, project_id, week_start),
  CONSTRAINT fk_cap_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_cap_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 8. Tabla de eventos
CREATE TABLE events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  type ENUM('meeting', 'milestone', 'decision', 'conflict', 'insight', 'update', 'alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 9. Tabla de participantes de eventos
CREATE TABLE event_participants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id CHAR(36) NOT NULL,
  profile_id CHAR(36) NOT NULL,
  UNIQUE(event_id, profile_id),
  CONSTRAINT fk_ep_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_ep_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 10. Trigger para crear perfil automáticamente al insertar en 'users'
DELIMITER //

CREATE TRIGGER after_user_signup
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- Crear perfil
    INSERT INTO profiles (user_id, full_name, email)
    VALUES (
        NEW.id, 
        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(NEW.raw_user_meta_data, '$.full_name')), NEW.email), 
        NEW.email
    );
    
    -- Asignar rol por defecto
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'employee');
END//

DELIMITER ;