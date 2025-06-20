import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Appointment } from '@/types/database';
import dayjs from 'dayjs';

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  fetchAppointments: (clientId?: string) => Promise<void>;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  cancelAppointment: (appointmentId: string, cancelledBy: 'client' | 'doctor') => Promise<void>;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,

  fetchAppointments: async (clientId?: string) => {
    try {
      set({ isLoading: true });
      
      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(*),
          appointment_type:appointment_types(*)
        `)
        .order('start_time', { ascending: true });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ appointments: data || [] });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  bookAppointment: async (appointment) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(*),
          appointment_type:appointment_types(*)
        `)
        .single();

      if (error) throw error;

      const { appointments } = get();
      set({ 
        appointments: [...appointments, data].sort((a, b) => 
          dayjs(a.start_time).unix() - dayjs(b.start_time).unix()
        )
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelAppointment: async (appointmentId, cancelledBy) => {
    try {
      set({ isLoading: true });
      
      const status = cancelledBy === 'client' ? 'cancelled_by_client' : 'cancelled_by_doctor';
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(*),
          appointment_type:appointment_types(*)
        `)
        .single();

      if (error) throw error;

      const { appointments } = get();
      set({
        appointments: appointments.map(apt => 
          apt.id === appointmentId ? data : apt
        )
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAppointment: async (appointmentId, updates) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(*),
          appointment_type:appointment_types(*)
        `)
        .single();

      if (error) throw error;

      const { appointments } = get();
      set({
        appointments: appointments.map(apt => 
          apt.id === appointmentId ? data : apt
        )
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));