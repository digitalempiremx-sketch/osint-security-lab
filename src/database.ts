import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('todos.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completedAt TIMESTAMP,
        priority TEXT DEFAULT 'medium',
        dueDate TEXT
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#3B82F6'
      );
    `);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = () => db;

export type Todo = {
  id: number;
  title: string;
  description?: string;
  completed: number;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
};

export const addTodo = async (title: string, description?: string, priority: string = 'medium', dueDate?: string) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const result = await db.runAsync(
      'INSERT INTO todos (title, description, priority, dueDate) VALUES (?, ?, ?, ?)',
      [title, description || null, priority, dueDate || null]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const getTodos = async (): Promise<Todo[]> => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const result = await db.getAllAsync<Todo>(
      'SELECT * FROM todos ORDER BY completed ASC, createdAt DESC'
    );
    return result;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const updateTodo = async (id: number, updates: Partial<Todo>) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates);
    
    await db.runAsync(
      `UPDATE todos SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const toggleTodo = async (id: number, completed: boolean) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    await db.runAsync(
      'UPDATE todos SET completed = ?, completedAt = ? WHERE id = ?',
      [completed ? 1 : 0, completed ? new Date().toISOString() : null, id]
    );
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: number) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

export const deleteCompletedTodos = async () => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    await db.runAsync('DELETE FROM todos WHERE completed = 1');
  } catch (error) {
    console.error('Error deleting completed todos:', error);
    throw error;
  }
};
