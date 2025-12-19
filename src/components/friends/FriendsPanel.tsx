import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Copy,
  Check,
  X,
  Trash2,
  Bell,
  Loader2,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  getMyProfileFn,
  getFriendsFn,
  getFriendRequestsFn,
  addFriendFn,
  respondFriendRequestFn,
  removeFriendFn,
} from '@/server/functions/friends'

export function FriendsPanel() {
  const [friendCode, setFriendCode] = useState('')
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  // Get my profile
  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfileFn(),
  })

  // Get friends list
  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriendsFn(),
  })

  // Get friend requests
  const { data: requestsData } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => getFriendRequestsFn(),
  })

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: (code: string) => addFriendFn({ data: { friendCode: code } }),
    onSuccess: (result) => {
      if (result.status === 'accepted') {
        toast.success('Friend added!')
      } else {
        toast.success('Friend request sent!')
      }
      setFriendCode('')
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add friend')
    },
  })

  // Respond to request mutation
  const respondMutation = useMutation({
    mutationFn: ({
      friendshipId,
      accept,
    }: {
      friendshipId: string
      accept: boolean
    }) => respondFriendRequestFn({ data: { friendshipId, accept } }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.accept ? 'Friend request accepted!' : 'Request declined',
      )
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
    onError: () => {
      toast.error('Failed to respond to request')
    },
  })

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: (friendshipId: string) =>
      removeFriendFn({ data: { friendshipId } }),
    onSuccess: () => {
      toast.success('Friend removed')
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
    onError: () => {
      toast.error('Failed to remove friend')
    },
  })

  const copyFriendCode = () => {
    if (profileData?.profile?.friendCode) {
      navigator.clipboard.writeText(profileData.profile.friendCode)
      setCopied(true)
      toast.success('Friend code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareFriendCode = async () => {
    if (profileData?.profile?.friendCode) {
      const shareData = {
        title: 'Add me on Hydrop!',
        text: `Join me on Hydrop and let's stay hydrated together! My friend code is: ${profileData.profile.friendCode}`,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch {
          // User cancelled or share failed, fall back to copy
          copyFriendCode()
        }
      } else {
        copyFriendCode()
      }
    }
  }

  const handleAddFriend = () => {
    if (!friendCode.trim()) {
      toast.error('Please enter a friend code')
      return
    }
    addFriendMutation.mutate(friendCode.trim())
  }

  const pendingRequests = requestsData?.requests || []
  const friends = friendsData?.friends || []

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#8E9196] hover:text-[#8B5CF6] dark:hover:text-[#D6BCFA]"
        >
          <Users className="w-5 h-5" />
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="px-2">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8B5CF6]" />
            Friends
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-2">
          {/* My Friend Code */}
          <div className="bg-gradient-to-r from-[#E5DEFF] to-[#D3E4FD] dark:from-[#8B5CF6]/20 dark:to-[#0EA5E9]/20 rounded-xl p-4">
            <p className="text-sm text-[#8E9196] mb-2">Your Friend Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-2xl font-bold tracking-wider text-[#1A1F2C] dark:text-white">
                {profileData?.profile?.friendCode || '------'}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyFriendCode}
                className="bg-white dark:bg-white/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={shareFriendCode}
                className="bg-white dark:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-[#8E9196] mt-2">
              Share this code with friends to compete!
            </p>
          </div>

          {/* Add Friend */}
          <div>
            <p className="text-sm font-medium text-[#1A1F2C] dark:text-white mb-2">
              Add a Friend
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter friend code"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                className="flex-1 uppercase tracking-wider bg-white dark:bg-white/5"
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddFriend()
                  }
                }}
              />
              <Button
                onClick={handleAddFriend}
                disabled={addFriendMutation.isPending}
                className="bg-[#8B5CF6] hover:bg-[#7E69AB]"
              >
                {addFriendMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Friend Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium text-[#1A1F2C] dark:text-white">
                  Friend Requests
                </p>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                >
                  {pendingRequests.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {pendingRequests.map((request) => (
                    <motion.div
                      key={request.$id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={request.requesterProfile?.avatarUrl || undefined}
                        />
                        <AvatarFallback className="bg-[#8B5CF6] text-white">
                          {request.requesterProfile?.displayName?.[0]?.toUpperCase() ||
                            '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1A1F2C] dark:text-white truncate">
                          {request.requesterProfile?.displayName || 'Unknown'}
                        </p>
                        <p className="text-xs text-[#8E9196]">
                          Wants to be friends
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            respondMutation.mutate({
                              friendshipId: request.$id,
                              accept: true,
                            })
                          }
                          disabled={respondMutation.isPending}
                          className="w-8 h-8 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            respondMutation.mutate({
                              friendshipId: request.$id,
                              accept: false,
                            })
                          }
                          disabled={respondMutation.isPending}
                          className="w-8 h-8 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Friends List */}
          <div>
            <p className="text-sm font-medium text-[#1A1F2C] dark:text-white mb-3">
              Your Friends ({friends.length})
            </p>
            {friendsLoading ? (
              <div className="py-8 text-center text-[#8E9196]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : friends.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-[#8E9196]/30" />
                <p className="text-[#8E9196]">No friends yet</p>
                <p className="text-xs text-[#8E9196]/70">
                  Share your friend code to start competing!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  <AnimatePresence>
                    {friends.map((friend) => (
                      <motion.div
                        key={friend.$id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-[#E5DEFF] dark:border-white/10 group"
                      >
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={friend.profile?.avatarUrl || undefined}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white">
                              {friend.profile?.displayName?.[0]?.toUpperCase() ||
                                '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1A1F2C] dark:text-white truncate">
                              {friend.profile?.displayName ||
                                friend.friendName ||
                                'Unknown'}
                            </p>
                          </div>
                          <p className="text-xs text-[#8E9196]">
                            {friend.profile?.friendCode}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            removeFriendMutation.mutate(friend.$id)
                          }
                          disabled={removeFriendMutation.isPending}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8E9196] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
