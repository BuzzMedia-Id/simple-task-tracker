'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/lib/database'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Fetch user profile when authenticated
  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return
    
    try {
      const profile = await userService.getUserProfile(user.id)
      setUserProfile(profile)
      setEmail(profile?.email || user.email || '')
      setFullName(profile?.full_name || '')
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    setMessage('')

    try {
      await userService.updateUserProfile(user.id, {
        full_name: fullName.trim(),
        email: email.trim()
      })
      
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      router.push('/auth')
    }
  }

  // Show loading or redirect to auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your account settings</p>
            </div>
            <nav className="flex space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tasks
              </a>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h2>
          
          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="your.email@example.com"
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field w-full"
                placeholder="John Doe"
                disabled={saving}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Account Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">User ID</span>
              <span className="text-sm text-gray-600 font-mono">{user.id}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Account Created</span>
              <span className="text-sm text-gray-600">
                {userProfile?.created_at 
                  ? new Date(userProfile.created_at).toLocaleDateString()
                  : 'Unknown'
                }
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Last Sign In</span>
              <span className="text-sm text-gray-600">
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : 'Unknown'
                }
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-700">Email Verified</span>
              <span className={`text-sm font-medium ${
                user.email_confirmed_at 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {user.email_confirmed_at 
                  ? '✅ Verified' 
                  : '⏳ Pending'
                }
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}