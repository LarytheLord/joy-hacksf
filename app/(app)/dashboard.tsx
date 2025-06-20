import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useTaskStore } from '@/stores/taskStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import dayjs from 'dayjs';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { appointments, fetchAppointments, isLoading: appointmentsLoading } = useAppointmentStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const isDoctor = profile?.role === 'doctor';

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      setError('');
      if (isDoctor) {
        await Promise.all([
          fetchAppointments(),
          fetchTasks(),
        ]);
      } else {
        await Promise.all([
          fetchAppointments(profile?.id),
          fetchTasks(profile?.id),
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (appointmentsLoading || tasksLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  // Filter today's appointments
  const today = dayjs().startOf('day');
  const todayAppointments = appointments.filter(apt => 
    dayjs(apt.start_time).isSame(today, 'day') && apt.status === 'booked'
  );

  // Filter upcoming appointments (next 7 days)
  const upcomingAppointments = appointments.filter(apt => 
    dayjs(apt.start_time).isAfter(today) && 
    dayjs(apt.start_time).isBefore(today.add(7, 'days')) &&
    apt.status === 'booked'
  );

  // Filter pending tasks
  const pendingTasks = tasks.filter(task => 
    task.status === 'pending' || task.status === 'overdue'
  );

  // Filter submitted tasks (for doctor)
  const submittedTasks = tasks.filter(task => task.status === 'submitted');

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome back, {profile?.full_name}!
        </Text>

        {/* Today's Appointments */}
        <Card style={styles.card}>
          <Card.Title title="Today's Appointments" />
          <Card.Content>
            {todayAppointments.length > 0 ? (
              todayAppointments.map(appointment => (
                <View key={appointment.id} style={styles.appointmentItem}>
                  <Text variant="bodyLarge">
                    {dayjs(appointment.start_time).format('HH:mm')} - {dayjs(appointment.end_time).format('HH:mm')}
                  </Text>
                  {isDoctor && appointment.client && (
                    <Text variant="bodyMedium" style={styles.clientName}>
                      {appointment.client.full_name}
                    </Text>
                  )}
                  {appointment.appointment_type && (
                    <Text variant="bodySmall" style={styles.appointmentType}>
                      {appointment.appointment_type.name}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No appointments scheduled for today
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Upcoming Appointments */}
        <Card style={styles.card}>
          <Card.Title title="Upcoming Appointments" />
          <Card.Content>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 3).map(appointment => (
                <View key={appointment.id} style={styles.appointmentItem}>
                  <Text variant="bodyLarge">
                    {dayjs(appointment.start_time).format('MMM DD, HH:mm')}
                  </Text>
                  {isDoctor && appointment.client && (
                    <Text variant="bodyMedium" style={styles.clientName}>
                      {appointment.client.full_name}
                    </Text>
                  )}
                  {appointment.appointment_type && (
                    <Text variant="bodySmall" style={styles.appointmentType}>
                      {appointment.appointment_type.name}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No upcoming appointments
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Tasks Section */}
        {isDoctor ? (
          /* Doctor: Tasks pending review */
          <Card style={styles.card}>
            <Card.Title title="Tasks Pending Review" />
            <Card.Content>
              {submittedTasks.length > 0 ? (
                <>
                  <View style={styles.taskStats}>
                    <Chip icon="clipboard-check" mode="outlined">
                      {submittedTasks.length} submitted
                    </Chip>
                  </View>
                  {submittedTasks.slice(0, 3).map(task => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text variant="bodyLarge">{task.title}</Text>
                      {task.client && (
                        <Text variant="bodyMedium" style={styles.clientName}>
                          {task.client.full_name}
                        </Text>
                      )}
                      <Text variant="bodySmall" style={styles.dueDate}>
                        Due: {dayjs(task.due_date).format('MMM DD, YYYY')}
                      </Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No tasks pending review
                </Text>
              )}
            </Card.Content>
          </Card>
        ) : (
          /* Client: Pending tasks */
          <Card style={styles.card}>
            <Card.Title title="Your Tasks" />
            <Card.Content>
              {pendingTasks.length > 0 ? (
                <>
                  <View style={styles.taskStats}>
                    <Chip icon="clipboard-list" mode="outlined">
                      {pendingTasks.length} pending
                    </Chip>
                  </View>
                  {pendingTasks.slice(0, 3).map(task => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text variant="bodyLarge">{task.title}</Text>
                      <Text variant="bodySmall" style={styles.dueDate}>
                        Due: {dayjs(task.due_date).format('MMM DD, YYYY')}
                      </Text>
                      {dayjs(task.due_date).isBefore(dayjs()) && (
                        <Chip icon="alert" mode="outlined" textStyle={styles.overdueText}>
                          Overdue
                        </Chip>
                      )}
                    </View>
                  ))}
                </>
              ) : (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No pending tasks
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.quickActions}>
              {isDoctor ? (
                <>
                  <Button mode="contained" style={styles.actionButton}>
                    Add Client
                  </Button>
                  <Button mode="outlined" style={styles.actionButton}>
                    Create Task
                  </Button>
                </>
              ) : (
                <>
                  <Button mode="contained" style={styles.actionButton}>
                    Book Appointment
                  </Button>
                  <Button mode="outlined" style={styles.actionButton}>
                    View Tasks
                  </Button>
                </>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
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
  greeting: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#6200ee',
  },
  card: {
    marginBottom: 16,
  },
  appointmentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clientName: {
    color: '#666',
    marginTop: 2,
  },
  appointmentType: {
    color: '#999',
    marginTop: 2,
  },
  taskItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dueDate: {
    color: '#666',
    marginTop: 2,
  },
  overdueText: {
    color: '#d32f2f',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});