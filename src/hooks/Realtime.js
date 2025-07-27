import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useRealtimeNotifications = (userId, onNewOutput = null) => {
  const channelRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    // Create a channel for the specific user
    const channel = supabase
      .channel(`ai_outputs_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_outputs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New AI output received:', payload)
          
          // Show toast notification
          toast.success(
            `New output created: ${payload.new.tool_name}`,
            {
              duration: 5000,
              position: 'top-right',
              style: {
                background: '#10B981',
                color: 'white',
              },
              icon: '🎉',
            }
          )

          // Call optional callback with the new data
          if (onNewOutput) {
            onNewOutput(payload.new)
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [userId, onNewOutput])

  // Return method to manually unsubscribe
  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }
}