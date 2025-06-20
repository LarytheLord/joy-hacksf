import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Message, Conversation } from '@/types/database';

interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  currentConversationId: string | null;
  isLoading: boolean;
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, receiverId: string, content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  createConversation: (participant1Id: string, participant2Id: string) => Promise<string>;
  setCurrentConversation: (conversationId: string | null) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  messages: [],
  currentConversationId: null,
  isLoading: false,

  fetchConversations: async (userId) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(*),
          participant2:profiles!conversations_participant2_id_fkey(*)
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      set({ conversations: data || [] });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ messages: data || [], currentConversationId: conversationId });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId, receiverId, content) => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: (await supabase.auth.getUser()).data.user?.id!,
          receiver_id: receiverId,
          content,
          created_at: new Date().toISOString(),
          is_read: false,
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .single();

      if (messageError) throw messageError;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      const { messages } = get();
      set({ messages: [...messages, messageData] });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  markAsRead: async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      const { messages } = get();
      set({
        messages: messages.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  createConversation: async (participant1Id, participant2Id) => {
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  setCurrentConversation: (conversationId) => {
    set({ currentConversationId: conversationId });
  },
}));

// Set up real-time subscriptions
export const setupMessageSubscriptions = (userId: string) => {
  // Subscribe to new messages
  const messageSubscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        const { messages } = useMessageStore.getState();
        useMessageStore.setState({
          messages: [...messages, payload.new as Message],
        });
      }
    )
    .subscribe();

  return () => {
    messageSubscription.unsubscribe();
  };
};