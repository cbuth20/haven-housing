'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { useUsers } from '@/hooks/useUsers'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const userFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'client']),
  use_temp_password: z.boolean(),
  temp_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .optional()
    .or(z.literal('')),
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
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: 'client',
      use_temp_password: false,
    },
  })

  const useTempPassword = watch('use_temp_password')

  const onSubmit = async (data: UserFormData) => {
    try {
      setSubmitError(null)
      await createUser({
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        use_temp_password: data.use_temp_password,
        temp_password: data.use_temp_password ? data.temp_password : undefined,
      })
      onSuccess()
    } catch (error: any) {
      console.error('Error creating user:', error)
      setSubmitError(error.message || 'Failed to create user')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          {useTempPassword
            ? 'User will receive login credentials at this email'
            : 'User will receive a sign-in link at this email'}
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

      {/* Temp Password Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="use_temp_password"
          {...register('use_temp_password')}
          className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy"
        />
        <label htmlFor="use_temp_password" className="text-sm text-gray-700">
          Use temporary password instead of magic link
        </label>
      </div>

      {/* Temporary Password (shown only when toggle is on) */}
      {useTempPassword && (
        <div>
          <label htmlFor="temp_password" className="block text-sm font-medium text-gray-700 mb-1">
            Temporary Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="temp_password"
              type={showPassword ? 'text' : 'password'}
              {...register('temp_password')}
              error={errors.temp_password?.message}
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
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {submitError}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {useTempPassword ? 'Create User' : 'Send Invitation'}
        </Button>
      </div>
    </form>
  )
}
