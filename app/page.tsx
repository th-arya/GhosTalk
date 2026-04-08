'use client'

import { useState, useRef, useEffect } from 'react'
import { useGhostAuth } from '@/lib/useGhostAuth'
import { useRoom } from '@/lib/useRoom'
import { format } from 'date-fns'

const PREDEFINED_ROOMS = [
  { id: 'hot_takes', name: 'HOT_TAKES', emoji: '🔥', specters: '342' },
  { id: 'confessions', name: 'CONFESSIONS', emoji: '👻', specters: '158' },
  { id: 'shower_thoughts', name: 'SHOWER_THOUGHTS', emoji: '💡', specters: '89' },
  { id: 'late_night', name: 'LATE_NIGHT', emoji: '🌙', specters: '2.4K' },
  { id: 'rants', name: 'RANTS', emoji: '😤', specters: '67' },
]

export default function Home() {
  const { ghostName } = useGhostAuth()
  const [currentRoom, setCurrentRoom] = useState('hot_takes')
  const { messages, connected, sendMessage, error, loading } = useRoom(currentRoom)
  
  const [content, setContent] = useState('')
  const [modalState, setModalState] = useState<'soon' | 'channels' | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content.trim() || !connected) return
    await sendMessage(content)
    setContent('')
  }

  const myGhost = ghostName || 'ENCRYPTING...'
  const roomNameDisplay = PREDEFINED_ROOMS.find(r => r.id === currentRoom)?.name || currentRoom.toUpperCase()

  // Generate a fixed pseudo-random line length based on message content to preserve the design styling
  const getLineLength = (text: string) => Math.min(Math.max((text.length / 150) * 100, 15), 85) + '%'

  return (
    <>
      <div className="noise-overlay" />

      {/* Modals for Clickable Fallbacks */}
      {modalState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050508]/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm border border-primary/30 bg-surface-container-lowest p-8 shadow-[0_0_40px_rgba(208,188,255,0.1)]">
            <button 
              onClick={() => setModalState(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            {modalState === 'soon' && (
              <div className="text-center mt-4">
                <div className="mb-4 flex justify-center">
                  <span className="material-symbols-outlined text-5xl text-primary animate-pulse">lock</span>
                </div>
                <h2 className="font-headline text-lg tracking-widest text-primary uppercase mb-2">Access Denied</h2>
                <p className="font-mono text-[10px] text-on-surface-variant mb-6 leading-relaxed uppercase">
                  🚧 Feature under development.<br/>Check back next sync.
                </p>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              </div>
            )}

            {modalState === 'channels' && (
              <div>
                <h2 className="font-headline text-sm tracking-widest text-secondary uppercase mb-6 drop-shadow-[0_0_5px_rgba(76,215,246,0.5)]">Select Uplink Channel</h2>
                <div className="space-y-3">
                  {PREDEFINED_ROOMS.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => {
                        setCurrentRoom(r.id)
                        setModalState(null)
                      }}
                      className={`w-full flex items-center justify-between p-4 border transition-all ${currentRoom === r.id ? 'border-secondary bg-secondary/10 text-secondary shadow-[0_0_15px_rgba(76,215,246,0.2)]' : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/50 hover:bg-primary/5 hover:text-primary'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span>{r.emoji}</span>
                        <span className="font-mono text-[10px] tracking-wider uppercase">{r.name}</span>
                      </div>
                      <span className="font-mono text-[8px] text-on-surface-variant/50">{r.specters} ONLINE</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="relative flex h-screen flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/5 bg-[#0e0e12] py-8 md:flex">
          <div className="mb-12 px-6">
            <div className="font-headline text-xl font-black tracking-widest text-violet-500">
              {'//GHOST_PROTOCOL'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 px-3">
            <div className="mb-4 px-3 font-headline text-[10px] uppercase tracking-[0.2em] text-[#cbc3d7]/30">
              {'// ACTIVE CHANNELS'}
            </div>
            {PREDEFINED_ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => setCurrentRoom(room.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 border-l-2 transition-all text-left ${
                  currentRoom === room.id
                    ? 'border-cyan-400 bg-white/5 text-cyan-400'
                    : 'border-transparent text-[#cbc3d7]/50 hover:bg-violet-900/10 hover:text-violet-200 hover:border-violet-500/50'
                }`}
              >
                <span className="text-lg">{room.emoji}</span>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] tracking-wider uppercase">{room.name}</span>
                  <span className="font-mono text-[8px] text-[#cbc3d7]/30">{room.specters} SPECTERS ONLINE</span>
                </div>
                {currentRoom === room.id && (
                  <span className="material-symbols-outlined text-xs ml-auto animate-pulse">wifi_tethering</span>
                )}
              </button>
            ))}

            <div className="mt-6 mb-4 px-3 font-headline text-[10px] uppercase tracking-[0.2em] text-[#cbc3d7]/30">
              {'// SYSTEM'}
            </div>
            <button
              onClick={() => setModalState('soon')}
              className="w-full flex items-center gap-3 px-3 py-3 border-l-2 border-transparent text-[#cbc3d7]/50 transition-all hover:bg-violet-900/10 hover:text-violet-200 hover:border-violet-500/50 text-left"
            >
              <span className="material-symbols-outlined text-lg">security</span>
              <span className="font-mono text-[10px] tracking-wider uppercase">ENCRYPTION</span>
            </button>
            <button
              onClick={() => setModalState('soon')}
              className="w-full flex items-center gap-3 px-3 py-3 border-l-2 border-transparent text-[#cbc3d7]/50 transition-all hover:bg-violet-900/10 hover:text-violet-200 hover:border-violet-500/50 text-left"
            >
              <span className="material-symbols-outlined text-lg">fingerprint</span>
              <span className="font-mono text-[10px] tracking-wider uppercase">IDENTITY</span>
            </button>
          </div>

          <div className="mt-auto px-6">
            <div className="border border-outline-variant/10 bg-surface-container-low p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center bg-primary/20">
                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface truncate">{'>'}{myGhost.split('-')[0] || 'SYS_OP'}</div>
                  <div className="font-mono text-[9px] text-primary/60">STATUS: EPHEMERAL</div>
                </div>
              </div>
              <button onClick={() => window.location.reload()} className="w-full border border-primary/40 bg-transparent py-2 font-headline text-[10px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/10">
                {'//NEW_PROTOCOL'}
              </button>
            </div>
          </div>
        </aside>

        {/* Center Main Chat */}
        <main className="flex h-screen flex-1 flex-col overflow-hidden md:ml-64">
          <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-primary/20 bg-[#131317]/80 px-6 shadow-[0_4px_20px_rgba(139,92,246,0.15)] backdrop-blur-xl md:left-64 xl:right-72">
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant transition-colors hover:text-primary">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
              <div className="glass-pill flex items-center gap-2 px-4 py-1.5 min-w-[120px]">
                <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_#d0bcff] ${connected ? 'bg-primary' : 'bg-red-500 animate-pulse'}`} />
                <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
                  {roomNameDisplay}
                </span>
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="font-mono text-[10px] tracking-[0.3em] text-on-surface-variant/40">
                SESSION_ID: {roomNameDisplay.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="font-headline text-xs font-bold tracking-tighter text-on-surface uppercase">
                  {myGhost}
                </span>
                <span className="animate-pulse font-mono text-[9px] uppercase text-secondary">ENCRYPTING...</span>
              </div>
              <div className="h-10 w-10 overflow-hidden border border-outline-variant/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrei3BD05aWPVWD8DXlh_OSM3oTgn2Rpt0vcm9FQiT2gEHX-uavuxRNxcE1AKTKkuOYQcnRjZzXpEAGBKEDq3NHkdz89NoFClPtAlFhKOF-ZEIUvl0HscnSHVbOjUFEecIVlRcEYrK061U_A7ACnfGdExNW4UkRwhLvcB45Dr-xvk9OpuoWPgy7w9-DqLQsgZ2fZVuAQvyJNglTWS_tQ2FPKmirlM8QTRyNAh-8Kvjlx6ATNTyh3Cap84S69Hd5meo7lAPeIDrS-Oy"
                  alt="Ghost Identity Avatar"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </header>

          <section className="custom-scrollbar relative mt-16 flex-1 overflow-y-auto bg-[#050508] pb-4">
            <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.06]" />

            <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-10 relative z-10">
              <div className="flex items-center gap-4 opacity-30">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-on-surface-variant" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {format(new Date(), 'HH:mm:ss')}_UTC
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-on-surface-variant" />
              </div>

              {error && (
                <div className="text-center font-mono text-[10px] text-red-500 uppercase tracking-widest bg-red-500/10 py-2 border border-red-500/20">
                  {error}
                </div>
              )}
              
              {loading && messages.length === 0 && (
                <div className="flex items-center gap-2 justify-center py-10 font-mono text-[10px] text-secondary opacity-60 animate-pulse">
                   <span className="material-symbols-outlined text-xs">sync</span>
                   <span>SYNCING_HISTORICAL_DATA...</span>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_name === ghostName
                const time = msg.created_at ? format(new Date(msg.created_at), 'HH:mm:ss') : format(new Date(), 'HH:mm:ss')

                if (isMe) {
                  return (
                    <div key={msg.id} className="group ml-auto flex max-w-[85%] flex-col items-end">
                      <div className="mb-1 mr-1 font-headline text-[9px] uppercase tracking-widest text-primary">
                        {`//${msg.sender_name}`}
                      </div>
                      <div className="shadow-glow-violet relative bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] p-4 shadow-[0_10px_30px_rgba(124,58,237,0.2)]">
                        <p className="font-body text-sm leading-relaxed text-white break-words">
                          {msg.content}
                        </p>
                        <div 
                          className="absolute bottom-0 right-0 h-[2px] bg-tertiary-container transition-all duration-[10000ms]" 
                          style={{ width: getLineLength(msg.content) }}
                        />
                      </div>
                      <div className="mt-2 mr-1 font-mono text-[8px] tracking-widest text-on-surface-variant/30">
                        {time} — SENT
                      </div>
                    </div>
                  )
                }

                // Others
                return (
                  <div key={msg.id} className="group flex max-w-[85%] flex-col items-start">
                    <div className="mb-1 ml-1 font-headline text-[9px] uppercase tracking-widest text-secondary">
                      {`//${msg.sender_name}`}
                    </div>
                    <div className="relative border border-primary/20 bg-surface-container-lowest p-4 shadow-xl">
                      <p className="font-body text-sm leading-relaxed text-on-surface break-words">
                        {msg.content}
                      </p>
                      <div 
                        className="absolute bottom-0 left-0 h-[2px] bg-tertiary-container transition-all duration-[10000ms]" 
                        style={{ width: getLineLength(msg.content) }}
                      />
                    </div>
                    <div className="mt-2 ml-1 font-mono text-[8px] tracking-widest text-on-surface-variant/30">
                      {time} — RECEIVED
                    </div>
                  </div>
                )
              })}

              <div ref={messagesEndRef} className="h-4 w-full" />
              
              {connected && content.length > 0 && (
                <div className="flex items-center gap-2 px-1 font-mono text-[10px] text-primary opacity-60 animate-pulse">
                  <span className="material-symbols-outlined text-xs">keyboard_external_input</span>
                  <span>TRANSMITTING...</span>
                </div>
              )}
            </div>
          </section>

          <footer className="z-10 flex h-24 shrink-0 items-center gap-4 border-t border-primary/20 bg-surface-container-lowest px-6 py-4 shadow-[0_-10px_40px_rgba(139,92,246,0.1)] backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center border border-outline-variant/20 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">{connected ? 'lock' : 'lock_open'}</span>
            </div>

            <form onSubmit={handleSend} className="relative h-full flex-1">
              <input
                type="text"
                placeholder={connected ? "TYPE AND DISAPPEAR..." : "UPLINK DISCONNECTED..."}
                disabled={!connected}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-full w-full border-none bg-transparent font-mono text-sm tracking-wider text-primary placeholder:text-on-surface-variant/20 focus:ring-0 outline-none disabled:opacity-50"
                autoComplete="off"
              />
              <button type="submit" className="hidden" />
            </form>

            <div className="flex items-center gap-6">
              <div className="hidden items-center gap-4 border-l border-outline-variant/10 pl-6 lg:flex">
                <button onClick={() => setModalState('soon')} className="text-on-surface-variant transition-colors hover:text-primary">
                  <span className="material-symbols-outlined" data-weight="fill">
                    attach_file
                  </span>
                </button>
                <button onClick={() => setModalState('soon')} className="text-on-surface-variant transition-colors hover:text-primary">
                  <span className="material-symbols-outlined">mic</span>
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!content.trim() || !connected}
                className="group flex h-14 w-14 shrink-0 items-center justify-center border border-primary bg-transparent text-primary transition-all hover:bg-primary hover:text-surface-dim active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary disabled:active:scale-100"
              >
                <span className="material-symbols-outlined text-2xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                  send
                </span>
              </button>
            </div>
          </footer>
        </main>

        {/* Right Sidebar */}
        <aside className="fixed right-0 top-0 z-30 hidden h-screen w-72 flex-col border-l border-white/5 bg-surface-container-lowest p-6 xl:flex">
          <div className="space-y-8 mt-16">
            <div>
              <div className="mb-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40">
                Node_Status
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="font-mono text-[9px] uppercase text-on-surface-variant">Latency</span>
                  <span className="font-headline text-xs text-secondary">{connected ? '24MS' : 'ERR_MS'}</span>
                </div>
                <div className="h-[1px] w-full bg-surface-container-high relative">
                  <div className={`h-full bg-secondary transition-all ${connected ? 'w-[24%]' : 'w-[0%]'}`} />
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-mono text-[9px] uppercase text-on-surface-variant">Uplink_Load</span>
                  <span className="font-headline text-xs text-primary">{content.length > 0 ? ((content.length / 500) * 100).toFixed(2) : '0.08'}%</span>
                </div>
                <div className="h-[1px] w-full bg-surface-container-high relative">
                  <div className="h-full bg-primary transition-all" style={{ width: `${Math.max((content.length / 500) * 100, 8)}%` }} />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40">
                Active_Shadows
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${connected ? 'bg-secondary animate-pulse' : 'bg-red-500'}`} />
                  <span className="font-mono text-[10px] uppercase text-on-surface">{myGhost}</span>
                </div>
                
                {/* Find other unique senders to populate active shadows dynamically */}
                {Array.from(new Set(messages.map(m => m.sender_name).filter(n => n !== ghostName))).slice(0, 4).map(name => (
                  <div key={name} className="flex items-center gap-3 opacity-60">
                    <div className="h-2 w-2 rounded-full bg-on-surface-variant animate-pulse" />
                    <span className="font-mono text-[10px] uppercase text-on-surface truncate pr-2" title={name}>{name}</span>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="flex items-center gap-3 opacity-40">
                    <div className="h-2 w-2 rounded-full bg-on-surface-variant" />
                    <span className="font-mono text-[10px] uppercase text-on-surface">NULL_ENTITY</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuACrFE8UOh9EjugPZlHMo4_lqp2y7v0eNu-VHXPjptr2P_fCWB3yYmS4PJgM6F6oQMYfRowWLRu5n3C_x1PZON6jaG2dDjmeVVjSvXHw5fPDYYslozVCnpXP9Aaqk0CMzzzD7IHZSmjtlCcdQi2wRn5cqj1UvP20c3F7HIXUFkuoyE6J_jBisRFaWxi-h4DaM34ACc1eZpav16ojVCzUK8of28O30fUgR0h4TS1H2YSIL-4Ply5y2F_20pfar-S5uEuhtth6pSrkZOF"
                alt="Active Node Map"
                className="w-full border border-outline-variant/10 opacity-70 hover:opacity-100 transition-opacity mix-blend-screen"
              />
              <div className="mt-2 font-mono text-[8px] tracking-tighter text-on-surface-variant/20">
                DATASET: GLOBAL_PROXIMITY_V2
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-primary/20 bg-[#131317]/90 backdrop-blur-xl px-4 md:hidden shadow-[0_-5px_20px_rgba(139,92,246,0.1)]">
          <button onClick={() => setModalState('channels')} className="flex flex-col items-center gap-1 text-primary active:scale-95 transition-transform">
            <span className="material-symbols-outlined">settings_ethernet</span>
            <span className="font-headline text-[8px]">CHANNELS</span>
          </button>
          <button onClick={() => setModalState('soon')} className="flex flex-col items-center gap-1 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95">
            <span className="material-symbols-outlined">security</span>
            <span className="font-headline text-[8px]">ENCRYPT</span>
          </button>
          <button onClick={() => setModalState('soon')} className="flex flex-col items-center gap-1 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95">
            <span className="material-symbols-outlined">fingerprint</span>
            <span className="font-headline text-[8px]">IDENTITY</span>
          </button>
        </nav>

      </div>
    </>
  )
}
