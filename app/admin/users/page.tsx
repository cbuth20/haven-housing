'use client'

import { useEffect, useState } from 'react'
import { useUsers, UserProfile } from '@/hooks/useUsers'
import { DataTable, Column } from '@/components/common/DataTable'
import { UserForm } from '@/components/forms/UserForm'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PlusIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null)

  const { fetchUsers, resendInvite, deleteUser } = useUsers()

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setIsFormOpen(true)
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    // Refresh the users list
    await loadUsers()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
  }

  const handleResendInvite = async (user: UserProfile) => {
    if (actionLoading.has(user.id)) return
    setActionLoading((prev) => new Set(prev).add(user.id))
    setError(null)
    setSuccessMessage(null)
    try {
      await resendInvite(user.id)
      setSuccessMessage(`Invitation resent to ${user.email}`)
    } catch (err: any) {
      setError(err.message || 'Failed to resend invite')
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
    }
  }

  const handleDeleteUser = async (user: UserProfile) => {
    if (actionLoading.has(user.id)) return
    setActionLoading((prev) => new Set(prev).add(user.id))
    setError(null)
    setSuccessMessage(null)
    setConfirmDelete(null)
    try {
      await deleteUser(user.id)
      setSuccessMessage(`${user.full_name || user.email} has been deleted`)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
    }
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    const aValue = (a as any)[sortKey]
    const bValue = (b as any)[sortKey]

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection === 'asc' ? comparison : -comparison
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const columns: Column<UserProfile>[] = [
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      render: (value, user) => (
        <div className="font-medium text-gray-900">
          {user.full_name || <span className="text-gray-400 italic">No name</span>}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value, user) => (
        <div className="text-gray-700">{user.email}</div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value, user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {user.role === 'admin' ? 'Administrator' : 'Client'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value, user) => (
        <div className="text-sm text-gray-600">
          {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (value, user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleResendInvite(user) }}
            disabled={actionLoading.has(user.id)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
            title="Resend invitation email"
          >
            <EnvelopeIcon className="w-3.5 h-3.5" />
            {actionLoading.has(user.id) ? 'Sending...' : 'Resend Invite'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(user) }}
            disabled={actionLoading.has(user.id)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50"
            title="Delete user"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-navy">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateNew}
        >
          Add User
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Users Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={sortedUsers}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </div>
      )}

      {/* User Creation Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title="Create New User"
        size="md"
      >
        <UserForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete User"
        size="sm"
      >
        {confirmDelete && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{confirmDelete.full_name || confirmDelete.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDeleteUser(confirmDelete)}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
