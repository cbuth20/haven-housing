'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch('/.netlify/functions/form-submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setSubmitSuccess(true)
      reset()
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-heading font-bold text-green-900 mb-2">
          Message Sent!
        </h3>
        <p className="text-green-800 mb-4">
          Thank you for contacting us. We'll get back to you within 24 hours.
        </p>
        <Button variant="outline" onClick={() => setSubmitSuccess(false)}>
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{submitError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input {...register('fullName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
        {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" {...register('email')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
        <input {...register('subject')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
        {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
        <textarea {...register('message')} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy" />
        {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">Sending...</span>
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  )
}
