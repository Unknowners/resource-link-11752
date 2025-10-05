-- Add foreign key relationship between team_ideas and profiles
ALTER TABLE public.team_ideas
ADD CONSTRAINT team_ideas_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;