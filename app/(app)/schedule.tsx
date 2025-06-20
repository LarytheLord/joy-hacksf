import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, SegmentedButtons } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

export default function ScheduleScreen() {
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState('');

  const viewModeOptions = [
    { value: 'calendar', label: 'Calendar' },
    { value: 'availability', label: 'Availability' },
    { value: 'types', label: 'Appointment Types' },
  ];

  const renderCalendarView = () => (
    <Card style={styles.card}>
      <Card.Title title="Appointment Calendar" />
      <Card.Content>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#6200ee' },
            '2024-01-15': { marked: true, dotColor: '#4caf50' },
            '2024-01-16': { marked: true, dotColor: '#4caf50' },
            '2024-01-17': { marked: true, dotColor: '#f44336' },
          }}
          theme={{
            selectedDayBackgroundColor: '#6200ee',
            todayTextColor: '#6200ee',
            arrowColor: '#6200ee',
          }}
        />
        
        {selectedDate && (
          <View style={styles.selectedDateInfo}>
            <Text variant="titleMedium" style={styles.selectedDateTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text variant="bodyMedium" style={styles.appointmentCount}>
              3 appointments scheduled
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderAvailabilityView = () => (
    <View>
      <Card style={styles.card}>
        <Card.Title title="Weekly Availability" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Set your recurring weekly availability slots
          </Text>
          
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <View key={day} style={styles.availabilityRow}>
              <Text variant="bodyLarge" style={styles.dayName}>
                {day}
              </Text>
              <Text variant="bodyMedium" style={styles.timeSlot}>
                9:00 AM - 5:00 PM
              </Text>
              <Button mode="outlined" compact>
                Edit
              </Button>
            </View>
          ))}
        </Card.Content>
        <Card.Actions>
          <Button mode="contained">
            Add Time Slot
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Blocked Times" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Block out time for personal activities or holidays
          </Text>
          
          <View style={styles.blockedTimeItem}>
            <View style={styles.blockedTimeInfo}>
              <Text variant="bodyLarge">Holiday Break</Text>
              <Text variant="bodyMedium" style={styles.blockedTimeDate}>
                Dec 25, 2024 - Jan 2, 2025
              </Text>
            </View>
            <Button mode="outlined" compact>
              Edit
            </Button>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained">
            Block Time
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );

  const renderAppointmentTypesView = () => (
    <Card style={styles.card}>
      <Card.Title title="Appointment Types" />
      <Card.Content>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          Manage different types of appointments and their durations
        </Text>
        
        {[
          { name: 'Initial Consultation', duration: 60 },
          { name: 'Therapy Session', duration: 50 },
          { name: 'Follow-up', duration: 30 },
          { name: 'Group Session', duration: 90 },
        ].map((type, index) => (
          <View key={index} style={styles.appointmentTypeItem}>
            <View style={styles.appointmentTypeInfo}>
              <Text variant="bodyLarge">{type.name}</Text>
              <Text variant="bodyMedium" style={styles.duration}>
                {type.duration} minutes
              </Text>
            </View>
            <Button mode="outlined" compact>
              Edit
            </Button>
          </View>
        ))}
      </Card.Content>
      <Card.Actions>
        <Button mode="contained">
          Add Type
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={viewModeOptions}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.content}>
        {viewMode === 'calendar' && renderCalendarView()}
        {viewMode === 'availability' && renderAvailabilityView()}
        {viewMode === 'types' && renderAppointmentTypesView()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  selectedDateInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedDateTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appointmentCount: {
    color: '#666',
  },
  sectionDescription: {
    color: '#666',
    marginBottom: 16,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayName: {
    flex: 1,
    fontWeight: 'bold',
  },
  timeSlot: {
    flex: 2,
    color: '#666',
  },
  blockedTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  blockedTimeInfo: {
    flex: 1,
  },
  blockedTimeDate: {
    color: '#666',
    marginTop: 2,
  },
  appointmentTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appointmentTypeInfo: {
    flex: 1,
  },
  duration: {
    color: '#666',
    marginTop: 2,
  },
});