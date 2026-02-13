'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error('Error changing password:', err)
      setError(err.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading font-bold text-navy mb-2">Profile Settings</h1>
      <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-gray-900">{user?.user_metadata?.full_name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 capitalize">{user?.user_metadata?.role || 'client'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            helperText="Must be 8+ characters with uppercase, lowercase, and number"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  )
}
