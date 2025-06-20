import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB, SegmentedButtons } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import dayjs from 'dayjs';

export default function TasksScreen() {
  const { profile } = useAuthStore();
  const { tasks, fetchTasks, reviewTask, isLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const isDoctor = profile?.role === 'doctor';

  useEffect(() => {
    loadTasks();
  }, [profile]);

  const loadTasks = async () => {
    try {
      setError('');
      if (isDoctor) {
        await fetchTasks();
      } else {
        await fetchTasks(profile?.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleReviewTask = async (taskId: string) => {
    try {
      await reviewTask(taskId);
    } catch (err: any) {
      setError(err.message || 'Failed to review task');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadTasks} />;
  }

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending';
      case 'submitted':
        return task.status === 'submitted';
      case 'reviewed':
        return task.status === 'reviewed';
      case 'overdue':
        return task.status === 'overdue' || (task.status === 'pending' && dayjs(task.due_date).isBefore(dayjs()));
      default:
        return true;
    }
  });

  const getStatusColor = (task: any) => {
    if (task.status === 'overdue' || (task.status === 'pending' && dayjs(task.due_date).isBefore(dayjs()))) {
      return '#f44336';
    }
    switch (task.status) {
      case 'pending':
        return '#ff9800';
      case 'submitted':
        return '#2196f3';
      case 'reviewed':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  const getStatusText = (task: any) => {
    if (task.status === 'pending' && dayjs(task.due_date).isBefore(dayjs())) {
      return 'Overdue';
    }
    switch (task.status) {
      case 'pending':
        return 'Pending';
      case 'submitted':
        return 'Submitted';
      case 'reviewed':
        return 'Reviewed';
      case 'overdue':
        return 'Overdue';
      default:
        return task.status;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'text_entry':
        return 'text';
      case 'file_upload':
        return 'file-upload';
      case 'checkbox_list':
        return 'checkbox-marked-circle';
      case 'external_link':
        return 'link';
      default:
        return 'clipboard';
    }
  };

  const filterOptions = isDoctor 
    ? [
        { value: 'all', label: 'All' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'overdue', label: 'Overdue' },
      ]
    : [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'overdue', label: 'Overdue' },
      ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Filter Buttons */}
          <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            buttons={filterOptions}
            style={styles.filterButtons}
          />

          {/* Tasks List */}
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <Card key={task.id} style={styles.taskCard}>
                <Card.Content>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleRow}>
                      <Text variant="titleMedium" style={styles.taskTitle}>
                        {task.title}
                      </Text>
                      <Chip 
                        icon={getTaskTypeIcon(task.task_type)}
                        mode="outlined"
                        compact
                      >
                        {task.task_type.replace('_', ' ')}
                      </Chip>
                    </View>
                    
                    <Chip 
                      mode="outlined" 
                      textStyle={{ color: getStatusColor(task) }}
                      style={{ marginTop: 8 }}
                    >
                      {getStatusText(task)}
                    </Chip>
                  </View>
                  
                  <Text variant="bodyMedium" style={styles.description}>
                    {task.description}
                  </Text>
                  
                  {isDoctor && task.client && (
                    <Text variant="bodyMedium" style={styles.clientText}>
                      Client: {task.client.full_name}
                    </Text>
                  )}
                  
                  <View style={styles.dateRow}>
                    <Text variant="bodySmall" style={styles.dateText}>
                      Assigned: {dayjs(task.assigned_at).format('MMM DD, YYYY')}
                    </Text>
                    <Text variant="bodySmall" style={[
                      styles.dateText,
                      dayjs(task.due_date).isBefore(dayjs()) && task.status === 'pending' && styles.overdueDate
                    ]}>
                      Due: {dayjs(task.due_date).format('MMM DD, YYYY')}
                    </Text>
                  </View>
                  
                  {task.submission_content && (
                    <View style={styles.submissionSection}>
                      <Text variant="bodySmall" style={styles.submissionLabel}>
                        Submission:
                      </Text>
                      {task.task_type === 'text_entry' && (
                        <Text variant="bodySmall" style={styles.submissionText}>
                          {task.submission_content}
                        </Text>
                      )}
                      {task.task_type === 'checkbox_list' && (
                        <View style={styles.checkboxSubmission}>
                          {Object.entries(task.submission_content || {}).map(([key, value]) => (
                            <Text key={key} variant="bodySmall" style={styles.checkboxItem}>
                              {value ? '✓' : '○'} {key}
                            </Text>
                          ))}
                        </View>
                      )}
                      {task.submission_file_path && (
                        <Text variant="bodySmall" style={styles.fileSubmission}>
                          📎 File uploaded
                        </Text>
                      )}
                    </View>
                  )}
                </Card.Content>
                
                <Card.Actions>
                  {!isDoctor && task.status === 'pending' && (
                    <Button mode="contained">
                      Complete Task
                    </Button>
                  )}
                  
                  {isDoctor && task.status === 'submitted' && (
                    <Button 
                      mode="contained" 
                      onPress={() => handleReviewTask(task.id)}
                    >
                      Mark as Reviewed
                    </Button>
                  )}
                  
                  <Button mode="outlined">
                    View Details
                  </Button>
                </Card.Actions>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No tasks found for the selected filter
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {isDoctor && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {
            // Navigate to assign task screen
            console.log('Navigate to assign task');
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
  filterButtons: {
    marginBottom: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    marginBottom: 8,
    color: '#666',
  },
  clientText: {
    marginBottom: 8,
    color: '#666',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    color: '#666',
  },
  overdueDate: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  submissionSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  submissionLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submissionText: {
    color: '#666',
  },
  checkboxSubmission: {
    marginTop: 4,
  },
  checkboxItem: {
    color: '#666',
    marginBottom: 2,
  },
  fileSubmission: {
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