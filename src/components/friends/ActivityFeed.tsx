import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import {
  Droplets,
  Trophy,
  Flame,
  Target,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getFriendActivityFn } from '@/server/functions/friends'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  type: 'intake' | 'goal_reached' | 'streak' | 'milestone'
  message: string
  timestamp: string
  amount?: number
  streak?: number
}

export function ActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['friend-activity'],
    queryFn: () => getFriendActivityFn(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'intake':
        return <Droplets className="w-4 h-4 text-[#0EA5E9]" />
      case 'goal_reached':
        return <Target className="w-4 h-4 text-green-500" />
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500" />
      case 'milestone':
        return <Trophy className="w-4 h-4 text-amber-500" />
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />
    }
  }

  const getActivityBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'intake':
        return 'bg-[#D3E4FD] dark:bg-[#0EA5E9]/20'
      case 'goal_reached':
        return 'bg-green-100 dark:bg-green-500/20'
      case 'streak':
        return 'bg-orange-100 dark:bg-orange-500/20'
      case 'milestone':
        return 'bg-amber-100 dark:bg-amber-500/20'
      default:
        return 'bg-purple-100 dark:bg-purple-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0EA5E9]" />
        <p className="text-sm text-[#8E9196]">Loading activity...</p>
      </div>
    )
  }

  const activities = data?.activities || []

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#8E9196]/30" />
        <p className="text-[#8E9196] font-medium">No recent activity</p>
        <p className="text-xs text-[#8E9196]/70 mt-1">
          Add friends to see their hydration updates!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
        <h3 className="text-lg font-semibold text-[#1A1F2C] dark:text-white">
          Friend Activity
        </h3>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              {/* Avatar */}
              <Avatar className="w-8 h-8 mt-0.5">
                <AvatarImage src={activity.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white text-xs">
                  {activity.displayName?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${getActivityBg(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <p className="text-sm text-[#1A1F2C] dark:text-white">
                    <span className="font-medium">{activity.displayName}</span>{' '}
                    <span className="text-[#8E9196]">{activity.message}</span>
                  </p>
                </div>
                <p className="text-xs text-[#8E9196] mt-1 ml-8">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
