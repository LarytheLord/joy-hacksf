-- Knight Medicare Database Schema
-- This migration creates the complete database structure for the psychology practice app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('doctor', 'client');
CREATE TYPE appointment_status AS ENUM ('booked', 'completed', 'cancelled_by_client', 'cancelled_by_doctor');
CREATE TYPE task_type AS ENUM ('text_entry', 'file_upload', 'checkbox_list', 'external_link');
CREATE TYPE task_status AS ENUM ('pending', 'submitted', 'reviewed', 'overdue');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor details table
CREATE TABLE doctor_details (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  practice_name TEXT NOT NULL DEFAULT 'Knight Medicare',
  specialization TEXT NOT NULL DEFAULT 'Psychology'
);

-- Client details table
CREATE TABLE client_details (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY
);

-- Doctor availability slots
CREATE TABLE doctor_availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- iCal RRULE format
  day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked times
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment types
CREATE TABLE appointment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) NOT NULL,
  appointment_type_id UUID REFERENCES appointment_types(id) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'booked',
  client_notes TEXT,
  doctor_notes_secure TEXT, -- Only visible to doctor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task templates
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type task_type NOT NULL,
  template_content JSONB, -- Stores structure like checkbox items, prompts, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assigned tasks
CREATE TABLE assigned_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_template_id UUID REFERENCES task_templates(id), -- NULL for ad-hoc tasks
  client_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type task_type NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  status task_status DEFAULT 'pending',
  submission_content JSONB, -- Stores answers/responses
  submission_file_path TEXT, -- Path in Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES profiles(id) NOT NULL,
  participant2_id UUID REFERENCES profiles(id) NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_assigned_tasks_client_id ON assigned_tasks(client_id);
CREATE INDEX idx_assigned_tasks_status ON assigned_tasks(status);
CREATE INDEX idx_assigned_tasks_due_date ON assigned_tasks(due_date);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assigned_tasks_updated_at BEFORE UPDATE ON assigned_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Doctor details policies
CREATE POLICY "Anyone can view doctor details" ON doctor_details FOR SELECT USING (true);
CREATE POLICY "Only doctor can update their details" ON doctor_details FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);

-- Client details policies
CREATE POLICY "Clients can view their own details" ON client_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctor can view all client details" ON client_details FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Clients can insert their own details" ON client_details FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Doctor availability slots policies
CREATE POLICY "Anyone can view availability slots" ON doctor_availability_slots FOR SELECT USING (true);
CREATE POLICY "Only doctor can manage availability slots" ON doctor_availability_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);

-- Blocked times policies
CREATE POLICY "Anyone can view blocked times" ON blocked_times FOR SELECT USING (true);
CREATE POLICY "Only doctor can manage blocked times" ON blocked_times FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);

-- Appointment types policies
CREATE POLICY "Anyone can view appointment types" ON appointment_types FOR SELECT USING (true);
CREATE POLICY "Only doctor can manage appointment types" ON appointment_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);

-- Appointments policies
CREATE POLICY "Doctor can view all appointments" ON appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Clients can view their own appointments" ON appointments FOR SELECT USING (
  auth.uid() = client_id
);
CREATE POLICY "Clients can insert their own appointments" ON appointments FOR INSERT WITH CHECK (
  auth.uid() = client_id
);
CREATE POLICY "Doctor can update all appointments" ON appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Clients can update their own appointments" ON appointments FOR UPDATE USING (
  auth.uid() = client_id
);

-- Task templates policies
CREATE POLICY "Doctor can view all task templates" ON task_templates FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Only doctor can manage task templates" ON task_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);

-- Assigned tasks policies
CREATE POLICY "Doctor can view all assigned tasks" ON assigned_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Clients can view their own assigned tasks" ON assigned_tasks FOR SELECT USING (
  auth.uid() = client_id
);
CREATE POLICY "Only doctor can assign tasks" ON assigned_tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Doctor can update all assigned tasks" ON assigned_tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);
CREATE POLICY "Clients can update their own assigned tasks" ON assigned_tasks FOR UPDATE USING (
  auth.uid() = client_id
);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);
CREATE POLICY "Users can create conversations they participate in" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Insert default data

-- Insert default appointment types
INSERT INTO appointment_types (name, duration_minutes) VALUES
  ('Initial Consultation', 60),
  ('Therapy Session', 50),
  ('Follow-up', 30),
  ('Group Session', 90);

-- Insert sample task templates
INSERT INTO task_templates (title, description, task_type, template_content) VALUES
  (
    'Daily Mood Journal',
    'Track your daily mood and thoughts',
    'text_entry',
    '{"prompt": "Please describe your mood today and any significant thoughts or feelings you experienced."}'
  ),
  (
    'Anxiety Worksheet',
    'Complete the anxiety assessment worksheet',
    'file_upload',
    '{"instructions": "Download and complete the anxiety worksheet, then upload the completed form."}'
  ),
  (
    'Daily Activities Checklist',
    'Track your daily self-care activities',
    'checkbox_list',
    '{"items": ["Took medication", "Exercised for 30 minutes", "Practiced meditation", "Ate three meals", "Got 7+ hours of sleep", "Connected with a friend or family member"]}'
  ),
  (
    'Mindfulness Resources',
    'Review mindfulness and meditation resources',
    'external_link',
    '{"url": "https://www.headspace.com", "description": "Explore guided meditation exercises on Headspace"}'
  );

-- Create storage bucket for task files
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', false);

-- Storage policies for task files
CREATE POLICY "Users can upload their own task files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'task-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own task files" ON storage.objects FOR SELECT USING (
  bucket_id = 'task-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctor can view all task files" ON storage.objects FOR SELECT USING (
  bucket_id = 'task-files' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
);