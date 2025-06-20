import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabaseClient';

const IndexScreen = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {user?.email}!</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

export default IndexScreen;