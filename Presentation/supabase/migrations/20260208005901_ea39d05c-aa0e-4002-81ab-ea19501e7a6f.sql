-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  location TEXT,
  meeting_type TEXT DEFAULT 'internal' CHECK (meeting_type IN ('internal', 'external', 'review', 'standup')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting participants junction table
CREATE TABLE public.meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for meetings
CREATE POLICY "Users can view meetings they participate in or created"
ON public.meetings FOR SELECT
USING (
  created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR id IN (
    SELECT meeting_id FROM meeting_participants mp
    JOIN profiles p ON mp.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
  OR project_id IN (
    SELECT project_id FROM project_members pm
    JOIN profiles p ON pm.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
  OR is_admin(auth.uid())
  OR is_manager(auth.uid())
);

CREATE POLICY "Users can create meetings"
ON public.meetings FOR INSERT
WITH CHECK (
  created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Meeting creators can update their meetings"
ON public.meetings FOR UPDATE
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Meeting creators can delete their meetings"
ON public.meetings FOR DELETE
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin(auth.uid()));

-- RLS policies for meeting participants
CREATE POLICY "Users can view participants of meetings they can see"
ON public.meeting_participants FOR SELECT
USING (
  meeting_id IN (SELECT id FROM meetings)
);

CREATE POLICY "Meeting creators can manage participants"
ON public.meeting_participants FOR INSERT
WITH CHECK (
  meeting_id IN (
    SELECT id FROM meetings 
    WHERE created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  OR is_admin(auth.uid())
);

CREATE POLICY "Meeting creators can update participants"
ON public.meeting_participants FOR UPDATE
USING (
  meeting_id IN (
    SELECT id FROM meetings 
    WHERE created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  OR is_admin(auth.uid())
);

CREATE POLICY "Meeting creators can delete participants"
ON public.meeting_participants FOR DELETE
USING (
  meeting_id IN (
    SELECT id FROM meetings 
    WHERE created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  OR is_admin(auth.uid())
);

-- Create trigger for updated_at using the correct function name
CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();