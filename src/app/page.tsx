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
  Bot,
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

// Markdown Viewer for Structured Study Summaries
function MarkdownSummaryViewer({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-4 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
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

// Interactive Flip-Card Flashcard Deck
function FlashcardDeckViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs">
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
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header controls & counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-semibold text-slate-300">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <span className="text-slate-500 flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
          Click card to flip
        </span>
      </div>

      {/* 3D-styled Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer select-none relative min-h-[240px] rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.01] border shadow-xl bg-gradient-to-br from-slate-900 to-slate-950 border-indigo-500/30 hover:border-indigo-500/60"
      >
        <div className="flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              isFlipped
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {isFlipped ? 'Answer / Explanation (Back)' : 'Core Concept / Prompt (Front)'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            #{currentIndex + 1}
          </span>
        </div>

        <div className="my-auto py-4 text-center">
          <p
            className={`text-base sm:text-lg font-medium leading-relaxed transition-all duration-200 ${
              isFlipped ? 'text-amber-200' : 'text-white font-semibold'
            }`}
          >
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          {isFlipped ? 'Click to flip back to front' : 'Click anywhere on card to reveal answer'}
        </div>
      </div>

      {/* Deck Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 border border-slate-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
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
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-indigo-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`Card ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 border border-slate-800 transition"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Interactive Multiple-Choice Quiz with Instant Grading
function InteractiveQuizViewer({ questions }: { questions: QuizQuestion[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({})

  if (!questions || questions.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-xs">
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Quiz Header & Score Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <span className="font-semibold text-white text-sm block">
            Comprehension Challenge
          </span>
          <span className="text-slate-400">
            Answer all {questions.length} questions to test your knowledge
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-slate-400 text-[11px] block">Current Score</span>
            <span className="text-sm font-bold text-amber-400">
              {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
            </span>
          </div>

          {answeredCount > 0 && (
            <button
              onClick={handleResetQuiz}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
            >
              Reset Quiz
            </button>
          )}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[qIndex]
          const isAnswered = typeof selectedOption === 'number'
          const isCorrect = selectedOption === q.correctIndex

          return (
            <div
              key={q.id || qIndex}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <h4 className="text-sm font-semibold text-white leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIndex) => {
                  let optStyle =
                    'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300'

                  if (isAnswered) {
                    if (optIndex === q.correctIndex) {
                      optStyle =
                        'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-semibold shadow-emerald-500/10'
                    } else if (optIndex === selectedOption) {
                      optStyle =
                        'border-red-500/60 bg-red-500/10 text-red-300 font-semibold'
                    } else {
                      optStyle = 'border-slate-900 bg-slate-950/60 opacity-40 text-slate-500'
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${optStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-slate-800/80 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && optIndex === q.correctIndex && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered &&
                        optIndex === selectedOption &&
                        optIndex !== q.correctIndex && (
                          <X className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                    </button>
                  )
                })}
              </div>

              {isAnswered && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct Answer!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Incorrect — Correct: Option {String.fromCharCode(65 + q.correctIndex)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] sm:text-xs">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {answeredCount === questions.length && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 text-center space-y-2">
          <Award className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Quiz Completed!</h4>
          <p className="text-xs text-slate-300">
            You scored {correctCount} out of {questions.length} questions correctly.
          </p>
          <button
            onClick={handleResetQuiz}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
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
        // Select first document automatically if none selected
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                StudyMind AI
              </span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden sm:inline-block">
                Workspace
              </span>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Credit Balance Badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs sm:text-sm shadow-sm">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{currentUser.credits} Credits Remaining</span>
              </div>

              {/* User Email & Logout */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden md:inline-block max-w-[180px] truncate">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={formLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                PostgreSQL
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Secure Auth
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col">
        {isLoadingUser ? (
          <div className="flex flex-col items-center justify-center my-auto py-32">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading your study workspace...</p>
          </div>
        ) : currentUser ? (
          /* ================= Authenticated Split-Panel Study Workspace ================= */
          <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto border-x border-slate-800/80">
            {/* Left Sidebar: Document Management & Upload Drawer */}
            <aside className="w-full md:w-80 lg:w-96 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-4 sm:p-5 flex flex-col space-y-4">
              {/* New Document Button */}
              <button
                onClick={() => {
                  setShowUploadDrawer(!showUploadDrawer)
                  setDocError(null)
                  setDocSuccess(null)
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                {showUploadDrawer ? 'Close Upload Form' : 'Add New Document'}
              </button>

              {/* Upload / Paste Document Drawer */}
              {showUploadDrawer && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileUp className="w-4 h-4 text-indigo-400" />
                      Add Study Material
                    </span>
                    <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setInputMode('upload')}
                        className={`px-2 py-1 rounded font-medium ${
                          inputMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        File
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('paste')}
                        className={`px-2 py-1 rounded font-medium ${
                          inputMode === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Paste
                      </button>
                    </div>
                  </div>

                  {docError && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{docError}</span>
                    </div>
                  )}

                  <form onSubmit={handleDocumentSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                          className="cursor-pointer border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 text-center block bg-slate-950/60 transition"
                        >
                          <UploadCloud className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                          <span className="text-xs text-indigo-300 font-medium block truncate">
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
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
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow transition"
                    >
                      {docSubmitting ? 'Parsing...' : 'Upload & Parse (-1 Credit)'}
                    </button>
                  </form>
                </div>
              )}

              {/* Document List Header & Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">
                    Documents ({documents.length})
                  </span>
                  <button
                    onClick={fetchDocuments}
                    disabled={isLoadingDocs}
                    className="hover:text-white transition"
                    title="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Scrollable Document List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[calc(100vh-280px)]">
                {isLoadingDocs && documents.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading documents...
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs rounded-xl border border-dashed border-slate-800/80 p-4">
                    <File className="w-6 h-6 mx-auto mb-1 text-slate-600" />
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
                        className={`group relative rounded-xl border p-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-indigo-500/70 shadow-md shadow-indigo-950/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
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
                              className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRenameDocument(doc.id)}
                                disabled={isRenaming}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingDocId(null)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
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
                            <span className="text-[11px] font-medium text-red-300 block">
                              Delete this document & its study decks?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                disabled={isDeleting}
                                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold"
                              >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                              </button>
                              <button
                                onClick={() => setDeletingDocId(null)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
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
                                <h4 className="text-xs font-semibold text-white truncate leading-snug">
                                  {doc.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase border border-indigo-500/20">
                                    {doc.fileType}
                                  </span>
                                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Inline Rename and Delete Action Buttons */}
                              <div
                                className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setEditingDocId(doc.id)
                                    setEditingTitle(doc.title)
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Rename document"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingDocId(doc.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                                  title="Delete document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Deck Indicators */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {hasSummary && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  <Sparkles className="w-2 h-2" />
                                  Summary
                                </span>
                              )}
                              {hasFlashcards && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Layers className="w-2 h-2" />
                                  {doc.flashcards?.length} Cards
                                </span>
                              )}
                              {hasQuiz && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <HelpCircle className="w-2 h-2" />
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
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-950 overflow-y-auto">
              {activeDoc ? (
                <div className="space-y-6">
                  {/* Active Document Header Banner */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 p-5 sm:p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {activeDoc.fileType}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Uploaded on {new Date(activeDoc.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400">
                            {activeDoc.content.length.toLocaleString()} characters
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                          {activeDoc.title}
                        </h2>
                      </div>

                      {/* AI Generation Action Buttons */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Summary Button */}
                        <button
                          onClick={() => handleGenerateSummary(activeDoc.id)}
                          disabled={
                            generatingSummaryDocId === activeDoc.id ||
                            generatingStudyMaterialsDocId === activeDoc.id ||
                            currentUser.credits < 1
                          }
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                            activeDoc.summary
                              ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {generatingSummaryDocId === activeDoc.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Summarizing...
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          {generatingStudyMaterialsDocId === activeDoc.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Generating Deck...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{summaryErrors[activeDoc.id]}</span>
                    </div>
                  )}
                  {studyMaterialsErrors[activeDoc.id] && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{studyMaterialsErrors[activeDoc.id]}</span>
                    </div>
                  )}

                  {/* Interactive Study Workspace Tabs */}
                  <div className="space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                          activeTab === 'summary'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
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
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                          activeTab === 'flashcards'
                            ? 'bg-amber-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Flashcard Deck ({activeDoc.flashcards?.length || 0})
                      </button>

                      <button
                        onClick={() => setActiveTab('quiz')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                          activeTab === 'quiz'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Comprehension Quiz ({activeDoc.quizQuestions?.length || 0})
                      </button>

                      <button
                        onClick={() => setActiveTab('text')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                          activeTab === 'text'
                            ? 'bg-slate-800 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Original Text
                      </button>
                    </div>

                    {/* TAB CONTENT 1: Summary */}
                    {activeTab === 'summary' && (
                      <div className="pt-2">
                        {generatingSummaryDocId === activeDoc.id ? (
                          <div className="rounded-2xl bg-gradient-to-br from-purple-950/20 to-indigo-950/20 border border-purple-500/30 p-10 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">
                              Generating Complete Study Summary...
                            </h4>
                            <p className="text-xs text-slate-400 max-w-md">
                              Synthesizing executive overview, key concepts, and actionable takeaways using Gemini AI.
                            </p>
                          </div>
                        ) : activeDoc.summary ? (
                          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-slate-200">
                                  Structured Study Summary
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                              </span>
                            </div>
                            <MarkdownSummaryViewer content={activeDoc.summary} />
                          </div>
                        ) : (
                          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 space-y-3">
                            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                            <div>
                              <h4 className="text-sm font-semibold text-slate-300">
                                No study summary generated yet
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                Extract core themes, definitions, and takeaways with one click.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateSummary(activeDoc.id)}
                              disabled={currentUser.credits < 1}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              Generate Summary (-1 Credit)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT 2: Flashcards */}
                    {activeTab === 'flashcards' && (
                      <div className="pt-2">
                        {generatingStudyMaterialsDocId === activeDoc.id ? (
                          <div className="rounded-2xl bg-gradient-to-br from-amber-950/20 to-indigo-950/20 border border-amber-500/30 p-10 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">
                              Generating Active-Recall Flashcards...
                            </h4>
                            <p className="text-xs text-slate-400 max-w-md">
                              Extracting key definitions and concepts into an interactive flip-card deck.
                            </p>
                          </div>
                        ) : (activeDoc.flashcards?.length || 0) > 0 ? (
                          <FlashcardDeckViewer flashcards={activeDoc.flashcards || []} />
                        ) : (
                          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 space-y-3">
                            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                            <div>
                              <h4 className="text-sm font-semibold text-slate-300">
                                No flashcards created yet
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                Generate 6 high-yield flip cards and 5 quiz questions for this document.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateStudyMaterials(activeDoc.id)}
                              disabled={currentUser.credits < 1}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              Generate Flashcards & Quiz (-1 Credit)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT 3: Quiz */}
                    {activeTab === 'quiz' && (
                      <div className="pt-2">
                        {generatingStudyMaterialsDocId === activeDoc.id ? (
                          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/30 p-10 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">
                              Generating Comprehension Quiz...
                            </h4>
                            <p className="text-xs text-slate-400 max-w-md">
                              Creating multiple-choice questions with instant grading and explanations.
                            </p>
                          </div>
                        ) : (activeDoc.quizQuestions?.length || 0) > 0 ? (
                          <InteractiveQuizViewer questions={activeDoc.quizQuestions || []} />
                        ) : (
                          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 space-y-3">
                            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                            <div>
                              <h4 className="text-sm font-semibold text-slate-300">
                                No quiz questions created yet
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                Generate 5 multiple-choice questions with instant grading and explanations.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateStudyMaterials(activeDoc.id)}
                              disabled={currentUser.credits < 1}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              Generate Flashcards & Quiz (-1 Credit)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB CONTENT 4: Original Text */}
                    {activeTab === 'text' && (
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">
                            Extracted Plain Text
                          </span>
                          <span>{activeDoc.content.length.toLocaleString()} characters</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono max-h-[600px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                          {activeDoc.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty Workspace (No document selected) */
                <div className="my-auto py-20 text-center max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Your Study Workspace</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Select a document from the left sidebar to explore summaries, flashcards, and quizzes, or upload a new PDF / TXT file.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadDrawer(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                  >
                    <Plus className="w-4 h-4" />
                    Upload First Document
                  </button>
                </div>
              )}
            </main>
          </div>
        ) : (
          /* ================= Unauthenticated Login / Register View ================= */
          <div className="w-full max-w-md mx-auto my-auto py-12 px-4">
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
              <div className="text-center mb-6">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {authMode === 'register' ? 'Create an Account' : 'Welcome to StudyMind AI'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  {authMode === 'register'
                    ? 'Register now to receive 10 complimentary study credits'
                    : 'Sign in to access your documents and study decks'}
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
                  Register
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
                  Login
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
                      Register & Receive 10 Credits
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 px-4 text-center text-xs text-slate-600">
        StudyMind AI • Active-Recall Study Workspace • PostgreSQL & Gemini
      </footer>
    </div>
  )
}
