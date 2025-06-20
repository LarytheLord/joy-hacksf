export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'doctor' | 'client';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: 'doctor' | 'client';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: 'doctor' | 'client';
          created_at?: string;
          updated_at?: string;
        };
      };
      doctor_details: {
        Row: {
          user_id: string;
          practice_name: string;
          specialization: string;
        };
        Insert: {
          user_id: string;
          practice_name: string;
          specialization: string;
        };
        Update: {
          user_id?: string;
          practice_name?: string;
          specialization?: string;
        };
      };
      client_details: {
        Row: {
          user_id: string;
        };
        Insert: {
          user_id: string;
        };
        Update: {
          user_id?: string;
        };
      };
      doctor_availability_slots: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          is_recurring: boolean;
          recurrence_rule: string | null;
          day_of_week: number | null;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          is_recurring: boolean;
          recurrence_rule?: string | null;
          day_of_week?: number | null;
        };
        Update: {
          id?: string;
          start_time?: string;
          end_time?: string;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          day_of_week?: number | null;
        };
      };
      blocked_times: {
        Row: {
          id: string;
          start_time: string;
          end_time: string;
          reason: string;
        };
        Insert: {
          id?: string;
          start_time: string;
          end_time: string;
          reason: string;
        };
        Update: {
          id?: string;
          start_time?: string;
          end_time?: string;
          reason?: string;
        };
      };
      appointment_types: {
        Row: {
          id: string;
          name: string;
          duration_minutes: number;
        };
        Insert: {
          id?: string;
          name: string;
          duration_minutes: number;
        };
        Update: {
          id?: string;
          name?: string;
          duration_minutes?: number;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          appointment_type_id: string;
          start_time: string;
          end_time: string;
          status: 'booked' | 'completed' | 'cancelled_by_client' | 'cancelled_by_doctor';
          client_notes: string | null;
          doctor_notes_secure: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          appointment_type_id: string;
          start_time: string;
          end_time: string;
          status?: 'booked' | 'completed' | 'cancelled_by_client' | 'cancelled_by_doctor';
          client_notes?: string | null;
          doctor_notes_secure?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          appointment_type_id?: string;
          start_time?: string;
          end_time?: string;
          status?: 'booked' | 'completed' | 'cancelled_by_client' | 'cancelled_by_doctor';
          client_notes?: string | null;
          doctor_notes_secure?: string | null;
          created_at?: string;
        };
      };
      task_templates: {
        Row: {
          id: string;
          title: string;
          description: string;
          task_type: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
          template_content: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          task_type: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
          template_content: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          task_type?: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
          template_content?: any;
          created_at?: string;
        };
      };
      assigned_tasks: {
        Row: {
          id: string;
          task_template_id: string | null;
          client_id: string;
          title: string;
          description: string;
          task_type: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
          assigned_at: string;
          due_date: string;
          status: 'pending' | 'submitted' | 'reviewed' | 'overdue';
          submission_content: any | null;
          submission_file_path: string | null;
        };
        Insert: {
          id?: string;
          task_template_id?: string | null;
          client_id: string;
          title: string;
          description: string;
          task_type: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
          assigned_at?: string;
          due_date: string;
          status?: 'pending' | 'submitted' | 'reviewed' | 'overdue';
          submission_content?: any | null;
          submission_file_path?: string | null;
        };
        Update: {
          id?: string;
          task_template_id?: string | null;
          client_id?: string;
          title?: string;
          description?: string;
          task_type?: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
          assigned_at?: string;
          due_date?: string;
          status?: 'pending' | 'submitted' | 'reviewed' | 'overdue';
          submission_content?: any | null;
          submission_file_path?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          participant1_id: string;
          participant2_id: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant1_id: string;
          participant2_id: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant1_id?: string;
          participant2_id?: string;
          last_message_at?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          created_at?: string;
          is_read?: boolean;
        };
      };
    };
  };
}

export type UserRole = 'doctor' | 'client';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  appointment_type_id: string;
  start_time: string;
  end_time: string;
  status: 'booked' | 'completed' | 'cancelled_by_client' | 'cancelled_by_doctor';
  client_notes?: string;
  doctor_notes_secure?: string;
  created_at: string;
  client?: Profile;
  appointment_type?: {
    id: string;
    name: string;
    duration_minutes: number;
  };
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  task_type: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
  template_content: any;
  created_at: string;
}

export interface AssignedTask {
  id: string;
  task_template_id?: string;
  client_id: string;
  title: string;
  description: string;
  task_type: 'text_entry' | 'file_upload' | 'checkbox_list' | 'external_link';
  assigned_at: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'overdue';
  submission_content?: any;
  submission_file_path?: string;
  client?: Profile;
  task_template?: TaskTemplate;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
  participant1?: Profile;
  participant2?: Profile;
  last_message?: Message;
}