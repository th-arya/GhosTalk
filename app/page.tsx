'use client'

import { format } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useGhostAuth } from '@/lib/useGhostAuth'
import { useRoom } from '@/lib/useRoom'
import { createClient } from '@/lib/supabaseClient'

type Room = {
  id: string
  name: string
  icon: string
}

const ROOMS: Room[] = [
  { id: 'shadow_reserve', name: 'General', icon: 'forum' },
  { id: 'global_tether', name: 'Friends', icon: 'group' },
  { id: 'dark_sector', name: 'Study', icon: 'menu_book' },
  { id: 'cozy_corner', name: 'Chill', icon: 'self_improvement' },
]

const GHOST_AVATARS = [
  '👻', '🐺', '🦊', '🐉', '🦅',
  '🦇', '🐍', '🦁', '🐯', '🦈',
  '🦂', '🐙', '🦋', '🐦‍⬛', '🦎',
  '🐸', '🦉', '🦚', '🐲', '🔮',
]

const MOOD_TAGS = [
  { label: 'Gratitude', className: 'bg-primary-container/20 text-primary border-primary/10' },
  { label: 'Peaceful', className: 'bg-secondary-container/30 text-secondary border-secondary/10' },
  { label: 'Curious', className: 'bg-tertiary-container/20 text-tertiary border-tertiary/10' },
  { label: 'Sleepy', className: 'bg-surface-container-high text-on-surface-variant border-outline-variant/10' },
]

function avatarTone(name: string): string {
  const tones = [
    'bg-sky-200/70 text-sky-800',
    'bg-emerald-200/70 text-emerald-800',
    'bg-amber-200/70 text-amber-800',
    'bg-pink-200/70 text-pink-800',
  ]
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash += name.charCodeAt(index)
  }
  return tones[Math.abs(hash) % tones.length]
}

export default function Home() {
  const { ghostName, loading: authLoading } = useGhostAuth()
  const [currentRoom, setCurrentRoom] = useState(ROOMS[0].id)
  const { messages, connected, sendMessage, error, loading, MAX_MESSAGE_LENGTH } = useRoom(currentRoom)

  const [content, setContent] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [customName, setCustomName] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [supabase] = useState(() => createClient())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Restore saved avatar on mount
  useEffect(() => {
    const saved = localStorage.getItem('ghost-avatar')
    if (saved) setSelectedAvatar(saved)
  }, [])

  // Ghost name regeneration
  const regenerateGhostName = async () => {
    const ADJECTIVES = ['Phantom', 'Silent', 'Vigilant', 'Cursed', 'Neon',
      'Hollow', 'Drifting', 'Velvet', 'Rogue', 'Spectral', 'Blazing', 'Frozen']
    const ANIMALS = ['Firefly', 'Armadillo', 'Pangolin', 'Axolotl',
      'Mantis', 'Wombat', 'Capybara', 'Narwhal', 'Manta', 'Viper', 'Cobra', 'Falcon']

    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const newName = `${adj}-${animal}`.toUpperCase()

    try {
      await supabase.auth.updateUser({ data: { ghost_name: newName } })
      window.location.reload()
    } catch (err) {
      console.error('Name regeneration failed:', err)
    }
  }

  // Custom name save
  const saveCustomName = async () => {
    const trimmed = customName.trim()
    if (!trimmed) { setNameError('Name cannot be empty'); return }
    if (trimmed.length < 2) { setNameError('Minimum 2 characters required'); return }
    if (trimmed.length > 20) { setNameError('Maximum 20 characters allowed'); return }
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
      setNameError('Only letters, numbers, - and _ allowed'); return
    }
    try {
      setNameError('')
      const finalName = trimmed.toUpperCase()
      await supabase.auth.updateUser({ data: { ghost_name: finalName } })
      setNameSaved(true)
      setTimeout(() => { setNameSaved(false); window.location.reload() }, 1200)
    } catch (err) {
      setNameError('Save failed — try again')
      console.error(err)
    }
  }

  // Avatar save
  const saveAvatar = (emoji: string) => {
    setSelectedAvatar(emoji)
    localStorage.setItem('ghost-avatar', emoji)
    supabase.auth.updateUser({ data: { ghost_avatar: emoji } }).catch(console.error)
  }

  // Session clear
  const clearSession = async () => {
    const confirmed = window.confirm(
      'GHOST PROTOCOL: Permanently delete your session? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    } catch (err) {
      console.error('Session clear failed:', err)
    }
  }

  const myGhost = ghostName ?? 'Happy-Dolphin'
  const activeRoom = ROOMS.find((room) => room.id === currentRoom) ?? ROOMS[0]
  const charsRemaining = MAX_MESSAGE_LENGTH - content.length

  const onlineCount = useMemo(() => {
    const participants = new Set(messages.map((message) => message.sender_name))
    if (ghostName) participants.add(ghostName)
    return Math.max(1, participants.size)
  }, [messages, ghostName])

  const otherGhosts = useMemo(
    () => Array.from(new Set(messages.map((message) => message.sender_name))).filter((name) => name !== ghostName).slice(0, 4),
    [messages, ghostName]
  )

  const goalCount = Math.min(messages.length, 1000)
  const progressPercent = Math.max(8, Math.round((goalCount / 1000) * 100))

  async function submitMessage() {
    if (!content.trim() || !connected) return
    await sendMessage(content)
    setContent('')
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitMessage()
  }

  return (
    <>
      <div className="organic-blob bg-primary-container size-[38rem] -top-52 -left-48" />
      <div className="organic-blob bg-tertiary-container size-[30rem] -bottom-24 -right-20" />
      <div className="organic-blob bg-secondary-container size-[26rem] top-1/3 right-1/4" />

      <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between bg-white/70 px-4 shadow-[0_20px_50px_rgba(0,101,144,0.05)] backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-headline text-2xl font-bold tracking-tight text-sky-700">GhosTalk</span>
          <span className="hidden border-l border-outline-variant/30 pl-4 font-label text-sm tracking-tight text-slate-500 md:inline">
            Anonymous chat, zero identity required
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <nav className="hidden items-center gap-8 font-label font-semibold text-slate-500 lg:flex">
            <span className="border-b-2 border-sky-400 py-1 font-bold text-sky-700">Rooms</span>
            <span className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-sky-50/70">Discover</span>
            <span className="rounded-full px-3 py-1 transition-all duration-300 hover:bg-sky-50/70">Guidelines</span>
          </nav>

          <button className="rounded-full bg-tertiary-container px-5 py-2 font-headline text-sm font-semibold text-on-tertiary-container transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            Start Chatting
          </button>
        </div>
      </header>

      <div className="flex h-screen overflow-hidden pt-20">
        <aside className="hidden w-80 flex-col gap-4 overflow-y-auto bg-white/40 py-8 backdrop-blur-md md:flex">
          <div className="mb-4 px-8">
            <h2 className="font-headline text-2xl font-bold text-secondary">Rooms</h2>
            <p className="font-body text-sm text-slate-500">Find your vibe</p>
          </div>

          <nav className="flex flex-col gap-1">
            {ROOMS.map((room) => {
              const isActive = room.id === currentRoom
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setCurrentRoom(room.id)}
                  className={`mx-4 flex items-center gap-4 px-8 py-3 text-left font-body text-lg font-medium transition-transform duration-200 ${
                    isActive
                      ? 'rounded-full bg-emerald-100/60 text-emerald-800'
                      : 'text-slate-600 hover:translate-x-1'
                  }`}
                >
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {room.icon}
                  </span>
                  <span>{room.name}</span>
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            className="group relative mx-6 mt-6 overflow-hidden rounded-xl border border-secondary/10 bg-secondary-container/40 p-6 text-left transition-all hover:bg-secondary-container/60"
          >
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-secondary">New Sanctuary?</h4>
              <p className="mt-1 text-xs text-on-secondary-container/80">Host your own private discussion space.</p>
              <div className="mt-4 flex items-center text-sm font-bold text-secondary">
                <span>Create Room</span>
                <span className="material-symbols-outlined ml-2 text-sm">add_circle</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-6xl">spa</span>
            </div>
          </button>

          <div className="mt-auto px-6">
            <div className="flex items-center gap-3 rounded-full border border-outline-variant/10 bg-surface-container-lowest p-3 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-container/30 text-lg">
                {selectedAvatar || '👻'}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate font-headline text-sm font-bold">{myGhost}</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">
                  {connected ? 'Online' : 'Reconnecting'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="text-slate-400 transition-colors hover:text-primary"
                aria-label="Open Settings"
              >
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="relative flex flex-1 flex-col bg-transparent pb-24 md:pb-0">
          <div className="flex h-20 items-center justify-between px-4 sm:px-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="font-headline text-xl font-bold text-on-surface">{activeRoom.name} Room</h1>
                <span className="flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-container">
                  <span className={`size-1.5 rounded-full ${connected ? 'bg-secondary' : 'bg-amber-500'}`} />
                  {onlineCount} online
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 font-label text-xs text-slate-500">
                <span className="material-symbols-outlined text-sm text-tertiary">colors_spark</span>
                Spread good vibes
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button type="button" className="rounded-full p-2 transition-colors hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-slate-500">search</span>
              </button>
              <button type="button" className="rounded-full p-2 transition-colors hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-slate-500">more_vert</span>
              </button>
            </div>
          </div>

          <div className="custom-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            {ROOMS.map((room) => {
              const isActive = room.id === currentRoom
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setCurrentRoom(room.id)}
                  className={`whitespace-nowrap rounded-full border px-4 py-1.5 font-label text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-primary/20 bg-primary-container/50 text-primary'
                      : 'border-outline-variant/20 bg-white/50 text-slate-600'
                  }`}
                >
                  {room.name}
                </button>
              )
            })}
          </div>

          <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="flex flex-col items-center gap-3 py-4 opacity-65">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
              <div className="flex gap-4 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span>Welcome</span>
                <span>•</span>
                <span>You are safe here</span>
                <span>•</span>
                <span>Share freely</span>
              </div>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
            </div>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center font-label text-xs font-semibold text-amber-700">
                {error}
              </div>
            )}

            {(loading || authLoading) && messages.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-12 font-label text-xs uppercase tracking-widest text-slate-400">
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Loading messages...
              </div>
            )}

            {messages.map((message) => {
              const isMe = message.sender_name === ghostName
              const sentAt = message.created_at ? format(new Date(message.created_at), 'h:mm a') : 'just now'

              if (isMe) {
                return (
                  <div key={message.id} className="ml-auto flex max-w-2xl items-end justify-end gap-3">
                    <div className="flex items-end gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-label text-[10px] font-bold text-primary">You</span>
                        <div className="rounded-2xl rounded-br-sm bg-primary-container px-4 py-3 font-body text-on-primary-container shadow-[0_10px_30px_rgba(0,101,144,0.1)]">
                          {message.content}
                        </div>
                      </div>
                      <span className="text-lg mb-1">{selectedAvatar || '👻'}</span>
                    </div>
                    <span className="mb-1 hidden text-[10px] text-slate-400 sm:block">{sentAt}</span>
                  </div>
                )
              }

              return (
                <div key={message.id} className="flex max-w-2xl items-end gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg ${avatarTone(message.sender_name)}`}>
                    {'👻'}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="ml-4 font-label text-[10px] font-bold text-slate-400">{message.sender_name}</span>
                    <div className="rounded-2xl rounded-bl-sm bg-surface-container-lowest px-4 py-3 font-body text-on-surface shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                      {message.content}
                    </div>
                  </div>
                  <span className="mb-1 hidden text-[10px] text-slate-400 sm:block">{sentAt}</span>
                </div>
              )
            })}

            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 opacity-40">
                <span className="material-symbols-outlined mb-2 text-4xl text-primary">chat_bubble</span>
                <p className="font-body text-sm italic">No messages yet... be the first ghost to speak.</p>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>

          <div className="px-4 pb-8 pt-2 sm:px-8 md:pb-8">
            <div className="mx-auto max-w-4xl">
              <form
                onSubmit={handleFormSubmit}
                className="group flex items-center gap-2 rounded-2xl bg-surface-container-low p-2 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all focus-within:ring-2 focus-within:ring-primary/30"
              >
                <button type="button" className="p-3 text-slate-400 transition-colors hover:text-tertiary">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>
                <input
                  type="text"
                  value={content}
                  onChange={(event) => setContent(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                  maxLength={MAX_MESSAGE_LENGTH}
                  disabled={!connected}
                  placeholder={connected ? 'Say something nice...' : 'Reconnecting...'}
                  className="flex-1 border-none bg-transparent px-2 py-3 font-body text-on-surface placeholder:text-slate-400 focus:ring-0"
                  autoComplete="off"
                />
                <button type="button" className="p-3 text-slate-400 transition-colors hover:text-primary">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || !connected}
                  className="flex size-12 items-center justify-center rounded-xl bg-tertiary text-on-tertiary shadow-lg transition-all hover:scale-105 hover:shadow-tertiary/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                </button>
              </form>
              <p className="mt-3 text-center font-label text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Keep it anonymous. Messages vanish in 4 hours.
              </p>
              {content.length > 0 && (
                <p className="mt-2 text-center font-label text-[10px] font-semibold text-slate-400">
                  {charsRemaining} characters remaining
                </p>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden w-72 flex-col border-l border-transparent bg-surface-container/30 p-8 backdrop-blur-sm xl:flex">
          <h3 className="mb-6 font-headline text-sm font-bold uppercase tracking-widest text-slate-400">Today&apos;s Echo</h3>
          <div className="relative mb-8 overflow-hidden rounded-xl border border-white bg-white/60 p-6 shadow-sm">
            <span className="material-symbols-outlined absolute -right-2 -top-2 text-6xl text-tertiary-container opacity-30">
              format_quote
            </span>
            <p className="relative z-10 font-body text-sm italic leading-relaxed text-on-surface">
              &quot;Stay kind, stay anonymous, and let this room feel safe for everyone.&quot;
            </p>
            <p className="mt-4 text-[10px] font-bold text-tertiary">- Anonymous Friend</p>
          </div>

          <h3 className="mb-6 font-headline text-sm font-bold uppercase tracking-widest text-slate-400">Online Moods</h3>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => (
              <span key={tag.label} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${tag.className}`}>
                {tag.label}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="mb-4 font-headline text-sm font-bold uppercase tracking-widest text-slate-400">Active Shadows</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${connected ? 'bg-secondary animate-pulse' : 'bg-amber-500'}`} />
                <span className="truncate font-label text-xs font-semibold text-on-surface">{myGhost}</span>
              </div>
              {otherGhosts.length > 0 ? (
                otherGhosts.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary/60" />
                    <span className="truncate font-label text-xs text-slate-500">{name}</span>
                  </div>
                ))
              ) : (
                <p className="font-body text-xs text-slate-400">No one else is active yet.</p>
              )}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="rounded-xl bg-gradient-to-br from-primary to-sky-700 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-tight opacity-80">Current Goal</p>
              <p className="mt-1 font-headline text-lg font-bold leading-tight">1,000 Ghost Messages Today</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-2 text-right text-[10px] font-bold">
                {goalCount.toLocaleString()}/1,000
              </p>
            </div>
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-24 items-center justify-around rounded-t-2xl bg-white/80 px-6 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] backdrop-blur-2xl md:hidden">
        <button type="button" className="flex scale-110 flex-col items-center justify-center rounded-[2rem] bg-sky-100 px-6 py-2 text-sky-800 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            grid_view
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest">Rooms</span>
        </button>
        <button type="button" className="flex flex-col items-center justify-center rounded-[2rem] px-6 py-2 text-slate-400 transition-all hover:bg-slate-100">
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="font-label text-[10px] uppercase tracking-widest">Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="flex flex-col items-center justify-center rounded-[2rem] px-6 py-2 text-slate-400 transition-all hover:bg-slate-100"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label text-[10px] uppercase tracking-widest">Settings</span>
        </button>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm overflow-y-auto max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">settings</span>
                <span className="font-headline text-sm font-bold tracking-tight text-slate-700 uppercase">
                  Ghost Settings
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false)
                  setCustomName('')
                  setNameError('')
                  setNameSaved(false)
                }}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Current Identity Card */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="font-label text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Current Identity
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/30 text-2xl">
                    {selectedAvatar || '👻'}
                  </div>
                  <div>
                    <div className="font-headline text-sm font-bold text-primary">{myGhost}</div>
                    <div className="font-label text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Anonymous Session Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Name Input */}
              <div>
                <div className="font-label text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Set Custom Name
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-primary/60">
                      {'>'}
                    </span>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value)
                        setNameError('')
                        setNameSaved(false)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && saveCustomName()}
                      placeholder={myGhost || 'ENTER_YOUR_NAME'}
                      maxLength={20}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-3 font-mono text-xs text-slate-700 placeholder:text-slate-300 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-wider"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-label text-[8px] text-slate-300 uppercase">
                      {customName.length}/20 chars
                    </span>
                    {nameError && (
                      <span className="font-label text-[8px] text-red-500">{nameError}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={saveCustomName}
                    disabled={!customName.trim() || nameSaved}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-label text-xs font-bold tracking-widest uppercase transition-all ${
                      nameSaved
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 hover:border-primary/40 hover:bg-primary-container/10 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    {nameSaved ? (
                      <>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Saved — Reloading...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        Save Name
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              {/* Avatar Picker */}
              <div>
                <div className="font-label text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Choose Avatar
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {GHOST_AVATARS.map((emoji, idx) => (
                    <button
                      type="button"
                      key={`${emoji}-${idx}`}
                      onClick={() => saveAvatar(emoji)}
                      className={`flex items-center justify-center h-12 w-full text-2xl rounded-xl border transition-all hover:scale-110 active:scale-95 ${
                        selectedAvatar === emoji
                          ? 'border-primary/60 bg-primary-container/30 shadow-[0_0_12px_rgba(0,101,144,0.2)]'
                          : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {selectedAvatar && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-label text-[8px] text-slate-400 uppercase">
                      Selected:
                    </span>
                    <span className="text-base">{selectedAvatar}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAvatar('')
                        localStorage.removeItem('ghost-avatar')
                        supabase.auth.updateUser({ data: { ghost_avatar: null } }).catch(console.error)
                      }}
                      className="ml-auto font-label text-[8px] text-red-400 hover:text-red-500 uppercase transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              {/* Regenerate Identity */}
              <div>
                <div className="font-label text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Ghost Identity
                </div>
                <button
                  type="button"
                  onClick={regenerateGhostName}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-primary-container/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-sm">shuffle</span>
                    <div className="text-left">
                      <div className="font-headline text-xs font-bold text-slate-700 uppercase">Regenerate Identity</div>
                      <div className="font-label text-[9px] text-slate-400">
                        Get a new random ghost name
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Danger Zone */}
              <div>
                <div className="font-label text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Danger Zone
                </div>
                <button
                  type="button"
                  onClick={clearSession}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500 text-sm">delete_forever</span>
                    <div className="text-left">
                      <div className="font-headline text-xs font-bold text-red-500 uppercase">Clear Session</div>
                      <div className="font-label text-[9px] text-slate-400">
                        Permanently delete your identity
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-red-300 group-hover:text-red-500 transition-colors">
                    arrow_forward
                  </span>
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-3">
              <div className="font-label text-[8px] font-bold uppercase tracking-widest text-slate-300 text-center">
                GHOSTALK v1.0 — All sessions are ephemeral
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
