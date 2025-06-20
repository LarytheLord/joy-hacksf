import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import dayjs from 'dayjs';

export default function AppointmentsScreen() {
  const { profile } = useAuthStore();
  const { appointments, fetchAppointments, cancelAppointment, isLoading } = useAppointmentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const isDoctor = profile?.role === 'doctor';

  useEffect(() => {
    loadAppointments();
  }, [profile]);

  const loadAppointments = async () => {
    try {
      setError('');
      if (isDoctor) {
        await fetchAppointments();
      } else {
        await fetchAppointments(profile?.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const cancelledBy = isDoctor ? 'doctor' : 'client';
      await cancelAppointment(appointmentId, cancelledBy);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadAppointments} />;
  }

  // Separate upcoming and past appointments
  const now = dayjs();
  const upcomingAppointments = appointments.filter(apt => 
    dayjs(apt.start_time).isAfter(now) && apt.status === 'booked'
  );
  const pastAppointments = appointments.filter(apt => 
    dayjs(apt.start_time).isBefore(now) || apt.status !== 'booked'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      case 'cancelled_by_client':
      case 'cancelled_by_doctor':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'booked':
        return 'Booked';
      case 'completed':
        return 'Completed';
      case 'cancelled_by_client':
        return 'Cancelled by Client';
      case 'cancelled_by_doctor':
        return 'Cancelled by Doctor';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Upcoming Appointments */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Upcoming Appointments
          </Text>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <Card key={appointment.id} style={styles.appointmentCard}>
                <Card.Content>
                  <View style={styles.appointmentHeader}>
                    <Text variant="titleMedium">
                      {dayjs(appointment.start_time).format('MMM DD, YYYY')}
                    </Text>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: getStatusColor(appointment.status) }}
                    >
                      {getStatusText(appointment.status)}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyLarge" style={styles.timeText}>
                    {dayjs(appointment.start_time).format('HH:mm')} - {dayjs(appointment.end_time).format('HH:mm')}
                  </Text>
                  
                  {isDoctor && appointment.client && (
                    <Text variant="bodyMedium" style={styles.clientText}>
                      Client: {appointment.client.full_name}
                    </Text>
                  )}
                  
                  {appointment.appointment_type && (
                    <Text variant="bodyMedium" style={styles.typeText}>
                      Type: {appointment.appointment_type.name}
                    </Text>
                  )}
                  
                  {appointment.client_notes && (
                    <Text variant="bodySmall" style={styles.notesText}>
                      Notes: {appointment.client_notes}
                    </Text>
                  )}
                </Card.Content>
                
                <Card.Actions>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleCancelAppointment(appointment.id)}
                    textColor="#f44336"
                  >
                    Cancel
                  </Button>
                  {isDoctor && (
                    <Button mode="contained">
                      Mark Complete
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No upcoming appointments
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Past Appointments */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Past Appointments
          </Text>
          
          {pastAppointments.length > 0 ? (
            pastAppointments.slice(0, 10).map(appointment => (
              <Card key={appointment.id} style={styles.appointmentCard}>
                <Card.Content>
                  <View style={styles.appointmentHeader}>
                    <Text variant="titleMedium">
                      {dayjs(appointment.start_time).format('MMM DD, YYYY')}
                    </Text>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: getStatusColor(appointment.status) }}
                    >
                      {getStatusText(appointment.status)}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyLarge" style={styles.timeText}>
                    {dayjs(appointment.start_time).format('HH:mm')} - {dayjs(appointment.end_time).format('HH:mm')}
                  </Text>
                  
                  {isDoctor && appointment.client && (
                    <Text variant="bodyMedium" style={styles.clientText}>
                      Client: {appointment.client.full_name}
                    </Text>
                  )}
                  
                  {appointment.appointment_type && (
                    <Text variant="bodyMedium" style={styles.typeText}>
                      Type: {appointment.appointment_type.name}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No past appointments
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {!isDoctor && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {
            // Navigate to book appointment screen
            console.log('Navigate to book appointment');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
    color: '#6200ee',
  },
  appointmentCard: {
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  clientText: {
    marginBottom: 4,
    color: '#666',
  },
  typeText: {
    marginBottom: 4,
    color: '#666',
  },
  notesText: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyCard: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});