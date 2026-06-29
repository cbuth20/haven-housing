'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { ArrowUpTrayIcon, DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'
import { parsePhotoArchive, type PhotoArchive } from '@/lib/zip-photos'

interface UploadStepProps {
  onParsed: (
    headers: string[],
    rows: Record<string, string>[],
    photoArchive: PhotoArchive | null
  ) => void
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [colCount, setColCount] = useState<number | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null)

  // Optional photos ZIP
  const [zipError, setZipError] = useState<string | null>(null)
  const [isUnzipping, setIsUnzipping] = useState(false)
  const [photoArchive, setPhotoArchive] = useState<PhotoArchive | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setIsParsing(true)
    setFileName(file.name)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false)

        if (results.errors.length > 0 && results.data.length === 0) {
          setError(`Failed to parse CSV: ${results.errors[0].message}`)
          return
        }

        const headers = results.meta.fields || []
        if (headers.length === 0) {
          setError('No column headers found in the CSV file.')
          return
        }

        if (results.data.length === 0) {
          setError('CSV file has headers but no data rows.')
          return
        }

        setRowCount(results.data.length)
        setColCount(headers.length)
        setParsedData({ headers, rows: results.data })
      },
      error: (err) => {
        setIsParsing(false)
        setError(`Failed to read file: ${err.message}`)
      },
    })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }
    handleFile(file)
  }, [handleFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  const handleZip = useCallback((file: File) => {
    setZipError(null)
    setIsUnzipping(true)
    setPhotoArchive(null)
    parsePhotoArchive(file)
      .then((archive) => {
        if (archive.totalImages === 0) {
          const extra = archive.skippedCount > 0
            ? ` ${archive.skippedCount} unsupported file(s) (${archive.skippedExtensions.map((e) => '.' + e).join(', ')}) were ignored — use JPG, PNG, or WebP.`
            : ''
          setZipError(`No supported images found in the ZIP.${extra} Each property needs its own folder of photos.`)
          return
        }
        setPhotoArchive(archive)
      })
      .catch((err: Error) => setZipError(`Failed to read ZIP: ${err.message}`))
      .finally(() => setIsUnzipping(false))
  }, [])

  const onDropZip = useCallback((acceptedFiles: File[], fileRejections: { file: File }[]) => {
    if (acceptedFiles.length === 0) {
      if (fileRejections.length > 0) {
        setZipError('That file was rejected. Please upload a single .zip file.')
      }
      return
    }
    const file = acceptedFiles[0]
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setZipError('Please upload a .zip file.')
      return
    }
    handleZip(file)
  }, [handleZip])

  const {
    getRootProps: getZipRootProps,
    getInputProps: getZipInputProps,
    isDragActive: isZipDragActive,
  } = useDropzone({
    onDrop: onDropZip,
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
    maxFiles: 1,
  })

  const handleContinue = () => {
    if (parsedData) {
      onParsed(parsedData.headers, parsedData.rows, photoArchive)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-navy">Upload CSV File</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload a CSV file containing property data. The first row should be column headers.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-navy bg-navy/5'
            : error
              ? 'border-red-300 bg-red-50'
              : parsedData
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-navy hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {isParsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-2 border-navy border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600">Parsing CSV...</p>
          </div>
        ) : parsedData ? (
          <div className="flex flex-col items-center gap-2">
            <DocumentTextIcon className="h-10 w-10 text-green-600" />
            <p className="font-medium text-green-800">{fileName}</p>
            <p className="text-sm text-green-700">
              Found <span className="font-semibold">{rowCount?.toLocaleString()}</span> rows and{' '}
              <span className="font-semibold">{colCount}</span> columns
            </p>
            <p className="text-xs text-gray-500 mt-1">Drop a different file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop the CSV file here' : 'Drag and drop a CSV file, or click to browse'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Optional photos ZIP */}
      <div className="pt-2">
        <h3 className="text-sm font-medium text-navy">Property photos (.zip) — optional</h3>
        <p className="text-xs text-gray-600 mt-1">
          One folder per property, each folder named to match a{' '}
          <span className="font-mono">photo_folder</span> column in your CSV. Photos are hosted on our
          servers automatically. Use JPG or PNG for reliable display.
        </p>

        <div
          {...getZipRootProps()}
          className={`mt-3 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isZipDragActive
              ? 'border-navy bg-navy/5'
              : zipError
                ? 'border-red-300 bg-red-50'
                : photoArchive
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-navy hover:bg-gray-50'
          }`}
        >
          <input {...getZipInputProps()} />
          {isUnzipping ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-7 w-7 border-2 border-navy border-t-transparent rounded-full" />
              <p className="text-sm text-gray-600">Reading ZIP...</p>
            </div>
          ) : photoArchive ? (
            <div className="flex flex-col items-center gap-1">
              <PhotoIcon className="h-9 w-9 text-green-600" />
              <p className="font-medium text-green-800">{photoArchive.fileName}</p>
              <p className="text-sm text-green-700">
                Found <span className="font-semibold">{photoArchive.folders.size}</span> folder
                {photoArchive.folders.size !== 1 ? 's' : ''} and{' '}
                <span className="font-semibold">{photoArchive.totalImages}</span> image
                {photoArchive.totalImages !== 1 ? 's' : ''}
              </p>
              {photoArchive.skippedCount > 0 && (
                <p className="text-xs text-amber-700">
                  {photoArchive.skippedCount} unsupported file{photoArchive.skippedCount !== 1 ? 's' : ''} ignored
                  ({photoArchive.skippedExtensions.map((e) => '.' + e).join(', ')}) — use JPG, PNG, or WebP
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Drop a different ZIP to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <PhotoIcon className="h-9 w-9 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isZipDragActive ? 'Drop the ZIP here' : 'Drag and drop a photos ZIP, or click to browse'}
              </p>
            </div>
          )}
        </div>

        {zipError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p className="text-red-800 text-sm">{zipError}</p>
          </div>
        )}
      </div>

      {parsedData && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleContinue} disabled={isUnzipping}>
            Continue to Column Mapping
          </Button>
        </div>
      )}
    </div>
  )
}
