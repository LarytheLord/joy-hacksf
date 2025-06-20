import { Redirect } from 'expo-router';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Import screens
import DashboardScreen from './dashboard';
import AppointmentsScreen from './appointments';
import TasksScreen from './tasks';
import MessagesScreen from './messages';
import ProfileScreen from './profile';

// Doctor-specific screens
import ClientsScreen from './clients';
import ScheduleScreen from './schedule';
import TaskTemplatesScreen from './task-templates';

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const { user, profile, isLoading } = useAuthStore();

  // If not authenticated, redirect to auth
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoading || !profile) {
    return <LoadingSpinner />;
  }

  const isDoctor = profile.role === 'doctor';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'dashboard':
              iconName = 'view-dashboard';
              break;
            case 'appointments':
              iconName = 'calendar-clock';
              break;
            case 'tasks':
              iconName = 'clipboard-list';
              break;
            case 'messages':
              iconName = 'message';
              break;
            case 'clients':
              iconName = 'account-group';
              break;
            case 'schedule':
              iconName = 'calendar-edit';
              break;
            case 'task-templates':
              iconName = 'clipboard-text';
              break;
            case 'profile':
              iconName = 'account';
              break;
            default:
              iconName = 'help-circle';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }} 
      />
      
      <Tab.Screen 
        name="appointments" 
        component={AppointmentsScreen} 
        options={{ title: 'Appointments' }} 
      />
      
      <Tab.Screen 
        name="tasks" 
        component={TasksScreen} 
        options={{ title: 'Tasks' }} 
      />
      
      <Tab.Screen 
        name="messages" 
        component={MessagesScreen} 
        options={{ title: 'Messages' }} 
      />

      {isDoctor && (
        <>
          <Tab.Screen 
            name="clients" 
            component={ClientsScreen} 
            options={{ title: 'Clients' }} 
          />
          
          <Tab.Screen 
            name="schedule" 
            component={ScheduleScreen} 
            options={{ title: 'Schedule' }} 
          />
          
          <Tab.Screen 
            name="task-templates" 
            component={TaskTemplatesScreen} 
            options={{ title: 'Templates' }} 
          />
        </>
      )}
      
      <Tab.Screen 
        name="profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}