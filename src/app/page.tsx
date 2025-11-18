'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project documentation',
      description: 'Finish the technical documentation for the new feature',
      completed: false,
      dueDate: '2024-11-20',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Review pull requests',
      description: 'Check and approve pending PRs',
      completed: false,
      dueDate: '2024-11-19',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Update dependencies',
      description: 'Update npm packages to latest versions',
      completed: true,
      dueDate: '2024-11-18',
      priority: 'low'
    }
  ])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        priority: 'medium'
      }
      setTasks([...tasks, newTask])
      setNewTaskTitle('')
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const activeTasksCount = tasks.filter(task => !task.completed).length
  const completedTasksCount = tasks.filter(task => task.completed).length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTasksCount} active, {completedTasksCount} completed
              </p>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/settings" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Settings
              </Link>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Add Task */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done?"
              className="input-field flex-1"
            />
            <button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
          <div className="flex space-x-1">
            {(['all', 'active', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600">
                {filter === 'completed' 
                  ? 'No completed tasks yet' 
                  : filter === 'active'
                  ? 'No active tasks'
                  : 'No tasks yet. Add your first task above!'
                }
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="checkbox-custom"
                    aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  
                  {/* Task Content */}
                  <div className="flex-1">
                    <h3 className="task-title font-medium text-gray-900">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {/* Priority Badge */}
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                      
                      {/* Due Date */}
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/task/${task.id}`}
                      className="btn-ghost text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="btn-danger text-sm"
                      aria-label={`Delete ${task.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}