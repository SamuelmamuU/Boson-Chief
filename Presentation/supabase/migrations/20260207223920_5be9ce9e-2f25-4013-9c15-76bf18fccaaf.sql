-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'focus', 'offline')),
  cognitive_load INTEGER DEFAULT 0 CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  health TEXT DEFAULT 'healthy' CHECK (health IN ('healthy', 'at-risk', 'critical', 'blocked')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Project members junction table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id, profile_id)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  estimated_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Capacity planning table (for calendar grid)
CREATE TABLE public.capacity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  hours_allocated INTEGER DEFAULT 0 CHECK (hours_allocated >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(profile_id, project_id, week_start)
);

-- Events table (for timeline and activity tracking)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'milestone', 'decision', 'conflict', 'insight', 'update', 'alert')),
  title TEXT NOT NULL,
  description TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Event participants junction table
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(event_id, profile_id)
);

-- Helper function: Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Helper function: Check if user is manager
CREATE OR REPLACE FUNCTION public.is_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'manager')
$$;

-- Helper function: Check if user is project manager
CREATE OR REPLACE FUNCTION public.is_project_manager(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.profiles pr ON p.manager_id = pr.id
    WHERE p.id = _project_id AND pr.user_id = _user_id
  )
$$;

-- Helper function: Check if user is assigned to task
CREATE OR REPLACE FUNCTION public.is_task_assignee(_user_id UUID, _task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.profiles p ON t.assigned_to = p.id
    WHERE t.id = _task_id AND p.user_id = _user_id
  )
$$;

-- Helper function: Check if user is project member
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.profiles p ON pm.profile_id = p.id
    WHERE pm.project_id = _project_id AND p.user_id = _user_id
  )
$$;

-- Get user's profile id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_capacity_allocations_updated_at BEFORE UPDATE ON public.capacity_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  
  -- Default role is employee
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for projects
CREATE POLICY "Admins and managers can view all projects" ON public.projects
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid()) OR 
    public.is_project_member(auth.uid(), id)
  );

CREATE POLICY "Admins and managers can create projects" ON public.projects
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()) OR public.is_manager(auth.uid()));

CREATE POLICY "Admins and project managers can update projects" ON public.projects
  FOR UPDATE USING (public.is_admin(auth.uid()) OR public.is_project_manager(auth.uid(), id));

CREATE POLICY "Only admins can delete projects" ON public.projects
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for project_members
CREATE POLICY "View project members" ON public.project_members
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid()) OR 
    public.is_project_member(auth.uid(), project_id)
  );

CREATE POLICY "Manage project members" ON public.project_members
  FOR ALL USING (public.is_admin(auth.uid()) OR public.is_project_manager(auth.uid(), project_id));

-- RLS Policies for tasks
CREATE POLICY "View tasks" ON public.tasks
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid()) OR 
    public.is_project_member(auth.uid(), project_id) OR
    public.is_task_assignee(auth.uid(), id)
  );

CREATE POLICY "Create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid()) OR 
    public.is_project_manager(auth.uid(), project_id)
  );

CREATE POLICY "Update tasks" ON public.tasks
  FOR UPDATE USING (
    public.is_admin(auth.uid()) OR 
    public.is_project_manager(auth.uid(), project_id) OR
    public.is_task_assignee(auth.uid(), id)
  );

CREATE POLICY "Delete tasks" ON public.tasks
  FOR DELETE USING (
    public.is_admin(auth.uid()) OR 
    public.is_project_manager(auth.uid(), project_id)
  );

-- RLS Policies for capacity_allocations
CREATE POLICY "View capacity" ON public.capacity_allocations
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid())
  );

CREATE POLICY "Manage capacity" ON public.capacity_allocations
  FOR ALL USING (public.is_admin(auth.uid()) OR public.is_manager(auth.uid()));

-- RLS Policies for events
CREATE POLICY "View events" ON public.events
  FOR SELECT USING (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid()) OR 
    public.is_project_member(auth.uid(), project_id)
  );

CREATE POLICY "Create events" ON public.events
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.is_manager(auth.uid())
  );

-- RLS Policies for event_participants
CREATE POLICY "View event participants" ON public.event_participants
  FOR SELECT USING (true);

CREATE POLICY "Manage event participants" ON public.event_participants
  FOR ALL USING (public.is_admin(auth.uid()) OR public.is_manager(auth.uid()));