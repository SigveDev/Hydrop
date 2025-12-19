import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import {
  Trophy,
  Droplets,
  Crown,
  Medal,
  Loader2,
  Flame,
  TrendingUp,
  Calendar,
  Star,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getLeaderboardFn } from '@/server/functions/friends'

type Period = 'daily' | 'weekly' | 'allTime'

interface LeaderboardEntry {
  userId: string
  displayName: string
  avatarUrl: string | null
  isMe: boolean
  dailyTotal: number
  weeklyTotal: number
  allTimeTotal: number
  dailyPercentage: number
  streak?: number
  totalDays?: number
  avgDaily?: number
}

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>('daily')

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboardFn(),
    refetchInterval: 60000, // Refresh every minute
  })

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-[#8E9196]">
            {rank}
          </span>
        )
    }
  }

  const getRankBg = (rank: number, isMe: boolean) => {
    if (isMe) return 'bg-[#E5DEFF] dark:bg-[#8B5CF6]/20 border-[#8B5CF6]/30'
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border-amber-200 dark:border-amber-500/30'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-500/10 dark:to-gray-500/5 border-gray-200 dark:border-gray-500/30'
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-500/10 dark:to-orange-500/5 border-orange-200 dark:border-orange-500/30'
      default:
        return 'bg-white dark:bg-white/5 border-[#E5DEFF] dark:border-white/10'
    }
  }

  const getLeaderboardForPeriod = () => {
    if (!leaderboardData) return []
    switch (period) {
      case 'daily':
        return leaderboardData.daily || []
      case 'weekly':
        return leaderboardData.weekly || []
      case 'allTime':
        return leaderboardData.allTime || []
      default:
        return []
    }
  }

  const getTotalForPeriod = (entry: LeaderboardEntry) => {
    switch (period) {
      case 'daily':
        return entry.dailyTotal
      case 'weekly':
        return entry.weeklyTotal
      case 'allTime':
        return entry.allTimeTotal
      default:
        return 0
    }
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ml`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}L`
    }
    return `${amount}ml`
  }

  const leaderboard = getLeaderboardForPeriod()

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0EA5E9]" />
        <p className="text-[#8E9196]">Loading leaderboard...</p>
      </div>
    )
  }

  if (leaderboard.length <= 1) {
    return (
      <div className="py-12 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-[#8E9196]/30" />
        <p className="text-[#8E9196] font-medium">No competition yet</p>
        <p className="text-sm text-[#8E9196]/70 mt-1">
          Add friends to start competing!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-[#1A1F2C] dark:text-white">
            Leaderboard
          </h3>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList className="w-full mb-4 bg-[#F1F0FB] dark:bg-white/5 grid grid-cols-3">
          <TabsTrigger value="daily" className="text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Today
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Week
          </TabsTrigger>
          <TabsTrigger value="allTime" className="text-xs sm:text-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            All Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-0">
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const rank = index + 1
              const total = getTotalForPeriod(entry)

              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(rank, entry.isMe)}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatarUrl || undefined} />
                      <AvatarFallback
                        className={`${
                          entry.isMe
                            ? 'bg-[#8B5CF6]'
                            : 'bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6]'
                        } text-white`}
                      >
                        {entry.displayName?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Streak badge */}
                    {entry.streak && entry.streak >= 3 && (
                      <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-medium truncate ${
                          entry.isMe
                            ? 'text-[#8B5CF6]'
                            : 'text-[#1A1F2C] dark:text-white'
                        }`}
                      >
                        {entry.displayName}
                        {entry.isMe && (
                          <span className="text-xs ml-1">(You)</span>
                        )}
                      </p>
                      {/* Streak badge inline */}
                      {entry.streak && entry.streak >= 3 && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 text-[10px] px-1.5 py-0"
                        >
                          <Flame className="w-2.5 h-2.5 mr-0.5" />
                          {entry.streak}
                        </Badge>
                      )}
                    </div>
                    {period === 'daily' && (
                      <div className="mt-1">
                        <Progress
                          value={entry.dailyPercentage}
                          className="h-1.5"
                        />
                      </div>
                    )}
                    {period === 'allTime' && entry.totalDays && (
                      <p className="text-xs text-[#8E9196]">
                        {entry.totalDays} days tracked
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-[#0EA5E9]" />
                      <span className="font-bold text-[#1A1F2C] dark:text-white">
                        {formatAmount(total)}
                      </span>
                    </div>
                    {period === 'daily' && (
                      <p className="text-xs text-[#8E9196]">
                        {entry.dailyPercentage}% of goal
                      </p>
                    )}
                    {period === 'weekly' && entry.avgDaily && (
                      <p className="text-xs text-[#8E9196]">
                        ~{formatAmount(entry.avgDaily)}/day
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Period summary */}
          {leaderboard.length > 0 && (
            <motion.div
              className="mt-4 p-3 bg-gradient-to-r from-[#D3E4FD]/50 to-[#E5DEFF]/50 dark:from-[#0EA5E9]/10 dark:to-[#8B5CF6]/10 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8E9196]">
                  {period === 'daily' && "Today's leader"}
                  {period === 'weekly' && "This week's champion"}
                  {period === 'allTime' && 'All-time hydration hero'}
                </span>
                <span className="font-semibold text-[#1A1F2C] dark:text-white flex items-center gap-1">
                  <Crown className="w-4 h-4 text-amber-500" />
                  {leaderboard[0]?.displayName}
                </span>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
