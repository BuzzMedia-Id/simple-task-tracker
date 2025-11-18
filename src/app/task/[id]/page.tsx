'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { taskService } from '@/lib/database'
import { Task, TaskUpdate } from '@/lib/supabase'
import TaskForm from '@/components/TaskForm'

export default function TaskPage() {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Fetch task when user is authenticated
  useEffect(() => {
    if (user && taskId) {
      fetchTask()
    }
  }, [user, taskId])

  const fetchTask = async () => {
    try {
      const tasks = await taskService.getTasks(user?.id || '')
      const foundTask = tasks.find(t => t.id === taskId)
      setTask(foundTask || null)
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async (updatedTaskData: TaskUpdate) => {
    if (!task || !user) return

    try {
      const updatedTask = await taskService.updateTask(task.id, {
        ...updatedTaskData,
        user_id: user.id // Ensure user_id is included
      })
      setTask(updatedTask)
      setShowForm(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async () => {
    if (!task || !user) return

    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await taskService.deleteTask(task.id)
      router.push('/')
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Show loading or redirect to auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!user || !task) {
    return null // Will redirect to auth or show 404
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Tasks
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Task Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Edit Task
              </button>
              <button
                onClick={handleDeleteTask}
                className="btn-danger"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Task Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">{task.title}</h2>
                <div className="flex items-center space-x-2">
                  {/* Priority Badge */}
                  {task.priority && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                  
                  {/* Status Badge */}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    task.completed 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-yellow-600 bg-yellow-50'
                  }`}>
                    {task.completed ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">
                    {task.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                  <p className="text-gray-600 capitalize">{task.priority}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                  <p className="text-gray-600">
                    {task.due_date 
                      ? new Date(task.due_date).toLocaleDateString()
                      : 'No due date set'
                    }
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                  <p className="text-gray-600">
                    {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
                  <p className="text-gray-600">
                    {new Date(task.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Task Actions */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => taskService.toggleTask(task.id, !task.completed)}
                    className="btn-secondary"
                  >
                    {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Task ID: {task.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onTaskCreated={async (updatedData) => {
            await handleUpdateTask(updatedData)
          }}
          onCancel={() => setShowForm(false)}
          initialTask={task}
        />
      )}
    </div>
  )
}