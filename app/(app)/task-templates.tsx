import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB, Searchbar } from 'react-native-paper';
import { useTaskStore } from '@/stores/taskStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function TaskTemplatesScreen() {
  const { templates, fetchTemplates, deleteTemplate, isLoading } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setError('');
      await fetchTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadTemplates} />;
  }

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'text_entry':
        return 'Text Entry';
      case 'file_upload':
        return 'File Upload';
      case 'checkbox_list':
        return 'Checkbox List';
      case 'external_link':
        return 'External Link';
      default:
        return type;
    }
  };

  const renderTemplateItem = ({ item: template }: { item: any }) => (
    <Card style={styles.templateCard}>
      <Card.Content>
        <View style={styles.templateHeader}>
          <Text variant="titleMedium" style={styles.templateTitle}>
            {template.title}
          </Text>
          <Chip 
            icon={getTaskTypeIcon(template.task_type)}
            mode="outlined"
            compact
          >
            {getTaskTypeLabel(template.task_type)}
          </Chip>
        </View>
        
        <Text variant="bodyMedium" style={styles.description}>
          {template.description}
        </Text>
        
        <Text variant="bodySmall" style={styles.createdDate}>
          Created {new Date(template.created_at).toLocaleDateString()}
        </Text>
        
        {/* Show template content preview */}
        {template.task_type === 'checkbox_list' && template.template_content?.items && (
          <View style={styles.contentPreview}>
            <Text variant="bodySmall" style={styles.previewLabel}>
              Checklist items:
            </Text>
            {template.template_content.items.slice(0, 3).map((item: string, index: number) => (
              <Text key={index} variant="bodySmall" style={styles.checklistItem}>
                • {item}
              </Text>
            ))}
            {template.template_content.items.length > 3 && (
              <Text variant="bodySmall" style={styles.moreItems}>
                +{template.template_content.items.length - 3} more items
              </Text>
            )}
          </View>
        )}
        
        {template.task_type === 'text_entry' && template.template_content?.prompt && (
          <View style={styles.contentPreview}>
            <Text variant="bodySmall" style={styles.previewLabel}>
              Prompt:
            </Text>
            <Text variant="bodySmall" style={styles.promptText}>
              {template.template_content.prompt}
            </Text>
          </View>
        )}
        
        {template.task_type === 'external_link' && template.template_content?.url && (
          <View style={styles.contentPreview}>
            <Text variant="bodySmall" style={styles.previewLabel}>
              Link:
            </Text>
            <Text variant="bodySmall" style={styles.linkText}>
              {template.template_content.url}
            </Text>
          </View>
        )}
      </Card.Content>
      
      <Card.Actions>
        <Button 
          mode="outlined"
          onPress={() => {
            // Navigate to assign template
            console.log('Assign template:', template.title);
          }}
        >
          Assign
        </Button>
        <Button 
          mode="outlined"
          onPress={() => {
            // Navigate to edit template
            console.log('Edit template:', template.title);
          }}
        >
          Edit
        </Button>
        <Button 
          mode="outlined"
          onPress={() => handleDeleteTemplate(template.id)}
          textColor="#f44336"
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search templates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {filteredTemplates.length > 0 ? (
        <FlatList
          data={filteredTemplates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          style={styles.templatesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery ? 'No templates found' : 'No templates yet'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Create templates to reuse for client tasks'
            }
          </Text>
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to create template screen
          console.log('Navigate to create template');
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
  templatesList: {
    flex: 1,
  },
  templateCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateTitle: {
    flex: 1,
    marginRight: 8,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 8,
    color: '#666',
  },
  createdDate: {
    color: '#999',
    marginBottom: 8,
  },
  contentPreview: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  previewLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  checklistItem: {
    color: '#666',
    marginBottom: 2,
  },
  moreItems: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  promptText: {
    color: '#666',
    fontStyle: 'italic',
  },
  linkText: {
    color: '#6200ee',
    textDecorationLine: 'underline',
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