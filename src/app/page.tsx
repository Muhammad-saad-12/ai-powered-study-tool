'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  FileText,
  UploadCloud,
  FileUp,
  File,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  BookOpen,
  Bot,
} from 'lucide-react'

interface User {
  id: string
  email: string
  credits: number
  createdAt: string
  updatedAt?: string
}

interface DocumentItem {
  id: string
  title: string
  content: string
  summary?: string | null
  fileType: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface ApiLog {
  id: string
  timestamp: string
  endpoint: string
  method: string
  status: number
  data: unknown
}

// Formatted Markdown viewer for structured summaries
function MarkdownSummaryViewer({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-3 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('## Executive Overview')) {
          return (
            <div key={idx} className="pt-2 pb-1 border-b border-indigo-500/30">
              <span className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Executive Overview
              </span>
            </div>
          )
        }
        if (trimmed.startsWith('## Key Concepts')) {
          return (
            <div key={idx} className="pt-4 pb-1 border-b border-amber-500/30">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Key Concepts
              </span>
            </div>
          )
        }
        if (trimmed.startsWith('## Actionable Takeaways')) {
          return (
            <div key={idx} className="pt-4 pb-1 border-b border-emerald-500/30">
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Actionable Takeaways
              </span>
            </div>
          )
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-slate-100 pt-3">
              {trimmed.substring(3)}
            </h4>
          )
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <span>{trimmed.substring(2)}</span>
            </div>
          )
        }
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }
        return (
          <p key={idx} className="text-slate-300">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
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

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)

  // Live Summary Streaming state
  const [activeStreamingDocId, setActiveStreamingDocId] = useState<string | null>(null)
  const [streamedSummaries, setStreamedSummaries] = useState<{ [docId: string]: string }>({})
  const [summaryErrors, setSummaryErrors] = useState<{ [docId: string]: string }>({})

  // Document upload/paste form state
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload')
  const [docTitle, setDocTitle] = useState('')
  const [docContent, setDocContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docSubmitting, setDocSubmitting] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [docSuccess, setDocSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Quick Credit action loading state
  const [creditActionLoading, setCreditActionLoading] = useState(false)

  // Live API logs
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
    setLogs((prev) => [newLog, ...prev.slice(0, 9)])
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

  // Fetch user's documents from /api/documents
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      addLog('/api/documents', 'GET', res.status, data)

      if (res.ok && Array.isArray(data.documents)) {
        setDocuments(data.documents)
      }
    } catch (err) {
      console.error('Failed to fetch documents', err)
    } finally {
      setIsLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (currentUser) {
      fetchDocuments()
    } else {
      setDocuments([])
    }
  }, [currentUser, fetchDocuments])

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
      setDocuments([])
      setFormSuccess('Logged out successfully')
      setFormError(null)
    } catch {
      setFormError('Failed to logout')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle document submission (file upload or text paste)
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocError(null)
    setDocSuccess(null)

    if (currentUser && currentUser.credits < 1) {
      setDocError('Insufficient credits! You need at least 1 credit to process a document.')
      return
    }

    setDocSubmitting(true)

    try {
      let res: Response

      if (inputMode === 'upload') {
        if (!selectedFile) {
          setDocError('Please select a PDF or TXT file to upload')
          setDocSubmitting(false)
          return
        }

        const formData = new FormData()
        formData.append('file', selectedFile)
        if (docTitle.trim()) {
          formData.append('title', docTitle.trim())
        }

        res = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        })
      } else {
        if (!docContent.trim()) {
          setDocError('Please paste or enter document content')
          setDocSubmitting(false)
          return
        }

        res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: docTitle.trim() || undefined,
            content: docContent.trim(),
            fileType: 'text',
          }),
        })
      }

      const data = await res.json()
      addLog('/api/documents', 'POST', res.status, data)

      if (!res.ok) {
        setDocError(data.error || 'Failed to process document')
      } else {
        setDocSuccess(data.message || 'Document uploaded and 1 credit deducted!')
        if (typeof data.remainingCredits === 'number') {
          setCurrentUser((prev) => (prev ? { ...prev, credits: data.remainingCredits } : null))
        }
        setDocTitle('')
        setDocContent('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        fetchDocuments()
      }
    } catch {
      setDocError('Network error occurred while uploading document.')
    } finally {
      setDocSubmitting(false)
    }
  }

  // Handle streaming summary generation with Gemini 3.8 Flash
  const handleGenerateSummary = async (docId: string) => {
    if (currentUser && currentUser.credits < 1) {
      setSummaryErrors((prev) => ({
        ...prev,
        [docId]: 'Insufficient credits! You need at least 1 credit to generate a summary.',
      }))
      setExpandedDocId(docId)
      return
    }

    setSummaryErrors((prev) => ({ ...prev, [docId]: '' }))
    setActiveStreamingDocId(docId)
    setExpandedDocId(docId) // automatically open document details
    setStreamedSummaries((prev) => ({ ...prev, [docId]: '' }))

    // Optimistically deduct 1 credit from UI
    setCurrentUser((prev) => (prev ? { ...prev, credits: Math.max(0, prev.credits - 1) } : null))

    try {
      const endpoint = `/api/documents/${docId}/summary`
      const res = await fetch(endpoint, {
        method: 'POST',
      })

      const remainingHeader = res.headers.get('X-Remaining-Credits')
      if (remainingHeader !== null) {
        const parsedCredits = parseInt(remainingHeader, 10)
        if (!isNaN(parsedCredits)) {
          setCurrentUser((prev) => (prev ? { ...prev, credits: parsedCredits } : null))
        }
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Failed to generate summary' }))
        const errorText = errJson.error || `Summary request failed with HTTP ${res.status}`
        addLog(endpoint, 'POST', res.status, errJson)
        setSummaryErrors((prev) => ({
          ...prev,
          [docId]: errorText,
        }))
        // Refund credit on error and keep expanded to show alert
        fetchCurrentUser()
        setActiveStreamingDocId(null)
        setExpandedDocId(docId)
        return
      }

      addLog(endpoint, 'POST', 200, { status: 'Streaming started (Gemini 3.8 Flash)' })

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('ReadableStream not supported on this response')
      }

      const decoder = new TextDecoder()
      let accumulatedSummary = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulatedSummary += chunk
        setStreamedSummaries((prev) => ({
          ...prev,
          [docId]: accumulatedSummary,
        }))
      }

      // If the summary stream returned empty content, display an error alert
      if (!accumulatedSummary.trim()) {
        const emptyMsg = 'The summary stream returned an empty response. Please verify your GEMINI_API_KEY and document contents.'
        setSummaryErrors((prev) => ({
          ...prev,
          [docId]: emptyMsg,
        }))
        addLog(endpoint, 'POST', 500, { error: emptyMsg })
        fetchCurrentUser() // refresh credits
        setExpandedDocId(docId)
        return
      }

      // Update document item in state with saved summary
      setDocuments((prevDocs) =>
        prevDocs.map((d) => (d.id === docId ? { ...d, summary: accumulatedSummary } : d))
      )
    } catch (err) {
      console.error('Error while streaming summary:', err)
      const errorMsg =
        err instanceof Error ? err.message : 'Stream connection interrupted. Please try again.'
      setSummaryErrors((prev) => ({
        ...prev,
        [docId]: `Streaming error: ${errorMsg}`,
      }))
      fetchCurrentUser()
      setExpandedDocId(docId)
    } finally {
      setActiveStreamingDocId(null)
    }
  }

  // Handle quick credit reset or test deduction
  const handleCreditAction = async (action: 'use' | 'reset') => {
    setCreditActionLoading(true)
    setDocError(null)
    try {
      const res = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      addLog('/api/user/credits', 'POST', res.status, data)

      if (!res.ok) {
        setDocError(data.error || 'Failed to update credits')
      } else if (data.user) {
        setCurrentUser(data.user)
      }
    } catch {
      setDocError('Error connecting to credit service')
    } finally {
      setCreditActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
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
                Gemini 3.8 Flash Summary Stream
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col items-center">
        {isLoadingUser ? (
          <div className="flex flex-col items-center justify-center my-auto py-24">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Verifying session via /api/auth/me...</p>
          </div>
        ) : currentUser ? (
          /* ================= Authenticated Dashboard ================= */
          <div className="w-full space-y-8">
            {/* Top Welcome & Summary Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active User Session
                    </span>
                    <span className="text-xs text-slate-400">ID: {currentUser.id}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome back,{' '}
                    <span className="text-indigo-400">{currentUser.email}</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Upload documents or paste text to parse content and stream structured Markdown study summaries powered by Google Gemini 3.8 Flash.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCreditAction('reset')}
                    disabled={creditActionLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-amber-300 text-xs font-medium border border-slate-700/60 transition shadow-sm"
                    title="Reset credits to 10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Credits (10)
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={formLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/60 transition shadow-sm hover:text-white"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Remaining Credits Card */}
              <div className="rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-lg shadow-indigo-950/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Remaining Credits
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      currentUser.credits > 2
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : currentUser.credits > 0
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {currentUser.credits > 0 ? `${currentUser.credits} Available` : '0 Credits (403)'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-white">{currentUser.credits}</span>
                  <span className="text-slate-400 text-xs">credits</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentUser.credits > 2
                        ? 'bg-gradient-to-r from-indigo-500 to-amber-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentUser.credits / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Total Documents Card */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Uploaded Documents
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Saved in PostgreSQL
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{documents.length}</span>
                  <span className="text-slate-400 text-xs">documents parsed</span>
                </div>
              </div>

              {/* Gemini 3.8 Flash Summarizer Metric */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-400" />
                    AI Study Summarizer
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    gemini-3.8-flash
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  Generates Executive Overview, Key Concepts, and Actionable Takeaways via streamText and saves to Document.
                </p>
                <div className="text-[11px] text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  Costs 1 Credit per summary
                </div>
              </div>
            </div>

            {/* Upload Document / Paste Text Section */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileUp className="w-5 h-5 text-indigo-400" />
                    Add New Document
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload a PDF/TXT file to extract plain text with `pdf-parse` or paste content directly. Costs 1 credit.
                  </p>
                </div>

                {/* Input Mode Toggle */}
                <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('upload')
                      setDocError(null)
                      setDocSuccess(null)
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      inputMode === 'upload'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload File (PDF/TXT)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('paste')
                      setDocError(null)
                      setDocSuccess(null)
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      inputMode === 'paste'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Paste Text
                  </button>
                </div>
              </div>

              {/* Status Feedback Alerts */}
              {docError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{docError}</span>
                </div>
              )}
              {docSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{docSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleDocumentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder={
                      inputMode === 'upload'
                        ? 'Leave blank to use filename'
                        : 'e.g. Distributed Consensus Paper'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {inputMode === 'upload' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Choose PDF or TXT File
                    </label>
                    <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-950/40 transition">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,application/pdf,text/plain"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setSelectedFile(file)
                          if (file && !docTitle) {
                            setDocTitle(file.name)
                          }
                        }}
                        className="hidden"
                        id="document-file-input"
                      />
                      <label
                        htmlFor="document-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-1">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        {selectedFile ? (
                          <div className="text-center">
                            <span className="text-sm font-semibold text-emerald-400 block">
                              {selectedFile.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose a different file
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-sm font-medium text-indigo-400 hover:text-indigo-300 block">
                              Click to browse and upload
                            </span>
                            <span className="text-xs text-slate-500">
                              Supports PDF documents and plain TXT files
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">
                        Paste Document Text
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {docContent.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      placeholder="Paste research papers, meeting notes, project specs, or study material here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono leading-relaxed"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cost: 1 Credit</span>
                    <span className="text-slate-600">•</span>
                    <span>Remaining after: {Math.max(0, currentUser.credits - 1)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      docSubmitting ||
                      currentUser.credits < 1 ||
                      (inputMode === 'upload' && !selectedFile) ||
                      (inputMode === 'paste' && !docContent.trim())
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/25"
                  >
                    {docSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Parsing & Deducting Credit...
                      </>
                    ) : (
                      <>
                        <FileUp className="w-4 h-4" />
                        Process & Save Document (-1 Credit)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Uploaded Documents with Summary Generation */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Your Uploaded Documents & AI Summaries
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stream comprehensive Markdown study summaries live using Gemini 3.8 Flash
                  </p>
                </div>

                <button
                  onClick={fetchDocuments}
                  disabled={isLoadingDocs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                  Refresh List
                </button>
              </div>

              {isLoadingDocs && documents.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
                  Loading your documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
                  <File className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">No documents uploaded yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your first PDF or TXT file above to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => {
                    const isExpanded = expandedDocId === doc.id
                    const isStreaming = activeStreamingDocId === doc.id
                    const currentSummary = streamedSummaries[doc.id] || doc.summary
                    const docSummaryError = summaryErrors[doc.id]

                    return (
                      <div
                        key={doc.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-sm"
                      >
                        {/* Header bar */}
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div
                            onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                            className="flex items-center gap-3 min-w-0 cursor-pointer select-none flex-1"
                          >
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                                  {doc.title}
                                </h3>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase shrink-0">
                                  {doc.fileType}
                                </span>
                                {currentSummary && (
                                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Summarized
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(doc.createdAt).toLocaleDateString()} at{' '}
                                  {new Date(doc.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span>•</span>
                                <span>{doc.content.length.toLocaleString()} characters</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                            {/* Generate Summary Button */}
                            <button
                              onClick={() => handleGenerateSummary(doc.id)}
                              disabled={isStreaming || currentUser.credits < 1}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                                currentSummary
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              {isStreaming ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Streaming Summary...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                  {currentSummary ? 'Regenerate Summary (-1)' : 'Generate Summary (-1)'}
                                </>
                              )}
                            </button>

                            {/* Accordion toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Error Alert for Summary */}
                        {docSummaryError && (
                          <div className="mx-4 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{docSummaryError}</span>
                          </div>
                        )}

                        {/* Collapsible Content & Summary Section */}
                        {isExpanded && (
                          <div className="border-t border-slate-800/80 bg-slate-900/40 p-4 sm:p-6 space-y-5">
                            {/* Structured AI Study Summary Box */}
                            {(currentSummary || isStreaming) && (
                              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/20 border border-purple-500/30 p-5 shadow-lg shadow-purple-950/20">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-500/20">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                      <Bot className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-purple-300">
                                      Structured Study Summary
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      (Gemini 3.8 Flash)
                                    </span>
                                  </div>

                                  {isStreaming && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                                      Streaming Live Tokens...
                                    </span>
                                  )}
                                </div>

                                <MarkdownSummaryViewer content={currentSummary || ''} />

                                {isStreaming && (
                                  <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-1 align-middle" />
                                )}
                              </div>
                            )}

                            {/* Raw Parsed Content */}
                            <div>
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  Original Parsed Text Content
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  ID: {doc.id}
                                </span>
                              </div>
                              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                                {doc.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Live API Console / Diagnostic Log */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Live API Activity Console
                </div>
                <span className="text-xs text-slate-500">Real-time HTTP requests & responses</span>
              </div>
              <div className="bg-slate-950 rounded-xl border border-slate-800/90 p-4 font-mono text-xs max-h-44 overflow-y-auto space-y-2">
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
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
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
                    : 'Sign in to access your dashboard and uploaded documents'}
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

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Default Initial Credits:</span>
                <span className="font-semibold text-amber-400">10 credits</span>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
              <div>✓ ZOD Schema Validation • bcryptjs (10 rounds)</div>
              <div>✓ JOSE JWT Token in HTTP-Only Cookie</div>
              <div>✓ Gemini 3.8 Flash Streaming Study Summaries</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        AI Productivity Tool • Next.js App Router • Prisma PostgreSQL • Google Gemini 3.8 Flash
      </footer>
    </div>
  )
}
