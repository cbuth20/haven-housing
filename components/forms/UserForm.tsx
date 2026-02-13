'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { useUsers, CreateUserInput } from '@/hooks/useUsers'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const userFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'client']),
  temporary_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const { createUser, isLoading } = useUsers()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: 'client',
    },
  })

  const onSubmit = async (data: UserFormData) => {
    try {
      setSubmitError(null)
      console.log('Submitting user data:', { ...data, temporary_password: '[REDACTED]' })
      const result = await createUser(data)
      console.log('User created successfully:', result)
      onSuccess()
    } catch (error: any) {
      console.error('Error creating user:', error)
      setSubmitError(error.message || 'Failed to create user')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="full_name"
          {...register('full_name')}
          error={errors.full_name?.message}
          placeholder="John Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="john.doe@example.com"
        />
        <p className="mt-1 text-xs text-gray-500">
          User will receive login credentials at this email
        </p>
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <Select
          id="role"
          {...register('role')}
          error={errors.role?.message}
          options={[
            { value: 'client', label: 'Client' },
            { value: 'admin', label: 'Administrator' },
          ]}
        />
        <p className="mt-1 text-xs text-gray-500">
          Admins have full access to manage properties and users
        </p>
      </div>

      {/* Temporary Password */}
      <div>
        <label htmlFor="temporary_password" className="block text-sm font-medium text-gray-700 mb-1">
          Temporary Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="temporary_password"
            type={showPassword ? 'text' : 'password'}
            {...register('temporary_password')}
            error={errors.temporary_password?.message}
            placeholder="Enter temporary password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Must be 8+ characters with uppercase, lowercase, and number
        </p>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create User
        </Button>
      </div>
    </form>
  )
}
