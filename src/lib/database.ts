import { supabase, Task, TaskInsert, TaskUpdate } from './supabase'

// Database operations for tasks
export const taskService = {
  // Get all tasks for current user
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getTasks:', error)
      throw error
    }
  },

  // Create a new task
  async createTask(task: TaskInsert): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createTask:', error)
      throw error
    }
  },

  // Update an existing task
  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateTask:', error)
      throw error
    }
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting task:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteTask:', error)
      throw error
    }
  },

  // Toggle task completion status
  async toggleTask(id: string, completed: boolean): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling task:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in toggleTask:', error)
      throw error
    }
  },

  // Subscribe to real-time task changes
  subscribeToTasks(userId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return subscription
  },

  // Unsubscribe from real-time changes
  unsubscribe(subscription: any) {
    supabase.removeChannel(subscription)
  }
}

// Database operations for users
export const userService = {
  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      throw error
    }
  },

  // Create user profile
  async createUserProfile(user: { id: string; email: string }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      throw error
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: { full_name?: string; email?: string }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      throw error
    }
  }
}