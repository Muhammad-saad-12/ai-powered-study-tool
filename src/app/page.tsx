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
  FileText,
  UploadCloud,
  FileUp,
  File,
  Clock,
  Layers,
  BookOpen,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Check,
  X,
  Award,
  Edit2,
  Trash2,
  Plus,
  Search,
} from 'lucide-react'

interface User {
  email: string
  credits: number
  createdAt: string
}

interface Flashcard {
  id: string
  front: string
  back: string
  createdAt: string
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  createdAt: string
}

interface DocumentItem {
  id: string
  title: string
  content: string
  summary?: string | null
  fileType: string
  flashcards?: Flashcard[]
  quizQuestions?: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

// Minimal Structured Study Summary Viewer (Dark Mode)
function MarkdownSummaryViewer({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-4 font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('## Executive Overview')) {
          return (
            <div key={idx} className="pt-2 pb-1.5 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                Executive Overview
              </span>
            </div>
          )
        }
        if (trimmed.startsWith('## Key Concepts')) {
          return (
            <div key={idx} className="pt-3 pb-1.5 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Key Concepts
              </span>
            </div>
          )
        }
        if (trimmed.startsWith('## Actionable Takeaways')) {
          return (
            <div key={idx} className="pt-3 pb-1.5 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                Actionable Takeaways
              </span>
            </div>
          )
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={idx} className="text-xs font-semibold uppercase tracking-wider text-zinc-100 pt-2">
              {trimmed.substring(3)}
            </h4>
          )
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 shrink-0" />
              <span>{trimmed.substring(2)}</span>
            </div>
          )
        }
        if (!trimmed) {
          return <div key={idx} className="h-0.5" />
        }
        return (
          <p key={idx} className="text-zinc-300">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

// Flat, Clean Flashcard Deck Viewer (Dark Mode)
function FlashcardDeckViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 font-mono text-xs">
        No flashcards available in this deck.
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Header controls & counter */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-0.5">
        <span className="font-mono text-xs font-medium text-zinc-300">
          Card {currentIndex + 1} / {flashcards.length}
        </span>
        <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
          <RotateCw className="w-3 h-3" />
          Click card to flip
        </span>
      </div>

      {/* Flat Notion/Linear styled Flashcard (Dark Mode) */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer select-none relative min-h-[220px] rounded-lg p-6 sm:p-7 flex flex-col justify-between transition-all bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border ${
              isFlipped
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700/60'
            }`}
          >
            {isFlipped ? 'Answer / Explanation' : 'Prompt / Concept'}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            #{currentIndex + 1}
          </span>
        </div>

        <div className="my-auto py-5 text-center">
          <p
            className={`text-base sm:text-lg leading-relaxed transition-all ${
              isFlipped ? 'text-zinc-200 font-normal' : 'text-zinc-100 font-medium'
            }`}
          >
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </div>

        <div className="text-center font-mono text-[11px] text-zinc-500">
          {isFlipped ? 'Click to show prompt' : 'Click anywhere on card to reveal answer'}
        </div>
      </div>

      {/* Deck Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-zinc-200 border border-zinc-800 transition shadow-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {flashcards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsFlipped(false)
                setCurrentIndex(idx)
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-4 bg-zinc-100'
                  : 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
              }`}
              title={`Card ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-zinc-200 border border-zinc-800 transition shadow-xs"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// Flat, Clean Multiple-Choice Quiz (Dark Mode)
function InteractiveQuizViewer({ questions }: { questions: QuizQuestion[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({})

  if (!questions || questions.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 font-mono text-xs">
        No quiz questions available for this document.
      </div>
    )
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const correctCount = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc
  }, 0)

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }))
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Quiz Header & Score Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs shadow-xs">
        <div>
          <span className="font-semibold text-zinc-100 text-xs block">
            Comprehension Challenge
          </span>
          <span className="text-zinc-400 font-mono text-[11px]">
            {questions.length} questions available
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-zinc-500 font-mono text-[10px] block uppercase">Score</span>
            <span className="font-mono text-xs font-semibold text-zinc-100">
              {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
            </span>
          </div>

          {answeredCount > 0 && (
            <button
              onClick={handleResetQuiz}
              className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] font-medium border border-zinc-800 transition shadow-xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3.5">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[qIndex]
          const isAnswered = typeof selectedOption === 'number'
          const isCorrect = selectedOption === q.correctIndex

          return (
            <div
              key={q.id || qIndex}
              className="p-4 sm:p-5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {q.options.map((opt, optIndex) => {
                  let optStyle =
                    'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/70 text-zinc-200'

                  if (isAnswered) {
                    if (optIndex === q.correctIndex) {
                      optStyle =
                        'border-emerald-600 bg-emerald-950/40 text-emerald-200 font-medium'
                    } else if (optIndex === selectedOption) {
                      optStyle =
                        'border-rose-700 bg-rose-950/40 text-rose-200 font-medium'
                    } else {
                      optStyle = 'border-zinc-800/60 bg-zinc-950/30 opacity-40 text-zinc-500'
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={`text-left p-2.5 rounded-md border text-xs transition flex items-center justify-between gap-2 ${optStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-zinc-800 flex items-center justify-center font-mono text-[10px] font-bold text-zinc-400 shrink-0">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && optIndex === q.correctIndex && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered &&
                        optIndex === selectedOption &&
                        optIndex !== q.correctIndex && (
                          <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                    </button>
                  )
                })}
              </div>

              {isAnswered && (
                <div
                  className={`p-3 rounded-md border text-xs leading-relaxed transition ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          Incorrect — Correct: Option {String.fromCharCode(65 + q.correctIndex)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-zinc-300 text-[11px] sm:text-xs">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {answeredCount === questions.length && (
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center space-y-2 shadow-xs">
          <Award className="w-6 h-6 text-zinc-300 mx-auto" />
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">Quiz Completed</h4>
          <p className="font-mono text-xs text-zinc-400">
            Score: {correctCount} / {questions.length} correct ({Math.round((correctCount / questions.length) * 100)}%)
          </p>
          <button
            onClick={handleResetQuiz}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Retake Quiz
          </button>
        </div>
      )}
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

  // Documents state & selected active document
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Rename & Delete state
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Add Document drawer state
  const [showUploadDrawer, setShowUploadDrawer] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload')
  const [docTitle, setDocTitle] = useState('')
  const [docContent, setDocContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docSubmitting, setDocSubmitting] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [docSuccess, setDocSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Active study tab for the selected document ('summary' | 'flashcards' | 'quiz' | 'text')
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'text'>('summary')

  // AI Generation states
  const [generatingSummaryDocId, setGeneratingSummaryDocId] = useState<string | null>(null)
  const [generatingStudyMaterialsDocId, setGeneratingStudyMaterialsDocId] = useState<string | null>(null)
  const [summaryErrors, setSummaryErrors] = useState<{ [docId: string]: string }>({})
  const [studyMaterialsErrors, setStudyMaterialsErrors] = useState<{ [docId: string]: string }>({})
  const [isRefilling, setIsRefilling] = useState(false)

  // Handle credits refill (POST /api/credits/refill)
  const handleRefillCredits = async () => {
    setIsRefilling(true)
    try {
      const res = await fetch('/api/credits/refill', {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && typeof data.credits === 'number') {
        setCurrentUser((prev) => (prev ? { ...prev, credits: data.credits } : null))
      } else {
        alert(data.error || 'Failed to refill credits')
      }
    } catch (err) {
      console.error('Error refilling credits:', err)
      alert('Network error while refilling credits')
    } finally {
      setIsRefilling(false)
    }
  }

  // Fetch current user from /api/auth/me
  const fetchCurrentUser = useCallback(async () => {
    setIsLoadingUser(true)
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
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
      if (res.ok && Array.isArray(data.documents)) {
        setDocuments(data.documents)
        setSelectedDocId((prev) => {
          if (prev && data.documents.some((d: DocumentItem) => d.id === prev)) {
            return prev
          }
          return data.documents.length > 0 ? data.documents[0].id : null
        })
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
      setSelectedDocId(null)
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
      await fetch('/api/auth/logout', { method: 'POST' })
      setCurrentUser(null)
      setDocuments([])
      setSelectedDocId(null)
      setFormSuccess('Logged out successfully')
      setFormError(null)
    } catch {
      setFormError('Failed to logout')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle new document submission
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

      if (!res.ok) {
        setDocError(data.error || 'Failed to process document')
      } else {
        setDocSuccess(data.message || 'Document uploaded successfully!')
        if (typeof data.remainingCredits === 'number') {
          setCurrentUser((prev) => (prev ? { ...prev, credits: data.remainingCredits } : null))
        }
        setDocTitle('')
        setDocContent('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setShowUploadDrawer(false)

        await fetchDocuments()
        if (data.document?.id) {
          setSelectedDocId(data.document.id)
          setActiveTab('summary')
        }
      }
    } catch {
      setDocError('Network error occurred while uploading document.')
    } finally {
      setDocSubmitting(false)
    }
  }

  // Handle renaming document title (PATCH /api/documents/[id])
  const handleRenameDocument = async (docId: string) => {
    if (!editingTitle.trim()) {
      return
    }

    setIsRenaming(true)
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.document) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, title: data.document.title } : d))
        )
        setEditingDocId(null)
      } else {
        alert(data.error || 'Failed to rename document')
      }
    } catch (err) {
      console.error('Rename error:', err)
      alert('Error updating document title')
    } finally {
      setIsRenaming(false)
    }
  }

  // Handle deleting document (DELETE /api/documents/[id])
  const handleDeleteDocument = async (docId: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (res.ok) {
        setDocuments((prev) => {
          const updated = prev.filter((d) => d.id !== docId)
          if (selectedDocId === docId) {
            setSelectedDocId(updated.length > 0 ? updated[0].id : null)
          }
          return updated
        })
        setDeletingDocId(null)
      } else {
        alert(data.error || 'Failed to delete document')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting document')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle generating study summary
  const handleGenerateSummary = async (docId: string) => {
    if (currentUser && currentUser.credits < 1) {
      setSummaryErrors((prev) => ({
        ...prev,
        [docId]: 'Insufficient credits! You need at least 1 credit to generate a summary.',
      }))
      return
    }

    setSummaryErrors((prev) => ({ ...prev, [docId]: '' }))
    setGeneratingSummaryDocId(docId)
    setActiveTab('summary')

    try {
      const res = await fetch(`/api/documents/${docId}/summary`, {
        method: 'POST',
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        setSummaryErrors((prev) => ({
          ...prev,
          [docId]:
            data?.error ||
            `Summary generation failed (HTTP ${res.status}). Please check your connection or GEMINI_API_KEY.`,
        }))
        fetchCurrentUser()
        return
      }

      if (typeof data.credits === 'number') {
        setCurrentUser((prev) => (prev ? { ...prev, credits: data.credits } : null))
      }

      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, summary: data.summary } : d))
      )
    } catch (err) {
      console.error('Error generating summary:', err)
      setSummaryErrors((prev) => ({
        ...prev,
        [docId]: err instanceof Error ? err.message : 'Network error generating summary.',
      }))
    } finally {
      setGeneratingSummaryDocId(null)
    }
  }

  // Handle generating flashcards & quiz
  const handleGenerateStudyMaterials = async (docId: string) => {
    if (currentUser && currentUser.credits < 1) {
      setStudyMaterialsErrors((prev) => ({
        ...prev,
        [docId]: 'Insufficient credits! You need at least 1 credit to generate flashcards & quiz.',
      }))
      return
    }

    setStudyMaterialsErrors((prev) => ({ ...prev, [docId]: '' }))
    setGeneratingStudyMaterialsDocId(docId)
    setActiveTab('flashcards')

    try {
      const res = await fetch(`/api/documents/${docId}/study-materials`, {
        method: 'POST',
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        setStudyMaterialsErrors((prev) => ({
          ...prev,
          [docId]:
            data?.error ||
            `Failed to generate study materials (HTTP ${res.status}). Please try again.`,
        }))
        fetchCurrentUser()
        return
      }

      if (typeof data.credits === 'number') {
        setCurrentUser((prev) => (prev ? { ...prev, credits: data.credits } : null))
      }

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                flashcards: data.flashcards || [],
                quizQuestions: data.quizQuestions || [],
              }
            : d
        )
      )
    } catch (err) {
      console.error('Error generating study materials:', err)
      setStudyMaterialsErrors((prev) => ({
        ...prev,
        [docId]: err instanceof Error ? err.message : 'Network error generating study materials.',
      }))
    } finally {
      setGeneratingStudyMaterialsDocId(null)
    }
  }

  // Filtered documents by search
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeDoc = documents.find((d) => d.id === selectedDocId)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Application Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">
                StudyMind
              </span>
              <span className="px-1.5 py-0.5 font-mono text-[10px] font-medium rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hidden sm:inline-block">
                workspace
              </span>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Credit Balance Badge & Refill */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono shadow-xs">
                  <Coins className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{currentUser.credits} credits</span>
                </div>
                <button
                  onClick={handleRefillCredits}
                  disabled={isRefilling}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-mono text-xs transition shadow-xs disabled:opacity-50"
                  title="Refill 5 credits (max 20)"
                >
                  {isRefilling ? '+...' : '+5 Refill'}
                </button>
              </div>

              {/* User Email & Logout */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 hidden md:inline-block max-w-[180px] truncate">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={formLoading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition shadow-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                PostgreSQL
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                JWT Auth
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col">
        {isLoadingUser ? (
          <div className="flex flex-col items-center justify-center my-auto py-24">
            <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin mb-3" />
            <p className="text-zinc-500 font-mono text-xs">Loading workspace...</p>
          </div>
        ) : currentUser ? (
          /* ================= Authenticated Split-Panel Study Workspace ================= */
          <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto border-x border-zinc-800/80 bg-zinc-950">
            {/* Left Sidebar: Document Management & Upload Drawer */}
            <aside className="w-full md:w-80 lg:w-88 shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col space-y-3.5">
              {/* New Document Button */}
              <button
                onClick={() => {
                  setShowUploadDrawer(!showUploadDrawer)
                  setDocError(null)
                  setDocSuccess(null)
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                {showUploadDrawer ? 'Close Form' : 'Add Document'}
              </button>

              {/* Upload / Paste Document Drawer */}
              {showUploadDrawer && (
                <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3 shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                      <FileUp className="w-3.5 h-3.5 text-zinc-400" />
                      Add Study Material
                    </span>
                    <div className="flex p-0.5 bg-zinc-950 rounded-md border border-zinc-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setInputMode('upload')}
                        className={`px-2 py-0.5 rounded font-medium transition ${
                          inputMode === 'upload' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-400'
                        }`}
                      >
                        File
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('paste')}
                        className={`px-2 py-0.5 rounded font-medium transition ${
                          inputMode === 'paste' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-400'
                        }`}
                      >
                        Paste
                      </button>
                    </div>
                  </div>

                  {docError && (
                    <div className="p-2.5 rounded-md bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{docError}</span>
                    </div>
                  )}

                  <form onSubmit={handleDocumentSubmit} className="space-y-2.5">
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
                    />

                    {inputMode === 'upload' ? (
                      <div>
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
                          id="sidebar-file-upload"
                        />
                        <label
                          htmlFor="sidebar-file-upload"
                          className="cursor-pointer border border-dashed border-zinc-700 hover:border-zinc-600 rounded-md p-3.5 text-center block bg-zinc-950/60 transition"
                        >
                          <UploadCloud className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                          <span className="text-xs text-zinc-200 font-medium block truncate">
                            {selectedFile ? selectedFile.name : 'Choose PDF or TXT'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <textarea
                        rows={4}
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        placeholder="Paste study notes, lecture content, or articles..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-mono leading-relaxed"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={
                        docSubmitting ||
                        currentUser.credits < 1 ||
                        (inputMode === 'upload' && !selectedFile) ||
                        (inputMode === 'paste' && !docContent.trim())
                      }
                      className="w-full py-1.5 rounded-md bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 text-xs font-medium transition shadow-xs"
                    >
                      {docSubmitting ? 'Parsing...' : 'Upload & Parse (-1 Credit)'}
                    </button>
                  </form>
                </div>
              )}

              {/* Document List Header & Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-0.5">
                  <span className="font-mono text-xs font-medium text-zinc-300">
                    Documents ({documents.length})
                  </span>
                  <button
                    onClick={fetchDocuments}
                    disabled={isLoadingDocs}
                    className="hover:text-zinc-100 text-zinc-400 transition"
                    title="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter documents..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
                  />
                </div>
              </div>

              {/* Scrollable Document List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[calc(100vh-270px)]">
                {isLoadingDocs && documents.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-zinc-500" />
                    Loading documents...
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 font-mono text-xs rounded-lg border border-dashed border-zinc-800 p-4 bg-zinc-900/40">
                    <File className="w-5 h-5 mx-auto mb-1 text-zinc-600" />
                    {documents.length === 0 ? 'No documents uploaded yet.' : 'No matching documents found.'}
                  </div>
                ) : (
                  filteredDocuments.map((doc) => {
                    const isSelected = selectedDocId === doc.id
                    const isEditingThis = editingDocId === doc.id
                    const isDeletingThis = deletingDocId === doc.id
                    const hasSummary = Boolean(doc.summary)
                    const hasFlashcards = (doc.flashcards?.length || 0) > 0
                    const hasQuiz = (doc.quizQuestions?.length || 0) > 0

                    return (
                      <div
                        key={doc.id}
                        className={`group relative rounded-md border p-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-900 border-zinc-600 shadow-xs ring-1 ring-zinc-700/60'
                            : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                        onClick={() => {
                          if (!isEditingThis) {
                            setSelectedDocId(doc.id)
                          }
                        }}
                      >
                        {isEditingThis ? (
                          /* Inline Rename Input */
                          <div
                            className="space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              autoFocus
                              className="w-full bg-zinc-950 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRenameDocument(doc.id)}
                                disabled={isRenaming}
                                className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-[11px] font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingDocId(null)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : isDeletingThis ? (
                          /* Delete Confirmation Prompt */
                          <div
                            className="p-1 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[11px] font-medium text-rose-300 block">
                              Delete document & study materials?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                disabled={isDeleting}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-medium"
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </button>
                              <button
                                onClick={() => setDeletingDocId(null)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Document Card */
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-medium text-zinc-100 truncate leading-snug">
                                  {doc.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                                  <span className="px-1.5 py-0.2 rounded font-mono font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                                    {doc.fileType}
                                  </span>
                                  <span className="font-mono text-zinc-500">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Inline Rename and Delete Action Buttons */}
                              <div
                                className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setEditingDocId(doc.id)
                                    setEditingTitle(doc.title)
                                  }}
                                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
                                  title="Rename document"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeletingDocId(doc.id)}
                                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                                  title="Delete document"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Deck Indicators */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {hasSummary && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                                  <BookOpen className="w-2.5 h-2.5 text-zinc-400" />
                                  Summary
                                </span>
                              )}
                              {hasFlashcards && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                                  <Layers className="w-2.5 h-2.5 text-zinc-400" />
                                  {doc.flashcards?.length} Cards
                                </span>
                              )}
                              {hasQuiz && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                                  <HelpCircle className="w-2.5 h-2.5 text-zinc-400" />
                                  Quiz
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </aside>

            {/* Right Main Panel: Active Document Study Workspace */}
            <main className="flex-1 flex flex-col p-4 sm:p-6 bg-zinc-950 overflow-y-auto">
              {activeDoc ? (
                <div className="space-y-4">
                  {/* Active Document Header Card */}
                  <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                            {activeDoc.fileType}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(activeDoc.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {activeDoc.content.length.toLocaleString()} chars
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight">
                          {activeDoc.title}
                        </h2>
                      </div>

                      {/* AI Generation Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Summary Button */}
                        <button
                          onClick={() => handleGenerateSummary(activeDoc.id)}
                          disabled={
                            generatingSummaryDocId === activeDoc.id ||
                            generatingStudyMaterialsDocId === activeDoc.id ||
                            currentUser.credits < 1
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition shadow-xs ${
                            activeDoc.summary
                              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
                              : 'bg-zinc-100 hover:bg-white text-zinc-950'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {generatingSummaryDocId === activeDoc.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Summarizing...
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                              {activeDoc.summary ? 'Re-Summary (-1)' : 'Summary (-1)'}
                            </>
                          )}
                        </button>

                        {/* Flashcards & Quiz Button */}
                        <button
                          onClick={() => handleGenerateStudyMaterials(activeDoc.id)}
                          disabled={
                            generatingSummaryDocId === activeDoc.id ||
                            generatingStudyMaterialsDocId === activeDoc.id ||
                            currentUser.credits < 1
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition shadow-xs ${
                            (activeDoc.flashcards?.length || 0) > 0
                              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
                              : 'bg-zinc-100 hover:bg-white text-zinc-950'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {generatingStudyMaterialsDocId === activeDoc.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Generating Deck...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                              {(activeDoc.flashcards?.length || 0) > 0
                                ? 'Regenerate Deck (-1)'
                                : 'Flashcards & Quiz (-1)'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error Alerts */}
                  {summaryErrors[activeDoc.id] && (
                    <div className="p-3 rounded-md bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{summaryErrors[activeDoc.id]}</span>
                    </div>
                  )}
                  {studyMaterialsErrors[activeDoc.id] && (
                    <div className="p-3 rounded-md bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{studyMaterialsErrors[activeDoc.id]}</span>
                    </div>
                  )}

                  {/* Interactive Study Workspace Tabs */}
                  <div className="space-y-3">
                    {/* Minimal Tab Navigation */}
                    <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'summary'
                            ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Study Summary
                        {activeDoc.summary && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab('flashcards')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'flashcards'
                            ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Flashcard Deck
                        <span className="font-mono text-[11px] opacity-80">
                          ({activeDoc.flashcards?.length || 0})
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveTab('quiz')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'quiz'
                            ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Comprehension Quiz
                        <span className="font-mono text-[11px] opacity-80">
                          ({activeDoc.quizQuestions?.length || 0})
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveTab('text')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'text'
                            ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Original Text
                      </button>
                    </div>

                    {/* TAB CONTENT 1: Summary */}
                    {activeTab === 'summary' && (
                      <div className="pt-1">
                        {generatingSummaryDocId === activeDoc.id ? (
                          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs">
                            <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
                            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                              Generating Complete Study Summary...
                            </h4>
                            <p className="font-mono text-xs text-zinc-400 max-w-md">
                              Synthesizing executive overview, key concepts, and takeaways via Gemini AI.
                            </p>
                          </div>
                        ) : activeDoc.summary ? (
                          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-xs">
                            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                              <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase">
                                Structured Study Summary
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                              </span>
                            </div>
                            <MarkdownSummaryViewer content={activeDoc.summary} />
                          </div>
                        ) : (
                          <div className="p-8 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 space-y-2.5">
                            <BookOpen className="w-6 h-6 text-zinc-500 mx-auto" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                                No study summary generated yet
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                                Extract core themes, definitions, and takeaways with one click.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateSummary(activeDoc.id)}
                              disabled={currentUser.credits < 1}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Generate Summary (-1 Credit)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT 2: Flashcards */}
                    {activeTab === 'flashcards' && (
                      <div className="pt-1">
                        {generatingStudyMaterialsDocId === activeDoc.id ? (
                          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs">
                            <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
                            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                              Generating Active-Recall Flashcards...
                            </h4>
                            <p className="font-mono text-xs text-zinc-400 max-w-md">
                              Extracting key definitions into an interactive flip-card deck.
                            </p>
                          </div>
                        ) : (activeDoc.flashcards?.length || 0) > 0 ? (
                          <FlashcardDeckViewer flashcards={activeDoc.flashcards || []} />
                        ) : (
                          <div className="p-8 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 space-y-2.5">
                            <Layers className="w-6 h-6 text-zinc-500 mx-auto" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                                No flashcards created yet
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                                Generate 6 high-yield flip cards and 5 quiz questions for this document.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateStudyMaterials(activeDoc.id)}
                              disabled={currentUser.credits < 1}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Generate Flashcards & Quiz (-1 Credit)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT 3: Quiz */}
                    {activeTab === 'quiz' && (
                      <div className="pt-1">
                        {generatingStudyMaterialsDocId === activeDoc.id ? (
                          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs">
                            <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
                            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                              Generating Comprehension Quiz...
                            </h4>
                            <p className="font-mono text-xs text-zinc-400 max-w-md">
                              Creating multiple-choice questions with instant grading and explanations.
                            </p>
                          </div>
                        ) : (activeDoc.quizQuestions?.length || 0) > 0 ? (
                          <InteractiveQuizViewer questions={activeDoc.quizQuestions || []} />
                        ) : (
                          <div className="p-8 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 space-y-2.5">
                            <HelpCircle className="w-6 h-6 text-zinc-500 mx-auto" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                                No quiz questions created yet
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                                Generate 5 multiple-choice questions with instant grading and explanations.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateStudyMaterials(activeDoc.id)}
                              disabled={currentUser.credits < 1}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Generate Flashcards & Quiz (-1 Credit)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT 4: Original Text */}
                    {activeTab === 'text' && (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                          <span className="font-semibold text-zinc-300">
                            Extracted Source Text
                          </span>
                          <span>{activeDoc.content.length.toLocaleString()} characters</span>
                        </div>
                        <div className="p-4 sm:p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono max-h-[600px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-xs">
                          {activeDoc.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty Workspace (No document selected) */
                <div className="my-auto py-16 text-center max-w-sm mx-auto space-y-3">
                  <div className="w-10 h-10 rounded-md bg-zinc-900 text-zinc-300 flex items-center justify-center mx-auto border border-zinc-800 shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Study Workspace</h3>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      Select a document from the left sidebar or upload a new PDF / TXT note to begin.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadDrawer(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Upload Document
                  </button>
                </div>
              )}
            </main>
          </div>
        ) : (
          /* ================= Unauthenticated Login / Register View ================= */
          <div className="w-full max-w-sm mx-auto my-auto py-12 px-4">
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 shadow-xs p-6">
              <div className="text-center mb-5">
                <div className="inline-flex w-9 h-9 rounded-md bg-zinc-100 items-center justify-center text-zinc-950 shadow-xs mb-2.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                  {authMode === 'register' ? 'Create an Account' : 'Welcome to StudyMind'}
                </h2>
                <p className="text-zinc-400 font-mono text-xs mt-1">
                  {authMode === 'register'
                    ? '10 initial credits credited on register'
                    : 'Sign in to access your workspace'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-0.5 bg-zinc-950 rounded-md mb-4 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register')
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  className={`py-1.5 font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  className={`py-1.5 font-medium rounded transition flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </button>
              </div>

              {/* Error & Success Alerts */}
              {formError && (
                <div className="mb-3.5 p-2.5 rounded-md bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="mb-3.5 p-2.5 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-xs disabled:opacity-50"
                >
                  {formLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : authMode === 'register' ? (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Register & Receive 10 Credits
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-800/80 py-2.5 px-4 text-center font-mono text-[11px] text-zinc-500 bg-zinc-950">
        StudyMind • Active-Recall Study Workspace • PostgreSQL & Gemini
      </footer>
    </div>
  )
}
