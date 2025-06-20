import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Button, Searchbar, FAB } from 'react-native-paper';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('full_name', { ascending: true });

      if (supabaseError) throw supabaseError;

      setClients(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadClients} />;
  }

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderClientItem = ({ item: client }: { item: Profile }) => (
    <Card 
      style={styles.clientCard}
      onPress={() => {
        // Navigate to client detail screen
        console.log('Navigate to client detail:', client.full_name);
      }}
    >
      <Card.Content style={styles.clientContent}>
        <Avatar.Text 
          size={50} 
          label={getInitials(client.full_name)}
          style={styles.avatar}
        />
        
        <View style={styles.clientInfo}>
          <Text variant="titleMedium" style={styles.clientName}>
            {client.full_name}
          </Text>
          <Text variant="bodyMedium" style={styles.joinDate}>
            Joined {new Date(client.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.clientActions}>
          <Button 
            mode="outlined" 
            compact
            onPress={() => {
              // Navigate to assign task
              console.log('Assign task to:', client.full_name);
            }}
          >
            Assign Task
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {filteredClients.length > 0 ? (
        <FlatList
          data={filteredClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          style={styles.clientsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Invite clients to see them here'
            }
          </Text>
        </View>
      )}

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to invite client screen
          console.log('Navigate to invite client');
        }}
      />
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
  clientsList: {
    flex: 1,
  },
  clientCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  clientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    color: '#666',
  },
  clientActions: {
    marginLeft: 8,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});