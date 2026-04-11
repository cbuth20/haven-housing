'use client'

import { useState, useMemo } from 'react'
import { autoMapColumns, getPropertyFields } from '@/lib/csv-import'
import { Button } from '@/components/common/Button'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface MappingStepProps {
  headers: string[]
  sampleRows: Record<string, string>[]
  onMapped: (mapping: Record<string, string>) => void
  onBack: () => void
}

const REQUIRED_FIELDS = ['street_address', 'city', 'state', 'zip_code']
const SKIP_VALUE = '__skip__'

export function MappingStep({ headers, sampleRows, onMapped, onBack }: MappingStepProps) {
  const propertyFields = useMemo(() => getPropertyFields(), [])
  const [mapping, setMapping] = useState<Record<string, string>>(() => autoMapColumns(headers))

  const usedFields = useMemo(() => {
    return new Set(Object.values(mapping))
  }, [mapping])

  const missingRequired = useMemo(() => {
    const mappedFields = new Set(Object.values(mapping))
    return REQUIRED_FIELDS.filter((f) => !mappedFields.has(f))
  }, [mapping])

  const handleFieldChange = (header: string, value: string) => {
    setMapping((prev) => {
      const next = { ...prev }
      if (value === SKIP_VALUE || value === '') {
        delete next[header]
      } else {
        next[header] = value
      }
      return next
    })
  }

  const mappedCount = Object.keys(mapping).length
  const unmappedCount = headers.length - mappedCount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-navy">Map Columns</h2>
        <p className="text-sm text-gray-600 mt-1">
          Match your CSV columns to property fields.{' '}
          <span className="font-medium text-navy">{mappedCount}</span> mapped,{' '}
          <span className={unmappedCount > 0 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>{unmappedCount} unmapped</span>.
        </p>
      </div>

      {missingRequired.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Required fields not mapped:</p>
            <p className="text-sm text-yellow-700">
              {missingRequired.map((f) => f.replace(/_/g, ' ')).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-1/4">CSV Column</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-1/4">Maps To</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Sample Data (first 3 rows)</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header) => {
              const mappedField = mapping[header]
              const isMapped = !!mappedField

              return (
                <tr key={header} className={`border-b last:border-0 ${isMapped ? '' : 'bg-yellow-50/50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isMapped ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">{header}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mappedField || SKIP_VALUE}
                      onChange={(e) => handleFieldChange(header, e.target.value)}
                      className={`w-full text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy ${
                        isMapped ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <option value={SKIP_VALUE}>— Skip this column —</option>
                      {propertyFields.map(({ value, label }) => (
                        <option
                          key={value}
                          value={value}
                          disabled={usedFields.has(value) && mapping[header] !== value}
                        >
                          {label}{REQUIRED_FIELDS.includes(value) ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {sampleRows.slice(0, 3).map((row, i) => (
                        <span key={i} className="text-xs text-gray-500 truncate max-w-xs block">
                          {row[header] ? (row[header].length > 80 ? row[header].substring(0, 80) + '...' : row[header]) : '(empty)'}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => onMapped(mapping)}
          disabled={missingRequired.length > 0}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  )
}
