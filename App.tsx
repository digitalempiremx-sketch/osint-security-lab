import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDatabase, addTodo, getTodos, toggleTodo, deleteTodo, deleteCompletedTodos } from './src/database';
import { TodoItem, FilterType } from './src/types';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return '🔴 High';
    case 'medium':
      return '🟡 Medium';
    case 'low':
      return '🟢 Low';
    default:
      return 'Normal';
  }
};

export default function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Initialize database on app start
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        await loadTodos();
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize app');
      }
    };
    init();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Error loading todos:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Validation', 'Please enter a task title');
      return;
    }

    try {
      await addTodo(newTitle.trim(), newDescription.trim() || undefined, priority);
      setNewTitle('');
      setNewDescription('');
      setPriority('medium');
      setShowForm(false);
      await loadTodos();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const handleToggleTodo = async (id: number, completed: number) => {
    try {
      await toggleTodo(id, completed === 0);
      await loadTodos();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTodo(id);
            await loadTodos();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const handleClearCompleted = () => {
    Alert.alert('Clear Completed', 'Delete all completed tasks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCompletedTodos();
            await loadTodos();
          } catch (error) {
            Alert.alert('Error', 'Failed to clear completed tasks');
          }
        },
      },
    ]);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return todo.completed === 0;
    if (filter === 'completed') return todo.completed === 1;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed === 1).length,
    active: todos.filter((t) => t.completed === 0).length,
  };

  const renderTodoItem = ({ item }: { item: TodoItem }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleToggleTodo(item.id, item.completed)}
      >
        <View style={[styles.checkboxInner, item.completed === 1 && styles.checkboxChecked]}>
          {item.completed === 1 && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={styles.todoContent}>
        <Text
          style={[
            styles.todoTitle,
            item.completed === 1 && styles.todoTitleCompleted,
          ]}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.todoDescription}>{item.description}</Text>
        )}
        <View style={styles.todoMeta}>
          <Text
            style={[
              styles.priorityBadge,
              { color: getPriorityColor(item.priority) },
            ]}
          >
            {getPriorityLabel(item.priority)}
          </Text>
          {item.dueDate && (
            <Text style={styles.dueDateBadge}>📅 {item.dueDate}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* New Task Form */}
        {showForm && (
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor="#94A3B8"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#94A3B8"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />

            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonActive,
                    { borderColor: getPriorityColor(p) },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={styles.priorityButtonText}>{getPriorityLabel(p)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowForm(false);
                  setNewTitle('');
                  setNewDescription('');
                  setPriority('medium');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
                <Text style={styles.addButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tasks List */}
        {loading ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : filteredTodos.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'active'
                ? 'All tasks completed! 🎉'
                : 'No tasks yet. Create one to get started!'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTodos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            style={styles.list}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionsFooter}>
          {!showForm && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.fabText}>+ Add Task</Text>
            </TouchableOpacity>
          )}
          {stats.completed > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCompleted}
            >
              <Text style={styles.clearButtonText}>Clear Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020817',
  },
  container: {
    flex: 1,
    backgroundColor: '#020817',
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterTextActive: {
    color: '#F8FAFC',
  },
  formCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  priorityButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  priorityButtonActive: {
    backgroundColor: '#1E293B',
  },
  priorityButtonText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  todoTitleCompleted: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  todoDescription: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  todoMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  dueDateBadge: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionsFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  fab: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
  },
  fabText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#7C2D12',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FED7AA',
    fontWeight: '600',
    fontSize: 14,
  },
});
