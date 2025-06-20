import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Badge, Searchbar } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import dayjs from 'dayjs';

export default function MessagesScreen() {
  const { profile } = useAuthStore();
  const { conversations, fetchConversations, isLoading } = useMessageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile]);

  const loadConversations = async () => {
    try {
      setError('');
      await fetchConversations(profile!.id);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadConversations} />;
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participant1_id === profile?.id 
      ? conversation.participant2 
      : conversation.participant1;
    
    return otherParticipant?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversationItem = ({ item: conversation }: { item: any }) => {
    const otherParticipant = conversation.participant1_id === profile?.id 
      ? conversation.participant2 
      : conversation.participant1;

    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
      <Card 
        style={styles.conversationCard}
        onPress={() => {
          // Navigate to chat screen
          console.log('Navigate to chat with:', otherParticipant?.full_name);
        }}
      >
        <Card.Content style={styles.conversationContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={50} 
              label={getInitials(otherParticipant?.full_name || 'U')}
              style={styles.avatar}
            />
            {/* Unread message indicator */}
            <Badge style={styles.unreadBadge} visible={false}>
              3
            </Badge>
          </View>
          
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text variant="titleMedium" style={styles.participantName}>
                {otherParticipant?.full_name}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {dayjs(conversation.last_message_at).format('MMM DD')}
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={styles.lastMessage} numberOfLines={2}>
              {conversation.last_message?.content || 'No messages yet'}
            </Text>
            
            <Text variant="bodySmall" style={styles.participantRole}>
              {otherParticipant?.role === 'doctor' ? 'Dr. Moloy' : 'Client'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          style={styles.conversationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Start a conversation to see it here'
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  conversationsList: {
    flex: 1,
  },
  conversationCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontWeight: 'bold',
    flex: 1,
  },
  timestamp: {
    color: '#666',
  },
  lastMessage: {
    color: '#666',
    marginBottom: 4,
  },
  participantRole: {
    color: '#6200ee',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
  },
});