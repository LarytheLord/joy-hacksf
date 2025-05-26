-- Create result_type enum
CREATE TYPE public.result_type AS ENUM ('text', 'image', 'html_embed', 'video_url');

-- Create profiles table (extension of auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reels table
CREATE TABLE public.reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT,
  code_snippet TEXT NOT NULL,
  code_language TEXT NOT NULL,
  result_type result_type NOT NULL,
  result_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  reel_id UUID REFERENCES public.reels(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reel_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  reel_id UUID REFERENCES public.reels(id) NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Publicly readable, writable only by the owner
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Reels: Publicly readable, writable only by the owner
CREATE POLICY "Reels are viewable by everyone"
  ON public.reels
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reels"
  ON public.reels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels"
  ON public.reels
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels"
  ON public.reels
  FOR DELETE
  USING (auth.uid() = user_id);

-- Likes: Readable by all, writable/deletable only by the owner
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: Readable by all, writable by authenticated users, deletable/editable by the owner
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_reels_user_id ON public.reels(user_id);
CREATE INDEX idx_likes_reel_id ON public.likes(reel_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_comments_reel_id ON public.comments(reel_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);