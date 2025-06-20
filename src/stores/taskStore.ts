import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AssignedTask, TaskTemplate } from '@/types/database';

interface TaskState {
  tasks: AssignedTask[];
  templates: TaskTemplate[];
  isLoading: boolean;
  fetchTasks: (clientId?: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  assignTask: (task: Omit<AssignedTask, 'id' | 'assigned_at'>) => Promise<void>;
  submitTask: (taskId: string, submission: any, filePath?: string) => Promise<void>;
  reviewTask: (taskId: string) => Promise<void>;
  createTemplate: (template: Omit<TaskTemplate, 'id' | 'created_at'>) => Promise<void>;
  updateTemplate: (templateId: string, updates: Partial<TaskTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  templates: [],
  isLoading: false,

  fetchTasks: async (clientId?: string) => {
    try {
      set({ isLoading: true });
      
      let query = supabase
        .from('assigned_tasks')
        .select(`
          *,
          client:profiles!assigned_tasks_client_id_fkey(*),
          task_template:task_templates(*)
        `)
        .order('due_date', { ascending: true });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ tasks: data || [] });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ templates: data || [] });
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  assignTask: async (task) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('assigned_tasks')
        .insert({
          ...task,
          assigned_at: new Date().toISOString(),
        })
        .select(`
          *,
          client:profiles!assigned_tasks_client_id_fkey(*),
          task_template:task_templates(*)
        `)
        .single();

      if (error) throw error;

      const { tasks } = get();
      set({ tasks: [...tasks, data] });
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  submitTask: async (taskId, submission, filePath) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('assigned_tasks')
        .update({
          status: 'submitted',
          submission_content: submission,
          submission_file_path: filePath,
        })
        .eq('id', taskId)
        .select(`
          *,
          client:profiles!assigned_tasks_client_id_fkey(*),
          task_template:task_templates(*)
        `)
        .single();

      if (error) throw error;

      const { tasks } = get();
      set({
        tasks: tasks.map(task => 
          task.id === taskId ? data : task
        )
      });
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reviewTask: async (taskId) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('assigned_tasks')
        .update({ status: 'reviewed' })
        .eq('id', taskId)
        .select(`
          *,
          client:profiles!assigned_tasks_client_id_fkey(*),
          task_template:task_templates(*)
        `)
        .single();

      if (error) throw error;

      const { tasks } = get();
      set({
        tasks: tasks.map(task => 
          task.id === taskId ? data : task
        )
      });
    } catch (error) {
      console.error('Error reviewing task:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (template) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('task_templates')
        .insert({
          ...template,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const { templates } = get();
      set({ templates: [data, ...templates] });
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTemplate: async (templateId, updates) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('task_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      const { templates } = get();
      set({
        templates: templates.map(template => 
          template.id === templateId ? data : template
        )
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTemplate: async (templateId) => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      const { templates } = get();
      set({
        templates: templates.filter(template => template.id !== templateId)
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));