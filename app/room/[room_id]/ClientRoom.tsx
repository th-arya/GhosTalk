'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRoom } from '@/lib/useRoom'
import { useGhostAuth } from '@/lib/useGhostAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GhostIdentityBadge } from '@/components/GhostIdentityBadge'

export function ClientRoom({ room_id }: { room_id: string }) {
  const router = useRouter()
  const { messages, connected, loading, sendMessage } = useRoom(room_id)
  const { ghostName, loading: authLoading } = useGhostAuth()
  const [content, setContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await sendMessage(content)
    setContent('')
  }

  if (authLoading || loading) {
    return (
      <div className="flex bg-zinc-950 h-screen w-full items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-medium tracking-widest uppercase">Connecting...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100 max-w-3xl mx-auto border-x border-zinc-900/50 shadow-2xl relative">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md p-4 shrink-0 flex items-center justify-between sticky top-0 z-10 w-full">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight text-zinc-100 truncate max-w-[150px] sm:max-w-xs">{room_id}</h1>
              <Badge variant="outline" className={`${connected ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}>
                {connected ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Messages vanish after 4 hours
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
          <GhostIdentityBadge />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <div className="text-4xl">👻</div>
            <p className="text-zinc-400">No messages yet...<br/>be the first ghost to speak!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_name === ghostName
            // Add a little extra top margin if previous message was from a different sender
            const showName = index === 0 || messages[index - 1].sender_name !== msg.sender_name
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${showName ? 'mt-6' : 'mt-2'}`}>
                {showName && (
                  <span className={`text-[10px] font-semibold tracking-wider uppercase mb-1.5 ${isMe ? 'text-zinc-500 mr-1' : 'text-zinc-400 ml-1'}`}>
                    {isMe ? 'You' : msg.sender_name}
                  </span>
                )}
                <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
                  <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed ${
                    isMe 
                      ? 'bg-violet-900 border border-violet-800/50 text-violet-50 rounded-2xl rounded-tr-sm' 
                      : 'bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-2xl rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className={`text-[10px] text-zinc-600 mt-1 block ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : 'just now'}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800/60 shrink-0">
        <form onSubmit={handleSend} className="flex gap-3 relative max-w-full">
          <Input
            type="text"
            className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-100 rounded-full pl-5 pr-14 py-6 focus-visible:ring-violet-500/50 text-base shadow-inner"
            placeholder="Whisper to the void..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!connected}
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!content.trim() || !connected}
            size="icon"
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
