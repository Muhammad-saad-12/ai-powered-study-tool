'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Coins,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Mail,
  Zap,
  Terminal,
} from 'lucide-react'

interface User {
  id: string
  email: string
  credits: number
  createdAt: string
  updatedAt?: string
}

interface ApiLog {
  id: string
  timestamp: string
  endpoint: string
  method: string
  status: number
  data: unknown
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Credit action loading state
  const [creditActionLoading, setCreditActionLoading] = useState(false)

  // API logs to verify requests in real time
  const [logs, setLogs] = useState<ApiLog[]>([])

  const addLog = (endpoint: string, method: string, status: number, data: unknown) => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      endpoint,
      method,
      status,
      data,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 7)])
  }

  // Fetch current user from /api/auth/me
  const fetchCurrentUser = useCallback(async () => {
    setIsLoadingUser(true)
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      addLog('/api/auth/me', 'GET', res.status, data)

      if (res.ok && data.user) {
        setCurrentUser(data.user)
      } else {
        setCurrentUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch auth status', err)
      setCurrentUser(null)
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  // Handle register/login form submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setFormLoading(true)

    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      addLog(endpoint, 'POST', res.status, data)

      if (!res.ok) {
        setFormError(data.error || 'Authentication failed')
      } else {
        setFormSuccess(data.message || 'Success!')
        if (data.user) {
          setCurrentUser(data.user)
          setPassword('')
        }
      }
    } catch {
      setFormError('Network error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    setFormLoading(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await res.json()
      addLog('/api/auth/logout', 'POST', res.status, data)
      setCurrentUser(null)
      setFormSuccess('Logged out successfully')
      setFormError(null)
    } catch {
      setFormError('Failed to logout')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle credit consumption or reset
  const handleCreditAction = async (action: 'use' | 'reset') => {
    setCreditActionLoading(true)
    setFormError(null)
    try {
      const res = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      addLog('/api/user/credits', 'POST', res.status, data)

      if (!res.ok) {
        setFormError(data.error || 'Failed to update credits')
      } else if (data.user) {
        setCurrentUser(data.user)
      }
    } catch {
      setFormError('Error connecting to credit service')
    } finally {
      setCreditActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                AI Productivity Platform
              </span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Next.js App Router
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              PostgreSQL & Prisma
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              HTTP-Only Cookies
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        {isLoadingUser ? (
          <div className="flex flex-col items-center justify-center my-auto py-24">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Verifying session via /api/auth/me...</p>
          </div>
        ) : currentUser ? (
          /* ================= Authenticated Dashboard ================= */
          <div className="w-full space-y-6">
            {/* Welcome & Overview Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Authenticated Session
                    </span>
                    <span className="text-xs text-slate-400">ID: {currentUser.id}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome back,{' '}
                    <span className="text-indigo-400">{currentUser.email}</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Your account is configured with full email/password authentication & credit quota.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={formLoading}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700/60 transition shadow-sm hover:text-white"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Metric & Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Credits Card (Prominent requirement) */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-lg shadow-indigo-950/40 md:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Coins className="w-5 h-5 text-amber-400" />
                    Remaining Credits
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      currentUser.credits > 3
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : currentUser.credits > 0
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {currentUser.credits > 0 ? 'Active Quota' : 'Exhausted'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-black tracking-tight text-white">
                    {currentUser.credits}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">credits available</span>
                </div>

                {/* Progress Visual */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 mb-5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      currentUser.credits > 3
                        ? 'bg-gradient-to-r from-indigo-500 to-amber-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentUser.credits / 10) * 100)}%` }}
                  />
                </div>

                {/* Credit Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCreditAction('use')}
                    disabled={creditActionLoading || currentUser.credits <= 0}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-md shadow-indigo-600/20"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    Simulate AI Action (-1 Credit)
                  </button>
                  <button
                    onClick={() => handleCreditAction('reset')}
                    disabled={creditActionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Credits to Default (10)
                  </button>
                </div>
              </div>

              {/* Account Details Card */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md md:col-span-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Security & Token Info
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-slate-400 mb-0.5">Authentication Mode</div>
                      <div className="text-slate-200 font-medium">HTTP-Only Cookie (`auth_token`)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-slate-400 mb-0.5">JWT Algorithm</div>
                      <div className="text-slate-200 font-medium">HMAC-SHA256 (via jose library)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-slate-400 mb-0.5">Password Hash</div>
                      <div className="text-slate-200 font-medium">bcryptjs (Salt rounds: 10)</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={fetchCurrentUser}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test GET /api/auth/me Sync
                </button>
              </div>

              {/* Database Schema Card */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md md:col-span-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Prisma User Model Schema
                  </h3>
                  <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-800 space-y-1">
                    <div><span className="text-purple-400">id</span>: String @id @default(cuid())</div>
                    <div><span className="text-purple-400">email</span>: {currentUser.email}</div>
                    <div><span className="text-purple-400">PasswordHash</span>: [bcrypt hash stored]</div>
                    <div><span className="text-purple-400">credits</span>: {currentUser.credits} (default: 10)</div>
                    <div><span className="text-purple-400">createdAt</span>: {new Date(currentUser.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Synced with PostgreSQL database</span>
                </div>
              </div>
            </div>

            {/* Live API Console / Diagnostic Log */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Live API Activity Console
                </div>
                <span className="text-xs text-slate-500">Real-time HTTP responses</span>
              </div>
              <div className="bg-slate-950 rounded-xl border border-slate-800/90 p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <p className="text-slate-500 italic">No API events triggered yet</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 border-b border-slate-900 pb-2">
                      <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          log.status < 300
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {log.method} {log.status}
                      </span>
                      <span className="text-indigo-300 font-semibold">{log.endpoint}</span>
                      <span className="text-slate-400 truncate max-w-md">
                        {JSON.stringify(log.data)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= Unauthenticated Auth View ================= */
          <div className="w-full max-w-md my-auto py-8">
            {/* Auth Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {authMode === 'register' ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  {authMode === 'register'
                    ? 'Register now to receive 10 complimentary AI credits'
                    : 'Sign in to access your dashboard and remaining credits'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register')
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register (POST)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login (POST)
                </button>
              </div>

              {/* Error & Success Alerts */}
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {formLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : authMode === 'register' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register & Get 10 Credits
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Demo Helper */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Default Initial Credits:</span>
                <span className="font-semibold text-amber-400">10 credits</span>
              </div>
            </div>

            {/* Quick API Features Summary */}
            <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
              <div>✓ ZOD Schema Validation • bcryptjs (10 rounds)</div>
              <div>✓ JOSE JWT Token in HTTP-Only Cookie</div>
              <div>✓ PostgreSQL User Model with Prisma ORM</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        AI Productivity Tool • Next.js TypeScript Tailwind Prisma PostgreSQL
      </footer>
    </div>
  )
}
