'use client'

import { useEffect, useState } from 'react'
import { useUsers, UserProfile } from '@/hooks/useUsers'
import { DataTable, Column } from '@/components/common/DataTable'
import { UserForm } from '@/components/forms/UserForm'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { fetchUsers } = useUsers()

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
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateNew}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

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
      {!isLoading && !error && (
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
    </div>
  )
}
