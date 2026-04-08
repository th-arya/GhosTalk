'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ghost, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GhostIdentityBadge } from '@/components/GhostIdentityBadge'

const PREDEFINED_ROOMS = [
  { id: 'hot-takes', name: '🔥 Hot Takes', desc: 'Controversial opinions only' },
  { id: 'confessions', name: '👻 Confessions', desc: 'What happens here, stays here' },
  { id: 'shower-thoughts', name: '💡 Shower Thoughts', desc: 'Mind-blowing realisations' },
  { id: 'late-night', name: '🌙 Late Night', desc: '3AM vibes & deep talks' },
  { id: 'rants', name: '😤 Rants', desc: 'Let it all out' }
]

export default function Home() {
  const [customRoom, setCustomRoom] = useState('')
  const router = useRouter()

  const handleJoinCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customRoom.trim()) return
    // Convert to slug
    const slug = customRoom.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    router.push(`/room/${slug}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <GhostIdentityBadge />
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 mt-12 mb-16">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-zinc-900 rounded-full border border-zinc-800 shadow-2xl shadow-zinc-900/50">
              <Ghost className="w-12 h-12 text-zinc-100" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2">
            Ghost Protocol
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium">
            Speak freely. Disappear completely.
          </p>
        </div>

        {/* Custom Room Input */}
        <div className="w-full max-w-md pt-4">
          <form onSubmit={handleJoinCustom} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter secret room ID..." 
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700 h-12 text-base md:h-14"
            />
            <Button type="submit" size="lg" className="h-12 md:h-14 px-6 md:px-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-300">
              Enter <span className="hidden sm:inline ml-1">Room</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Context Feed */}
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-semibold text-zinc-200">Active Ectoplasm</h2>
          <span className="text-sm text-zinc-500">Trending Now</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PREDEFINED_ROOMS.map(room => (
            <Card 
              key={room.id} 
              className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800/80 transition-all cursor-pointer group"
              onClick={() => router.push(`/room/${room.id}`)}
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors">{room.name}</h3>
                <p className="text-sm text-zinc-400">{room.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-16 pb-8 text-center text-xs text-zinc-600">
        All messages are permanently purged after 4 hours. No traces left behind.
      </div>
    </div>
  )
}
