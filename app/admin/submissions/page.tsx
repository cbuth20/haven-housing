'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/common/Button'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Submission {
  id: string
  submission_data: any
  submitter_name: string
  submitter_email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [filter])

  const loadSubmissions = async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('property_submissions').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data } = await query
      setSubmissions(data || [])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (sub: Submission) => {
    if (!confirm('Approve?')) return
    setIsProcessing(true)
    try {
      await fetch('/.netlify/functions/property-submission-approve', {
        method: 'POST',
        body: JSON.stringify({ submissionId: sub.id, notes }),
      })
      alert('Approved!')
      setSelected(null)
      setNotes('')
      loadSubmissions()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (sub: Submission) => {
    if (!notes || !confirm('Reject?')) return
    setIsProcessing(true)
    try {
      await fetch('/.netlify/functions/property-submission-reject', {
        method: 'POST',
        body: JSON.stringify({ submissionId: sub.id, notes }),
      })
      alert('Rejected')
      setSelected(null)
      setNotes('')
      loadSubmissions()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">Property Submissions</h1>
        <p className="text-gray-600 mt-2">Review property submissions</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f as any)}>
            {f}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">No submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-navy">{sub.submission_data.title}</h3>
                  <p className="text-gray-600">{sub.submission_data.city}, {sub.submission_data.state}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  sub.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>{sub.status}</span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div><strong>Rent:</strong> ${sub.submission_data.monthlyRent}/mo</div>
                <div><strong>Beds/Baths:</strong> {sub.submission_data.beds}/{sub.submission_data.baths}</div>
                <div><strong>By:</strong> {sub.submitter_name}</div>
                <div><strong>Date:</strong> {new Date(sub.created_at).toLocaleDateString()}</div>
              </div>

              {selected?.id === sub.id ? (
                <div className="border-t pt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p><strong>Address:</strong> {sub.submission_data.streetAddress}</p>
                    <p><strong>Description:</strong> {sub.submission_data.description}</p>
                    <p><strong>Landlord:</strong> {sub.submission_data.landlordName} - {sub.submission_data.landlordEmail}</p>
                  </div>

                  {sub.status === 'pending' && (
                    <>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Review notes..."
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => handleApprove(sub)} disabled={isProcessing}>
                          <CheckCircleIcon className="h-5 w-5 mr-2" /> Approve
                        </Button>
                        <Button variant="ghost" onClick={() => handleReject(sub)} disabled={isProcessing}>
                          <XCircleIcon className="h-5 w-5 mr-2" /> Reject
                        </Button>
                        <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSelected(sub)}>View Details</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
