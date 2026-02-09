'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  accept?: Record<string, string[]>
  existingUrls?: string[]
  onRemoveExisting?: (url: string) => void
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  existingUrls = [],
  onRemoveExisting,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles)
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [selectedFiles, maxFiles, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return (
    <div className="space-y-4">
      {/* Existing photos */}
      {existingUrls.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Photos
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(url)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload New Photos
        </label>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-navy bg-navy-50'
                : 'border-gray-300 hover:border-navy'
            }
          `}
        >
          <input {...getInputProps()} />
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop photos here, or click to select'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, JPEG, WEBP up to 10MB (max {maxFiles} files)
          </p>
        </div>
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
