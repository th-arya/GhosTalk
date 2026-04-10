'use client'

import { format } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  IoHomeOutline,
  IoVideocamOutline,
  IoCameraOutline,
  IoShareSocialOutline,
  IoHeartOutline,
} from 'react-icons/io5'
import GradientMenu from '@/components/ui/gradient-menu'
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

interface TrendingRoom {
  id: string
  name: string
  emoji: string
  description: string
  specters: number
  messages: number
  trend: string
  tags: string[]
}

interface Guideline {
  type: 'do' | 'dont'
  icon: string
  title: string
  desc: string
}

const TRENDING_ROOMS: TrendingRoom[] = [
  {
    id: 'hot_takes',
    name: 'HOT_TAKES',
    emoji: '🔥',
    description: 'Controversial opinions. No filter zone.',
    specters: 342,
    messages: 1289,
    trend: '+24%',
    tags: ['opinions', 'debate', 'spicy'],
  },
  {
    id: 'confessions',
    name: 'CONFESSIONS',
    emoji: '👻',
    description: 'Your secrets are safe here. Judge-free zone.',
    specters: 158,
    messages: 876,
    trend: '+12%',
    tags: ['secrets', 'anonymous', 'safe'],
  },
  {
    id: 'shower_thoughts',
    name: 'SHOWER_THOUGHTS',
    emoji: '💡',
    description: 'Random ideas that pop into your head.',
    specters: 89,
    messages: 445,
    trend: '+8%',
    tags: ['ideas', 'random', 'philosophy'],
  },
  {
    id: 'late_night',
    name: 'LATE_NIGHT',
    emoji: '🌙',
    description: '2 AM thoughts. Insomniacs welcome.',
    specters: 2400,
    messages: 8823,
    trend: '+67%',
    tags: ['night', 'vibes', 'chill'],
  },
  {
    id: 'rants',
    name: 'RANTS',
    emoji: '😤',
    description: 'Vent out. Everyone listens here.',
    specters: 67,
    messages: 234,
    trend: '+3%',
    tags: ['vent', 'rant', 'frustration'],
  },
  {
    id: 'tech_ghosts',
    name: 'TECH_GHOSTS',
    emoji: '💻',
    description: 'Developers, designers, builders — all welcome.',
    specters: 203,
    messages: 967,
    trend: '+19%',
    tags: ['tech', 'dev', 'code'],
  },
  {
    id: 'midnight_music',
    name: 'MIDNIGHT_MUSIC',
    emoji: '🎵',
    description: 'Share songs. Build playlists anonymously.',
    specters: 134,
    messages: 589,
    trend: '+11%',
    tags: ['music', 'playlist', 'vibes'],
  },
  {
    id: 'ghost_kitchen',
    name: 'GHOST_KITCHEN',
    emoji: '🍜',
    description: 'The secret hangout for food lovers.',
    specters: 78,
    messages: 312,
    trend: '+5%',
    tags: ['food', 'recipes', 'cravings'],
  },
]

const GUIDELINES: Guideline[] = [
  {
    type: 'do',
    icon: '✅',
    title: 'Stay Anonymous',
    desc: 'Do not share your or anyone else\'s real identity. Everyone is a ghost here.',
  },
  {
    type: 'do',
    icon: '✅',
    title: 'Speak Freely',
    desc: 'This is a safe space. Share your thoughts, feelings and secrets freely.',
  },
  {
    type: 'do',
    icon: '✅',
    title: 'Be Respectful',
    desc: 'Opinions can differ — personal attacks are not allowed.',
  },
  {
    type: 'do',
    icon: '✅',
    title: 'Use Private Rooms',
    desc: 'To talk with close friends, create a private room and share the link.',
  },
  {
    type: 'dont',
    icon: '❌',
    title: 'No Harassment',
    desc: 'Targeting anyone with harmful messages is strictly banned.',
  },
  {
    type: 'dont',
    icon: '❌',
    title: 'No Personal Info Requests',
    desc: 'Do not ask for anyone\'s name, location, phone or any personal details.',
  },
  {
    type: 'dont',
    icon: '❌',
    title: 'No Spamming',
    desc: 'Do not send the same message repeatedly. Links and ads are strictly prohibited.',
  },
  {
    type: 'dont',
    icon: '❌',
    title: 'No Illegal Content',
    desc: 'Sharing any illegal, harmful or explicit content is strictly banned.',
  },
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
  const [activeTab, setActiveTab] = useState<'rooms' | 'discover' | 'guidelines'>('rooms')
  const { messages, connected, sendMessage, error, loading, MAX_MESSAGE_LENGTH } = useRoom(currentRoom)

  const [content, setContent] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [customName, setCustomName] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [createdRoomLink, setCreatedRoomLink] = useState<string>('')
  const [showRoomCreated, setShowRoomCreated] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [myRooms, setMyRooms] = useState<string[]>([])
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

  // Auto-join room from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomFromUrl = params.get('room')
    if (roomFromUrl) {
      setCurrentRoom(roomFromUrl)
    }
  }, [])

  // Load my created rooms from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ghost-my-rooms') || '[]')
    setMyRooms(saved)
  }, [showRoomCreated])

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

  // Create private room
  const createPrivateRoom = () => {
    const adjectives = ['shadow', 'silent', 'phantom', 'hollow', 'cursed',
      'neon', 'frozen', 'blazing', 'velvet', 'rogue']
    const nouns = ['sector', 'vault', 'nexus', 'node', 'cipher',
      'relay', 'breach', 'signal', 'domain', 'proxy']

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const code = Math.random().toString(36).substring(2, 6).toUpperCase()

    const roomId = `${adj}-${noun}-${code}`
    const baseUrl = window.location.origin
    const link = `${baseUrl}?room=${roomId}`

    // Save to recent rooms
    const saved = JSON.parse(localStorage.getItem('ghost-my-rooms') || '[]') as string[]
    const updated = [roomId, ...saved.filter((r: string) => r !== roomId)].slice(0, 5)
    localStorage.setItem('ghost-my-rooms', JSON.stringify(updated))

    setCreatedRoomLink(link)
    setShowRoomCreated(true)
  }

  // Copy room link
  const copyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = createdRoomLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  // Join the created room
  const joinCreatedRoom = () => {
    try {
      const url = new URL(createdRoomLink)
      const roomId = url.searchParams.get('room')
      if (roomId) {
        setCurrentRoom(roomId)
        setShowRoomCreated(false)
        window.history.pushState({}, '', `?room=${roomId}`)
      }
    } catch (err) {
      console.error('Join room failed:', err)
    }
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
  const predefinedRoom = ROOMS.find((room) => room.id === currentRoom)
  const activeRoomName = predefinedRoom ? predefinedRoom.name : currentRoom.split('-').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const activeRoom = predefinedRoom ?? { id: currentRoom, name: activeRoomName, icon: 'lock' }
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
  const navItems = [
    {
      title: 'Rooms',
      icon: <IoHomeOutline />,
      gradientFrom: '#a955ff',
      gradientTo: '#ea51ff',
      onClick: () => setActiveTab('rooms'),
    },
    {
      title: 'Discover',
      icon: <IoVideocamOutline />,
      gradientFrom: '#56CCF2',
      gradientTo: '#2F80ED',
      onClick: () => setActiveTab('discover'),
    },
    {
      title: 'Guidelines',
      icon: <IoCameraOutline />,
      gradientFrom: '#FF9966',
      gradientTo: '#FF5E62',
      onClick: () => setActiveTab('guidelines'),
    },
    {
      title: 'Chat',
      icon: <IoShareSocialOutline />,
      gradientFrom: '#80FF72',
      gradientTo: '#7EE8FA',
      onClick: () => setActiveTab('rooms'),
    },
    {
      title: 'Settings',
      icon: <IoHeartOutline />,
      gradientFrom: '#ffa9c6',
      gradientTo: '#f434e2',
      onClick: () => setShowSettings(true),
    },
  ]

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
          <GradientMenu items={navItems} />
        </div>
      </header>

      <div className="flex h-screen overflow-hidden pt-20">
        {/* Sidebar — only shown in Rooms tab */}
        {activeTab === 'rooms' && (
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
              onClick={createPrivateRoom}
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

            {/* My Sanctuaries */}
            {myRooms.length > 0 && (
              <div className="mx-6 mt-4">
                <div className="mb-2 font-label text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  My Sanctuaries
                </div>
                <div className="space-y-1">
                  {myRooms.map((roomId) => (
                    <button
                      key={roomId}
                      type="button"
                      onClick={() => {
                        setCurrentRoom(roomId)
                        window.history.pushState({}, '', `?room=${roomId}`)
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                        currentRoom === roomId
                          ? 'bg-primary-container/30 text-primary'
                          : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span className="font-label text-[10px] font-semibold uppercase tracking-wider truncate">
                        {roomId.split('-').slice(0, 2).join('-')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
        )}

        {/* ===================== TAB: ROOMS ===================== */}
        {activeTab === 'rooms' && (
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
        )}

        {/* ===================== TAB: DISCOVER ===================== */}
        {activeTab === 'discover' && (
          <main className="relative flex flex-1 flex-col bg-transparent pb-24 md:pb-0">
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <div className="py-6 px-4 sm:px-8 space-y-4 max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">Discover</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    🔥 Trending rooms — most active right now
                  </p>
                </div>

                {/* Trending badge row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                    LIVE
                  </span>
                  <span className="text-xs text-slate-400">
                    {TRENDING_ROOMS.reduce((a, r) => a + r.specters, 0).toLocaleString()} ghosts online
                  </span>
                </div>

                {/* Rooms Grid */}
                <div className="space-y-3">
                  {[...TRENDING_ROOMS].sort((a, b) => b.specters - a.specters).map((room) => (
                    <button
                      key={room.id}
                      onClick={() => {
                        setCurrentRoom(room.id)
                        setActiveTab('rooms')
                      }}
                      className="w-full text-left border border-outline-variant/20 rounded-2xl p-4 hover:border-sky-200 hover:bg-sky-50/30 transition-all active:scale-[0.99] group bg-white/50 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-3">

                        {/* Left */}
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{room.emoji}</span>
                          <div>
                            <div className="font-mono font-bold text-sm text-on-surface">
                              {room.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {room.description}
                            </div>
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right — Stats */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-green-500 font-bold">
                            {room.trend}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {room.specters >= 1000
                              ? `${(room.specters/1000).toFixed(1)}K`
                              : room.specters} 👻
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {room.messages.toLocaleString()} msgs
                          </div>
                        </div>

                      </div>

                      {/* Join indicator */}
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-sky-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>→</span>
                        <span>TAP TO JOIN</span>
                      </div>

                    </button>
                  ))}
                </div>

              </div>
            </div>
          </main>
        )}

        {/* ===================== TAB: GUIDELINES ===================== */}
        {activeTab === 'guidelines' && (
          <main className="relative flex flex-1 flex-col bg-transparent pb-24 md:pb-0">
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <div className="py-6 px-4 sm:px-8 space-y-4 max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">Guidelines</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    A few simple rules to keep GhosTalk safe and fun.
                  </p>
                </div>

                {/* DO&apos;s Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1 bg-green-100" />
                    <span className="text-xs font-mono text-green-600 font-bold uppercase tracking-widest">
                      ✅ Do&apos;s
                    </span>
                    <div className="h-[1px] flex-1 bg-green-100" />
                  </div>
                  <div className="space-y-3">
                    {GUIDELINES.filter(g => g.type === 'do').map((rule, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 border border-green-100 bg-green-50/50 rounded-2xl p-4"
                      >
                        <span className="text-xl">{rule.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-on-surface">{rule.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rule.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONT&apos;s Section */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1 bg-red-100" />
                    <span className="text-xs font-mono text-red-500 font-bold uppercase tracking-widest">
                      ❌ Don&apos;ts
                    </span>
                    <div className="h-[1px] flex-1 bg-red-100" />
                  </div>
                  <div className="space-y-3">
                    {GUIDELINES.filter(g => g.type === 'dont').map((rule, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 border border-red-100 bg-red-50/50 rounded-2xl p-4"
                      >
                        <span className="text-xl">{rule.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-on-surface">{rule.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rule.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom note */}
                <div className="mt-6 border border-outline-variant/20 rounded-2xl p-4 bg-white/50 backdrop-blur-sm text-center">
                  <div className="text-2xl mb-2">👻</div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    GhosTalk is an anonymous platform. All messages auto-delete after 4 hours.
                    Protect your privacy.
                  </div>
                </div>

              </div>
            </div>
          </main>
        )}

        {/* Right sidebar — only show in rooms tab */}
        {activeTab === 'rooms' && (
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
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-24 items-center justify-around rounded-t-2xl bg-white/80 px-6 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] backdrop-blur-2xl md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`flex flex-col items-center justify-center rounded-[2rem] px-6 py-2 transition-all ${
            activeTab === 'rooms' ? 'scale-110 bg-sky-100 text-sky-800' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'rooms' ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            grid_view
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest">Rooms</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center rounded-[2rem] px-6 py-2 transition-all ${
            activeTab === 'discover' ? 'scale-110 bg-sky-100 text-sky-800' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'discover' ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            explore
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest">Discover</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guidelines')}
          className={`flex flex-col items-center justify-center rounded-[2rem] px-6 py-2 transition-all ${
            activeTab === 'guidelines' ? 'scale-110 bg-sky-100 text-sky-800' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'guidelines' ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            gavel
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest">Rules</span>
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

      {/* Room Created Modal */}
      {showRoomCreated && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm overflow-y-auto max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">lock</span>
                <span className="font-headline text-sm font-bold tracking-tight text-slate-700 uppercase">
                  Room Created
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRoomCreated(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Success indicator */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/30 text-3xl">
                  👻
                </div>
                <div className="text-center">
                  <div className="font-headline text-sm font-bold text-primary uppercase tracking-wide">
                    Sanctuary Created!
                  </div>
                  <div className="font-label text-[9px] text-slate-400 mt-1">
                    Only those with the link can join
                  </div>
                </div>
              </div>

              {/* Room ID display */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="font-label text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Room ID
                </div>
                <div className="font-mono text-xs text-primary tracking-wider break-all">
                  {createdRoomLink.split('room=')[1] || ''}
                </div>
              </div>

              {/* Shareable Link */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="font-label text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Shareable Link
                </div>
                <div className="font-mono text-[9px] text-slate-500 break-all leading-relaxed">
                  {createdRoomLink}
                </div>
              </div>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={copyRoomLink}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-label text-xs font-bold tracking-widest uppercase transition-all ${
                  linkCopied
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                    : 'border-slate-200 hover:border-primary/40 hover:bg-primary-container/10 text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {linkCopied ? 'check_circle' : 'content_copy'}
                </span>
                {linkCopied ? 'Link Copied!' : 'Copy Link'}
              </button>

              {/* Join Room Button */}
              <button
                type="button"
                onClick={joinCreatedRoom}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 hover:border-sky-400 font-label text-xs font-bold tracking-widest uppercase text-sky-700 transition-all"
              >
                <span className="material-symbols-outlined text-sm">login</span>
                Enter Room Now
              </button>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                <div className="font-label text-[8px] text-amber-600 uppercase leading-relaxed">
                  Save this link — messages auto-delete after 4 hours.
                  The room is always accessible via this link.
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-3">
              <div className="font-label text-[8px] font-bold uppercase tracking-widest text-slate-300 text-center">
                GHOSTALK — Private rooms are ephemeral
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
