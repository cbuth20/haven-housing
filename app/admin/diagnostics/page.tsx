'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: any
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const diagnostics: DiagnosticResult[] = []

    // Test 1: Environment variables
    diagnostics.push({
      test: 'Environment Variables',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL &&
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'success'
        : 'error',
      message: process.env.NEXT_PUBLIC_SUPABASE_URL &&
               process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'Supabase environment variables are set'
        : 'Missing Supabase environment variables',
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      },
    })
    setResults([...diagnostics])

    // Test 2: Supabase connection
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('count', { count: 'exact', head: true })

      diagnostics.push({
        test: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error
          ? `Connection failed: ${error.message}`
          : 'Successfully connected to Supabase',
        details: error || { count: data },
      })
    } catch (err: any) {
      diagnostics.push({
        test: 'Supabase Connection',
        status: 'error',
        message: 'Connection error',
        details: err,
      })
    }
    setResults([...diagnostics])

    // Test 3: Auth status
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      diagnostics.push({
        test: 'Authentication',
        status: error ? 'error' : 'success',
        message: session
          ? `Authenticated as: ${session.user.email}`
          : 'Not authenticated (this is normal for public pages)',
        details: session ? { userId: session.user.id } : null,
      })
    } catch (err: any) {
      diagnostics.push({
        test: 'Authentication',
        status: 'error',
        message: 'Auth check failed',
        details: err,
      })
    }
    setResults([...diagnostics])

    // Test 4: User profile
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        diagnostics.push({
          test: 'User Profile',
          status: error ? 'error' : 'success',
          message: error
            ? `Failed to load profile: ${error.message}`
            : `Profile loaded: ${profile?.role}`,
          details: profile || error,
        })
      } else {
        diagnostics.push({
          test: 'User Profile',
          status: 'success',
          message: 'No user logged in',
          details: null,
        })
      }
    } catch (err: any) {
      diagnostics.push({
        test: 'User Profile',
        status: 'error',
        message: 'Profile check failed',
        details: err,
      })
    }
    setResults([...diagnostics])

    // Test 5: Database query
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, status')
        .limit(5)

      diagnostics.push({
        test: 'Database Query',
        status: error ? 'error' : 'success',
        message: error
          ? `Query failed: ${error.message}`
          : `Successfully queried properties (${data?.length || 0} found)`,
        details: data || error,
      })
    } catch (err: any) {
      diagnostics.push({
        test: 'Database Query',
        status: 'error',
        message: 'Query error',
        details: err,
      })
    }
    setResults([...diagnostics])

    // Test 6: Google Maps API key
    diagnostics.push({
      test: 'Google Maps API Key',
      status:
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'placeholder-google-maps-key'
          ? 'success'
          : 'error',
      message:
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'placeholder-google-maps-key'
          ? 'Google Maps API key is configured'
          : 'Google Maps API key is not configured or is placeholder',
      details: {
        isSet: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        isPlaceholder:
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'placeholder-google-maps-key',
      },
    })
    setResults([...diagnostics])

    setIsRunning(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-navy">
          System Diagnostics
        </h1>
        <p className="text-gray-600 mt-2">
          Testing system connections and configuration
        </p>
      </div>

      {isRunning && (
        <div className="flex items-center gap-3 text-gray-600">
          <LoadingSpinner size="sm" />
          <span>Running diagnostics...</span>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-start gap-3">
              {result.status === 'success' ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : result.status === 'error' ? (
                <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <LoadingSpinner size="sm" />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {result.test}
                </h3>
                <p
                  className={`text-sm ${
                    result.status === 'success'
                      ? 'text-green-700'
                      : result.status === 'error'
                      ? 'text-red-700'
                      : 'text-gray-600'
                  }`}
                >
                  {result.message}
                </p>

                {result.details && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Show details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Troubleshooting Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              • If Supabase connection fails, check your{' '}
              <code className="bg-blue-100 px-1 rounded">.env.local</code> file
            </li>
            <li>
              • Make sure you've run the database migrations in Supabase SQL Editor
            </li>
            <li>
              • Verify your Supabase project is active and not paused
            </li>
            <li>
              • Check that RLS policies are enabled on the properties table
            </li>
            <li>
              • For Google Maps, get an API key from Google Cloud Console
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
