export type TodoItem = {
  id: number;
  title: string;
  description?: string;
  completed: number;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
};

export type FilterType = 'all' | 'active' | 'completed';
