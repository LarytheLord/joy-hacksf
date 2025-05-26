"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import ReelItem from "@/components/ReelItem"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function ExplorePage() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const { data, error } = await supabase
          .from('reels')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setReels(data || [])
      } catch (error) {
        console.error('Error fetching reels:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchReels()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Reels</h1>
        <Button 
          className="gradient-bg-blue-purple text-white rounded-full px-6"
          onClick={() => window.location.href = '/create-reel'}
        >
          Create Reel
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel) => (
          <ReelItem key={reel.id} reel={reel} />
        ))}
      </div>
      
      {reels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No reels found. Be the first to create one!</p>
        </div>
      )}
    </div>
  )
}