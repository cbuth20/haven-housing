'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { transformRow, validateRow, TRANSIENT_FIELDS } from '@/lib/csv-import'
import { useProperties } from '@/hooks/useProperties'
import { uploadPhotosWithResults } from '@/lib/upload-photos'
import { materializeFolder, normalizeFolderKey, summarizeMatches, type PhotoArchive } from '@/lib/zip-photos'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { Property } from '@/types/property'
import { pickImportedData, type ImportedRow } from '@/lib/import-result-export'

type DuplicateAction = 'skip' | 'update' | 'create'
type MatchedBy = 'id' | 'address' | 'listing_link'

interface RowState {
  data: Record<string, any>
  clientValidation: { valid: boolean; errors: string[] }
  serverStatus: 'ready' | 'duplicate' | 'error' | 'pending'
  serverErrors?: string[]
  match?: { id: string; title: string; street_address: string; city: string; state: string; zip_code: string; status: string }
  matchedBy?: MatchedBy
  /** Row's ID resolved to a property at a different address — needs explicit confirmation. */
  addressMismatch?: boolean
  duplicateAction: DuplicateAction
  selected: boolean
  expanded: boolean
}

interface ReviewStepProps {
  headers: string[]
  rows: Record<string, string>[]
  mapping: Record<string, string>
  photoArchive?: PhotoArchive | null
  onBack: () => void
  onImportComplete: (summary: {
    created: number
    updated: number
    skipped: number
    errors: { index: number; message: string }[]
    photosUploaded?: number
    photoErrors?: number
    photoIssues?: string[]
    importedRows?: ImportedRow[]
  }) => void
}

type StatusFilter = 'all' | 'ready' | 'duplicate' | 'error'

const BATCH_SIZE = 50

export function ReviewStep({ headers, rows, mapping, photoArchive, onBack, onImportComplete }: ReviewStepProps) {
  const { bulkValidate, bulkCreate, isLoading } = useProperties()
  const [rowStates, setRowStates] = useState<RowState[]>([])
  const [isValidating, setIsValidating] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [noIdsMatched, setNoIdsMatched] = useState(false)

  // Transform all rows and run client-side validation, then server-side duplicate check
  useEffect(() => {
    const transformed = rows.map((row) => {
      const data = transformRow(row, mapping)
      const validation = validateRow(data)
      return {
        data,
        clientValidation: validation,
        serverStatus: validation.valid ? ('pending' as const) : ('error' as const),
        serverErrors: validation.valid ? undefined : validation.errors,
        duplicateAction: 'skip' as DuplicateAction,
        selected: validation.valid,
        expanded: false,
      }
    })
    setRowStates(transformed)

    const validRows = transformed.filter((r) => r.clientValidation.valid).map((r) => r.data)
    if (validRows.length === 0) {
      setIsValidating(false)
      return
    }

    bulkValidate(validRows as Partial<Property>[])
      .then((response: {
        results: {
          index: number
          status: string
          errors?: string[]
          match?: any
          matchedBy?: MatchedBy
          addressMismatch?: boolean
        }[]
        noIdsMatched?: boolean
      }) => {
        setNoIdsMatched(response.noIdsMatched === true)
        setRowStates((prev) => {
          const next = [...prev]
          let validIndex = 0
          for (let i = 0; i < next.length; i++) {
            if (!next[i].clientValidation.valid) continue
            const serverResult = response.results[validIndex]
            if (serverResult) {
              const isDuplicate = serverResult.status === 'duplicate'
              const mismatch = isDuplicate && serverResult.addressMismatch === true
              next[i] = {
                ...next[i],
                serverStatus: serverResult.status as any,
                serverErrors: serverResult.errors,
                match: serverResult.match,
                matchedBy: serverResult.matchedBy,
                addressMismatch: mismatch,
                // Existing properties default to Update (refresh data/photos in place);
                // status & featured are preserved server-side. An ID that points at a
                // property with a DIFFERENT address defaults to Skip — the user must
                // confirm it row by row, since a pasted ID from the wrong line would
                // otherwise overwrite an unrelated listing.
                duplicateAction: isDuplicate ? (mismatch ? 'skip' : 'update') : next[i].duplicateAction,
                selected: serverResult.status === 'ready' || (isDuplicate && !mismatch),
              }
            }
            validIndex++
          }
          return next
        })
      })
      .catch((err: Error) => {
        setError(`Failed to check for duplicates: ${err.message}. Go back and try again.`)
        // Do NOT promote unchecked rows to Ready: with no duplicate check every
        // row (including ones carrying an existing property's ID) would import
        // as a brand-new property. Leave them unimportable instead.
        setRowStates((prev) =>
          prev.map((r) =>
            r.serverStatus === 'pending'
              ? { ...r, serverStatus: 'error', serverErrors: ['Duplicate check failed — go back and retry'], selected: false }
              : r
          )
        )
      })
      .finally(() => setIsValidating(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const ready = rowStates.filter((r) => r.serverStatus === 'ready' && r.selected).length
    const duplicates = rowStates.filter((r) => r.serverStatus === 'duplicate').length
    const errors = rowStates.filter((r) => r.serverStatus === 'error').length
    const selectedDuplicates = rowStates.filter((r) => r.serverStatus === 'duplicate' && r.selected).length
    const idConflicts = rowStates.filter((r) => r.serverStatus === 'duplicate' && r.addressMismatch).length
    const unconfirmedConflicts = rowStates.filter((r) => r.serverStatus === 'duplicate' && r.addressMismatch && !r.selected).length
    const total = ready + selectedDuplicates
    return { ready, duplicates, errors, selectedDuplicates, idConflicts, unconfirmedConflicts, total }
  }, [rowStates])

  const photoFolderMapped = useMemo(() => Object.values(mapping).includes('photo_folder'), [mapping])

  const matchSummary = useMemo(() => {
    if (!photoArchive) return null
    const values = rowStates
      .filter((r) => r.selected && r.serverStatus !== 'error')
      .map((r) => (r.data.photo_folder ? String(r.data.photo_folder) : ''))
    return summarizeMatches(values, photoArchive)
  }, [rowStates, photoArchive])

  const filteredRowStates = useMemo(() => {
    if (statusFilter === 'all') return rowStates.map((r, i) => ({ ...r, originalIndex: i }))
    return rowStates
      .map((r, i) => ({ ...r, originalIndex: i }))
      .filter((r) => r.serverStatus === statusFilter)
  }, [rowStates, statusFilter])

  const toggleRow = useCallback((index: number) => {
    setRowStates((prev) => {
      const next = [...prev]
      const row = next[index]
      if (row.serverStatus === 'error') return prev
      // A skipped ID conflict can't be selected via the checkbox; the user must
      // expand the row and choose an action explicitly.
      if (row.addressMismatch && row.duplicateAction === 'skip') return prev
      const selected = !row.selected
      // Re-selecting a skipped duplicate means "update it" — never "create a
      // second copy", which is what a selected row with action 'skip' would do.
      const duplicateAction =
        row.serverStatus === 'duplicate' && selected && row.duplicateAction === 'skip' ? 'update' : row.duplicateAction
      next[index] = { ...row, selected, duplicateAction }
      return next
    })
  }, [])

  const toggleExpand = useCallback((index: number) => {
    setRowStates((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], expanded: !next[index].expanded }
      return next
    })
  }, [])

  const setDuplicateAction = useCallback((index: number, action: DuplicateAction) => {
    setRowStates((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        duplicateAction: action,
        selected: action !== 'skip',
      }
      return next
    })
  }, [])

  const setAllDuplicateAction = useCallback((action: DuplicateAction) => {
    setRowStates((prev) =>
      prev.map((r) => {
        if (r.serverStatus !== 'duplicate') return r
        // ID/address conflicts are never bulk-confirmed; each one must be chosen explicitly.
        if (r.addressMismatch && action !== 'skip') return r
        return { ...r, duplicateAction: action, selected: action !== 'skip' }
      })
    )
  }, [])

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)

    try {
      // Work on copies so re-hosted photo URLs and stripped transient fields don't
      // mutate the on-screen rowStates (which would skew the preview on a retry).
      const selected = rowStates
        .map((r, originalIndex) => ({ ...r, originalIndex, data: { ...r.data } }))
        .filter((r) => r.selected && r.serverStatus !== 'error')

      if (selected.length === 0) {
        setError('No rows selected for import.')
        setIsImporting(false)
        return
      }

      // --- Phase A: re-host matched photos (browser → Supabase Storage) ---
      let photosUploaded = 0
      let photoErrors = 0
      const photoIssues: string[] = []

      if (photoArchive) {
        const withPhotos = selected.filter((r) => {
          const key = r.data.photo_folder ? normalizeFolderKey(String(r.data.photo_folder)) : ''
          return key && photoArchive.folders.has(key)
        })

        for (let k = 0; k < withPhotos.length; k++) {
          const r = withPhotos[k]
          setImportProgress(`Uploading photos: ${k + 1} of ${withPhotos.length} properties...`)
          const label = String(r.data.photo_folder)
          const key = normalizeFolderKey(label)
          const entries = photoArchive.folders.get(key)!
          try {
            const files = await materializeFolder(entries)
            const { urls, failures } = await uploadPhotosWithResults(files, 'admin')
            // Set whatever succeeded — a few bad images don't lose the rest.
            if (urls.length > 0) {
              r.data.cover_photo_url = urls[0]
              r.data.media_gallery_urls = urls
              photosUploaded += urls.length
            }
            if (failures.length > 0) {
              photoErrors += failures.length
              photoIssues.push(
                `${label}: ${failures.length} of ${files.length} image(s) failed (${failures[0].message})`
              )
            }
          } catch (photoErr: any) {
            // Folder couldn't be read/uploaded at all — non-fatal; row still imports.
            console.error('Photo processing failed for folder', key, photoErr)
            photoErrors += entries.length
            photoIssues.push(`${label}: photos could not be processed (${photoErr?.message || 'unknown error'})`)
          }
        }
      }

      // Strip transient (non-column) fields before sending to the server.
      for (const r of selected) {
        for (const field of TRANSIENT_FIELDS) delete r.data[field]
      }
      // Fields the user mapped from their file — the only ones the results file should echo.
      const mappedFields = Object.values(mapping).filter((f) => !TRANSIENT_FIELDS.has(f))

      // --- Phase B: build import rows and batch-create (existing flow) ---
      const importRows = selected.map((r) => {
        if (r.serverStatus === 'duplicate') {
          return {
            action: r.duplicateAction === 'update' ? 'update' : 'create',
            existingId: r.duplicateAction === 'update' ? r.match?.id : undefined,
            data: r.data,
          }
        }
        return { action: 'create' as const, data: r.data }
      })

      const aggregatedSummary = { created: 0, updated: 0, skipped: 0, errors: [] as { index: number; message: string }[] }
      const importedRows: ImportedRow[] = []
      const totalBatches = Math.ceil(importRows.length / BATCH_SIZE)

      for (let i = 0; i < totalBatches; i++) {
        const offset = i * BATCH_SIZE
        const batch = importRows.slice(offset, offset + BATCH_SIZE)
        setImportProgress(`Importing batch ${i + 1} of ${totalBatches}...`)

        const result = await bulkCreate(batch)
        aggregatedSummary.created += result.created
        aggregatedSummary.updated += result.updated
        aggregatedSummary.skipped += result.skipped
        // Error indices are batch-local positions in `selected`; map them back to
        // the file's row number so "Row N" in the summary is the line to fix.
        aggregatedSummary.errors.push(
          ...(result.errors || []).map((e: { index: number; message: string }) => ({
            ...e,
            index: selected[offset + e.index]?.originalIndex ?? offset + e.index,
          }))
        )
        // Database-assigned IDs, so the user can reconcile their master sheet.
        for (const r of (result.results || []) as { index: number; id: string; action: 'created' | 'updated' }[]) {
          const source = selected[offset + r.index]
          if (source) importedRows.push({ id: r.id, action: r.action, data: pickImportedData(source.data, mappedFields) })
        }
      }

      aggregatedSummary.skipped += rowStates.filter((r) => !r.selected || r.serverStatus === 'error').length
      onImportComplete({ ...aggregatedSummary, photosUploaded, photoErrors, photoIssues, importedRows })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsImporting(false)
      setImportProgress(null)
    }
  }

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Checking for duplicates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-navy">Review & Import</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review the data below before importing. All new properties will be created as <span className="font-medium">drafts</span>.
        </p>
      </div>

      {/* Summary bar — click to filter */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg p-3 text-center transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-navy bg-navy/5' : 'bg-gray-50 border border-gray-200 hover:shadow-md'
          }`}
        >
          <p className="text-2xl font-bold text-navy">{rowStates.length}</p>
          <p className="text-xs text-gray-600">All</p>
        </button>
        <button
          onClick={() => setStatusFilter('ready')}
          className={`rounded-lg p-3 text-center transition-all ${
            statusFilter === 'ready' ? 'ring-2 ring-green-500 bg-green-50' : 'bg-green-50 border border-green-200 hover:shadow-md'
          }`}
        >
          <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
          <p className="text-xs text-green-600">Ready</p>
        </button>
        <button
          onClick={() => setStatusFilter('duplicate')}
          className={`rounded-lg p-3 text-center transition-all ${
            statusFilter === 'duplicate' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'bg-yellow-50 border border-yellow-200 hover:shadow-md'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-700">{stats.duplicates}</p>
          <p className="text-xs text-yellow-600">Duplicates</p>
        </button>
        <button
          onClick={() => setStatusFilter('error')}
          className={`rounded-lg p-3 text-center transition-all ${
            statusFilter === 'error' ? 'ring-2 ring-red-500 bg-red-50' : 'bg-red-50 border border-red-200 hover:shadow-md'
          }`}
        >
          <p className="text-2xl font-bold text-red-700">{stats.errors}</p>
          <p className="text-xs text-red-600">Errors</p>
        </button>
      </div>

      {/* Photo column mapped but no ZIP provided */}
      {!photoArchive && photoFolderMapped && (
        <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <PhotoIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              You mapped a column to <span className="font-medium">Photo Folder (ZIP)</span> but didn&apos;t add a
              photos ZIP. Properties will import without photos. Go back to Upload to add one.
            </p>
          </div>
        </div>
      )}

      {/* Photo archive match preview */}
      {photoArchive && (
        <div className={`rounded-lg border p-4 ${
          !photoFolderMapped ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <PhotoIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${!photoFolderMapped ? 'text-yellow-600' : 'text-blue-600'}`} />
            <div className="text-sm space-y-1">
              {!photoFolderMapped ? (
                <p className="text-yellow-800">
                  You added a photos ZIP ({photoArchive.totalImages} image{photoArchive.totalImages !== 1 ? 's' : ''} in{' '}
                  {photoArchive.folders.size} folder{photoArchive.folders.size !== 1 ? 's' : ''}), but no column is mapped to{' '}
                  <span className="font-medium">Photo Folder (ZIP)</span>. Go back to Map Columns to match it, or photos will be skipped.
                </p>
              ) : (
                <>
                  <p className="text-blue-900">
                    <span className="font-semibold">{matchSummary?.matchedRows ?? 0}</span> of {stats.total} selected
                    {' '}propert{stats.total !== 1 ? 'ies' : 'y'} matched a photo folder
                    {' '}(<span className="font-semibold">{matchSummary?.matchedImages ?? 0}</span> image
                    {(matchSummary?.matchedImages ?? 0) !== 1 ? 's' : ''} will be hosted).
                  </p>
                  {matchSummary && matchSummary.unmatchedRows.length > 0 && (
                    <p className="text-yellow-700">
                      ⚠ {matchSummary.unmatchedRows.length} selected row
                      {matchSummary.unmatchedRows.length !== 1 ? 's have' : ' has'} a photo_folder with no matching folder:{' '}
                      <span className="font-mono text-xs">{matchSummary.unmatchedRows.slice(0, 5).join(', ')}</span>
                      {matchSummary.unmatchedRows.length > 5 ? ` +${matchSummary.unmatchedRows.length - 5} more` : ''}
                    </p>
                  )}
                  {matchSummary && matchSummary.unusedFolders.length > 0 && (
                    <p className="text-gray-600">
                      {matchSummary.unusedFolders.length} folder
                      {matchSummary.unusedFolders.length !== 1 ? 's' : ''} in the ZIP went unused:{' '}
                      <span className="font-mono text-xs">{matchSummary.unusedFolders.slice(0, 5).join(', ')}</span>
                      {matchSummary.unusedFolders.length > 5 ? ` +${matchSummary.unusedFolders.length - 5} more` : ''}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Every ID in the file failed to resolve — almost certainly a mis-mapped column */}
      {noIdsMatched && (
        <div className="rounded-lg border bg-red-50 border-red-200 p-4">
          <div className="flex items-start gap-3">
            <XCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm text-red-900 space-y-1">
              <p className="font-medium">None of the Property IDs in this file match a property on the site.</p>
              <p className="text-red-800">
                If this file didn&apos;t come from the site&apos;s Export (for example an old Wix export), its ID column
                holds different identifiers. Go back to Map Columns and set that column to <span className="font-medium">Skip</span>;
                rows will then match by address instead.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ID / address conflicts need explicit confirmation */}
      {stats.idConflicts > 0 && (
        <div className="rounded-lg border bg-orange-50 border-orange-200 p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-orange-600" />
            <div className="text-sm text-orange-900 space-y-1">
              <p>
                <span className="font-semibold">{stats.idConflicts}</span> row{stats.idConflicts !== 1 ? 's have' : ' has'} a
                Property ID that belongs to a property at a <span className="font-semibold">different address</span>.
                {stats.unconfirmedConflicts > 0
                  ? ` ${stats.unconfirmedConflicts} will be skipped unless you expand each one and choose Update Existing.`
                  : ' All have been confirmed.'}
              </p>
              <p className="text-orange-800">
                This usually means an ID was pasted from the wrong line. Check before updating, because the existing
                property&apos;s data would be overwritten. &quot;Update All&quot; leaves these rows alone.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Batch duplicate actions */}
      {stats.duplicates > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">All duplicates:</span>
          <button onClick={() => setAllDuplicateAction('skip')} className="px-2 py-1 rounded text-xs font-medium border border-gray-300 hover:bg-gray-100">
            Skip All
          </button>
          <button onClick={() => setAllDuplicateAction('update')} className="px-2 py-1 rounded text-xs font-medium border border-yellow-300 text-yellow-700 hover:bg-yellow-50">
            Update All
          </button>
          <button onClick={() => setAllDuplicateAction('create')} className="px-2 py-1 rounded text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-50">
            Create All New
          </button>
        </div>
      )}

      {/* Row list */}
      {statusFilter !== 'all' && (
        <p className="text-xs text-gray-500">
          Showing {filteredRowStates.length} {statusFilter} row{filteredRowStates.length !== 1 ? 's' : ''} of {rowStates.length} total
        </p>
      )}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b">
              <th className="w-8 px-3 py-2" />
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Address</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">City</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">State</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Beds</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Baths</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filteredRowStates.map((row) => (
              <RowEntry
                key={row.originalIndex}
                index={row.originalIndex}
                row={row}
                onToggleSelect={toggleRow}
                onToggleExpand={toggleExpand}
                onDuplicateAction={setDuplicateAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} disabled={isImporting}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          {importProgress && <span className="text-sm text-gray-600">{importProgress}</span>}
          <Button
            variant="primary"
            onClick={handleImport}
            isLoading={isImporting}
            disabled={stats.total === 0}
          >
            Import {stats.total} {stats.total === 1 ? 'Property' : 'Properties'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Row Entry sub-component ---

function RowEntry({
  index,
  row,
  onToggleSelect,
  onToggleExpand,
  onDuplicateAction,
}: {
  index: number
  row: RowState
  onToggleSelect: (i: number) => void
  onToggleExpand: (i: number) => void
  onDuplicateAction: (i: number, action: DuplicateAction) => void
}) {
  const statusBadge = {
    ready: { icon: CheckCircleIcon, color: 'text-green-600 bg-green-50', label: 'Ready' },
    duplicate: row.addressMismatch
      ? { icon: ExclamationTriangleIcon, color: 'text-orange-700 bg-orange-50', label: 'ID conflict' }
      : row.matchedBy === 'id'
        ? { icon: ExclamationTriangleIcon, color: 'text-yellow-600 bg-yellow-50', label: 'Existing (by ID)' }
        : { icon: ExclamationTriangleIcon, color: 'text-yellow-600 bg-yellow-50', label: 'Duplicate' },
    error: { icon: XCircleIcon, color: 'text-red-600 bg-red-50', label: 'Error' },
    pending: { icon: CheckCircleIcon, color: 'text-gray-400 bg-gray-50', label: 'Checking...' },
  }[row.serverStatus]

  const Icon = statusBadge.icon

  return (
    <>
      <tr className={`border-b last:border-0 ${row.selected ? '' : 'opacity-50'}`}>
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => onToggleSelect(index)}
            disabled={row.serverStatus === 'error' || (row.addressMismatch && row.duplicateAction === 'skip')}
            title={row.addressMismatch && row.duplicateAction === 'skip' ? 'Expand the row to confirm this ID conflict' : undefined}
            className="rounded border-gray-300 text-navy focus:ring-navy"
          />
        </td>
        <td className="px-3 py-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {statusBadge.label}
          </span>
        </td>
        <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-[200px]">
          {row.data.street_address || '—'}
          {row.serverStatus === 'error' && (
            <p className="text-xs text-red-600 mt-0.5">
              {(row.serverErrors || row.clientValidation.errors).join(', ')}
            </p>
          )}
        </td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.city || '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.state || '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.beds ?? '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.baths ?? '—'}</td>
        <td className="px-3 py-2">
          {(row.serverStatus === 'duplicate' || row.serverStatus === 'error') && (
            <button onClick={() => onToggleExpand(index)} className="p-1 hover:bg-gray-100 rounded">
              {row.expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
          )}
        </td>
      </tr>
      {row.expanded && row.serverStatus === 'duplicate' && row.match && (
        <tr className={row.addressMismatch ? 'bg-orange-50/50' : 'bg-yellow-50/50'}>
          <td colSpan={8} className="px-6 py-4">
            <div className="space-y-3">
              {row.addressMismatch ? (
                <div className="text-sm text-orange-900">
                  <p className="font-medium">
                    The Property ID in this row belongs to a property at a different address.
                  </p>
                  <p className="text-orange-800 mt-0.5">
                    Choose <span className="font-medium">Update Existing</span> only if this row really is meant to
                    change that property (for example, you are correcting its address). Otherwise leave it skipped
                    and fix the ID in your sheet.
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-yellow-800">
                  Existing property found
                  {row.matchedBy === 'id' ? ' by Property ID' : row.matchedBy === 'listing_link' ? ' by listing link' : ''}:
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">File Data</p>
                  <p>{row.data.street_address}, {row.data.city}, {row.data.state} {row.data.zip_code}</p>
                  <p className="text-gray-500">{row.data.beds} beds / {row.data.baths} baths</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Existing Record</p>
                  <p>{row.match.street_address}, {row.match.city}, {row.match.state} {row.match.zip_code}</p>
                  <p className="text-gray-500">Status: {row.match.status}</p>
                  <p className="text-gray-400 font-mono text-xs break-all">{row.match.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(['skip', 'update', 'create'] as DuplicateAction[]).map((action) => (
                  <button
                    key={action}
                    onClick={() => onDuplicateAction(index, action)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                      row.duplicateAction === action
                        ? 'bg-navy text-white border-navy'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {action === 'skip' ? 'Skip' : action === 'update' ? 'Update Existing' : 'Create New'}
                  </button>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
      {row.expanded && row.serverStatus === 'error' && (
        <tr className="bg-red-50/50">
          <td colSpan={8} className="px-6 py-3">
            <ul className="list-disc list-inside text-sm text-red-700">
              {(row.serverErrors || row.clientValidation.errors).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  )
}
