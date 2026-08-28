'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UploadStep } from '@/components/import/UploadStep'
import { MappingStep } from '@/components/import/MappingStep'
import { ReviewStep } from '@/components/import/ReviewStep'
import { Button } from '@/components/common/Button'
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import type { PhotoArchive } from '@/lib/zip-photos'

type Step = 'upload' | 'mapping' | 'review' | 'complete'

interface ImportSummary {
  created: number
  updated: number
  skipped: number
  errors: { index: number; message: string }[]
  photosUploaded?: number
  photoErrors?: number
  photoIssues?: string[]
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload File' },
  { key: 'mapping', label: 'Map Columns' },
  { key: 'review', label: 'Review & Import' },
]

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [photoArchive, setPhotoArchive] = useState<PhotoArchive | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const handleParsed = useCallback(
    (h: string[], r: Record<string, string>[], archive: PhotoArchive | null) => {
      setHeaders(h)
      setRows(r)
      setPhotoArchive(archive)
      setStep('mapping')
    },
    []
  )

  const handleMapped = useCallback((m: Record<string, string>) => {
    setMapping(m)
    setStep('review')
  }, [])

  const handleImportComplete = useCallback((s: ImportSummary) => {
    setSummary(s)
    setStep('complete')
  }, [])

  const currentStepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/properties" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold text-navy">Import Properties</h1>
          <p className="text-sm text-gray-600">Bulk upload properties from a CSV or Excel file</p>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'complete' && (
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                i === currentStepIndex
                  ? 'bg-navy text-white'
                  : i < currentStepIndex
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
              }`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {i < currentStepIndex ? '✓' : i + 1}
                </span>
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6">
        {step === 'upload' && (
          <UploadStep onParsed={handleParsed} />
        )}

        {step === 'mapping' && (
          <MappingStep
            headers={headers}
            sampleRows={rows.slice(0, 3)}
            onMapped={handleMapped}
            onBack={() => setStep('upload')}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            headers={headers}
            rows={rows}
            mapping={mapping}
            photoArchive={photoArchive}
            onBack={() => setStep('mapping')}
            onImportComplete={handleImportComplete}
          />
        )}

        {step === 'complete' && summary && (
          <div className="text-center space-y-6 py-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-heading font-bold text-navy">Import Complete</h2>
              <p className="text-gray-600 mt-2">Your properties have been imported as drafts.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700">{summary.created}</p>
                <p className="text-xs text-green-600">Created</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-700">{summary.updated}</p>
                <p className="text-xs text-blue-600">Updated</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-700">{summary.skipped}</p>
                <p className="text-xs text-gray-600">Skipped</p>
              </div>
            </div>

            {(summary.photosUploaded || summary.photoErrors) ? (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-navy">{summary.photosUploaded ?? 0}</span> photo
                {(summary.photosUploaded ?? 0) !== 1 ? 's' : ''} hosted
                {summary.photoErrors ? (
                  <span className="text-red-600">
                    {' '}· {summary.photoErrors} image{summary.photoErrors !== 1 ? 's' : ''} failed
                  </span>
                ) : null}
              </p>
            ) : null}

            {summary.photoIssues && summary.photoIssues.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm font-medium text-amber-800 mb-2">Photo issues:</p>
                <ul className="list-disc list-inside text-sm text-amber-700">
                  {summary.photoIssues.slice(0, 10).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                  {summary.photoIssues.length > 10 && <li>...and {summary.photoIssues.length - 10} more</li>}
                </ul>
              </div>
            )}

            {summary.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm font-medium text-red-800 mb-2">{summary.errors.length} row(s) failed:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {summary.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>Row {e.index + 1}: {e.message}</li>
                  ))}
                  {summary.errors.length > 10 && (
                    <li>...and {summary.errors.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => {
                setStep('upload')
                setHeaders([])
                setRows([])
                setMapping({})
                setPhotoArchive(null)
                setSummary(null)
              }}>
                Import More
              </Button>
              <Button variant="primary" onClick={() => router.push('/admin/properties')}>
                View Properties
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
