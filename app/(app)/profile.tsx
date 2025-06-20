import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Avatar, Snackbar } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProfileScreen() {
  const { profile, updateProfile, signOut, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!fullName.trim()) {
        setError('Full name is required');
        return;
      }

      await updateProfile({ full_name: fullName.trim() });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label={getInitials(profile?.full_name || 'U')}
              style={styles.avatar}
            />
            
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.name}>
                {profile?.full_name}
              </Text>
              <Text variant="bodyLarge" style={styles.role}>
                {profile?.role === 'doctor' ? 'Doctor' : 'Client'}
              </Text>
              <Text variant="bodyMedium" style={styles.joinDate}>
                Member since {new Date(profile?.created_at || '').toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Edit Profile */}
        <Card style={styles.card}>
          <Card.Title title="Profile Information" />
          <Card.Content>
            {isEditing ? (
              <>
                <TextInput
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  mode="outlined"
                  style={styles.input}
                />
                
                <View style={styles.editActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => {
                      setIsEditing(false);
                      setFullName(profile?.full_name || '');
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSaveProfile}
                    style={styles.saveButton}
                  >
                    Save
                  </Button>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Full Name:
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {profile?.full_name}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Role:
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {profile?.role === 'doctor' ? 'Doctor' : 'Client'}
                  </Text>
                </View>
                
                <Button 
                  mode="outlined" 
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.card}>
          <Card.Title title="About My App" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.aboutText}>
              My App is a comprehensive practice management app 
              designed to facilitate secure communication and task management between 
              Dr. Moloy and clients.
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Version:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                1.0.0
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Title title="Account Actions" />
          <Card.Content>
            <Button 
              mode="outlined" 
              onPress={handleSignOut}
              style={styles.signOutButton}
              textColor="#f44336"
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
      >
        {success}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    minWidth: 80,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    color: '#333',
  },
  editButton: {
    marginTop: 16,
  },
  aboutText: {
    marginBottom: 16,
    lineHeight: 20,
    color: '#666',
  },
  signOutButton: {
    borderColor: '#f44336',
  },
});