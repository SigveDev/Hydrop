import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Query, ID, Permission, Role, Storage } from 'node-appwrite'
import { InputFile } from 'node-appwrite/file'
import { db } from '@/server/lib/db'
import { authMiddleware } from '@/server/functions/auth'
import { createAdminClient } from '@/server/lib/appwrite'

const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID!

// Schema definitions
const addFriendSchema = z.object({
  friendCode: z.string().min(6).max(10),
})

const respondFriendRequestSchema = z.object({
  friendshipId: z.string(),
  accept: z.boolean(),
})

const removeFriendSchema = z.object({
  friendshipId: z.string(),
})

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
  avatarBase64: z.string().optional(),
})

// Generate a unique friend code
function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Helper to get avatar URL
async function getAvatarUrl(fileId: string | null): Promise<string | null> {
  if (!fileId) return null

  try {
    const { client } = createAdminClient()
    const storage = new Storage(client)
    const result = await storage.getFileView({
      bucketId: APPWRITE_BUCKET_ID,
      fileId,
    })

    const buffer = Buffer.from(result)
    const base64 = buffer.toString('base64')
    return `data:image/jpeg;base64,${base64}`
  } catch {
    return null
  }
}

// Calculate streak for a user
async function calculateStreak(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const checkDate = new Date(today)

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(checkDate)
    const dayEnd = new Date(checkDate)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const intakes = await db.waterIntake.list([
      Query.equal('createdBy', [userId]),
      Query.greaterThanEqual('loggedAt', dayStart.toISOString()),
      Query.lessThan('loggedAt', dayEnd.toISOString()),
      Query.limit(1),
    ])

    if (intakes.rows.length > 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      // If it's today and no intake yet, don't break streak
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      }
      break
    }
  }

  return streak
}

// Get or create user profile
export const getMyProfileFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const result = await db.userProfiles.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.limit(1),
    ])

    if (result.rows.length === 0) {
      // Create profile with generated friend code
      let friendCode = generateFriendCode()

      // Ensure unique friend code
      let attempts = 0
      while (attempts < 10) {
        const existing = await db.userProfiles.list([
          Query.equal('friendCode', [friendCode]),
          Query.limit(1),
        ])
        if (existing.rows.length === 0) break
        friendCode = generateFriendCode()
        attempts++
      }

      const profile = await db.userProfiles.create({
        createdBy: currentUser.$id,
        displayName: currentUser.name || currentUser.email.split('@')[0],
        email: currentUser.email,
        avatarFileId: null,
        friendCode,
      })

      return {
        profile: {
          ...profile,
          avatarUrl: null,
        },
      }
    }

    const profile = result.rows[0]
    const avatarUrl = await getAvatarUrl(profile.avatarFileId)

    return {
      profile: {
        ...profile,
        avatarUrl,
      },
    }
  },
)

// Update user profile
export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const result = await db.userProfiles.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.limit(1),
    ])

    if (result.rows.length === 0) {
      throw new Error('Profile not found')
    }

    const existingProfile = result.rows[0]
    let avatarFileId = existingProfile.avatarFileId

    // Upload new avatar if provided
    if (data.avatarBase64) {
      const { client } = createAdminClient()
      const storage = new Storage(client)

      // Delete old avatar if exists
      if (avatarFileId) {
        try {
          await storage.deleteFile({
            bucketId: APPWRITE_BUCKET_ID,
            fileId: avatarFileId,
          })
        } catch {
          // Ignore deletion errors
        }
      }

      // Upload new avatar
      const base64Clean = data.avatarBase64.replace(
        /^data:image\/\w+;base64,/,
        '',
      )
      const buffer = Buffer.from(base64Clean, 'base64')
      const fileId = ID.unique()
      const inputFile = InputFile.fromBuffer(buffer, `avatar_${fileId}.jpg`)

      await storage.createFile({
        bucketId: APPWRITE_BUCKET_ID,
        fileId,
        file: inputFile,
        permissions: [
          Permission.read(Role.users()),
          Permission.delete(Role.user(currentUser.$id)),
        ],
      })

      avatarFileId = fileId
    }

    const profile = await db.userProfiles.update(existingProfile.$id, {
      displayName: data.displayName.trim(),
      avatarFileId,
    })

    const avatarUrl = await getAvatarUrl(avatarFileId)

    return {
      profile: {
        ...profile,
        avatarUrl,
      },
    }
  })

// Add friend by friend code
export const addFriendFn = createServerFn({ method: 'POST' })
  .inputValidator(addFriendSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Find user by friend code
    const friendProfile = await db.userProfiles.list([
      Query.equal('friendCode', [data.friendCode.toUpperCase()]),
      Query.limit(1),
    ])

    if (friendProfile.rows.length === 0) {
      throw new Error('Friend code not found')
    }

    const friend = friendProfile.rows[0]

    // Can't add yourself
    if (friend.createdBy === currentUser.$id) {
      throw new Error("You can't add yourself as a friend")
    }

    // Check if friendship already exists
    const existingFriendship = await db.friendships.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.equal('friendUserId', [friend.createdBy]),
      Query.limit(1),
    ])

    if (existingFriendship.rows.length > 0) {
      throw new Error('Friend request already sent or already friends')
    }

    // Check reverse friendship (they might have sent us a request)
    const reverseFriendship = await db.friendships.list([
      Query.equal('createdBy', [friend.createdBy]),
      Query.equal('friendUserId', [currentUser.$id]),
      Query.limit(1),
    ])

    if (reverseFriendship.rows.length > 0) {
      // Auto-accept if they already sent us a request
      if (reverseFriendship.rows[0].status === 'pending') {
        await db.friendships.update(reverseFriendship.rows[0].$id, {
          status: 'accepted',
        })

        // Create reverse friendship
        await db.friendships.create({
          createdBy: currentUser.$id,
          friendUserId: friend.createdBy,
          status: 'accepted',
          friendEmail: friend.email,
          friendName: friend.displayName,
        })

        return { success: true, status: 'accepted' }
      }
      throw new Error('Already friends')
    }

    // Create friend request
    await db.friendships.create({
      createdBy: currentUser.$id,
      friendUserId: friend.createdBy,
      status: 'pending',
      friendEmail: friend.email,
      friendName: friend.displayName,
    })

    return { success: true, status: 'pending' }
  })

// Get friend requests (pending)
export const getFriendRequestsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Get incoming requests (where I'm the friendUserId)
    const incoming = await db.friendships.list([
      Query.equal('friendUserId', [currentUser.$id]),
      Query.equal('status', ['pending']),
    ])

    // Get requester profiles
    const requestsWithProfiles = await Promise.all(
      incoming.rows.map(async (request) => {
        const profile = await db.userProfiles.list([
          Query.equal('createdBy', [request.createdBy]),
          Query.limit(1),
        ])

        const requesterProfile = profile.rows[0]
        const avatarUrl = requesterProfile
          ? await getAvatarUrl(requesterProfile.avatarFileId)
          : null

        return {
          ...request,
          requesterProfile: requesterProfile
            ? {
                ...requesterProfile,
                avatarUrl,
              }
            : null,
        }
      }),
    )

    return { requests: requestsWithProfiles }
  },
)

// Respond to friend request
export const respondFriendRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(respondFriendRequestSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const friendship = await db.friendships.get(data.friendshipId)

    if (!friendship || friendship.friendUserId !== currentUser.$id) {
      throw new Error('Friend request not found')
    }

    if (friendship.status !== 'pending') {
      throw new Error('Friend request already processed')
    }

    if (data.accept) {
      // Accept the request
      await db.friendships.update(data.friendshipId, {
        status: 'accepted',
      })

      // Get my profile
      const myProfile = await db.userProfiles.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      // Create reverse friendship
      if (myProfile.rows.length > 0) {
        await db.friendships.create({
          createdBy: currentUser.$id,
          friendUserId: friendship.createdBy,
          status: 'accepted',
          friendEmail: null,
          friendName: friendship.friendName,
        })
      }

      return { success: true, status: 'accepted' }
    } else {
      // Decline - delete the request
      await db.friendships.delete(data.friendshipId)
      return { success: true, status: 'declined' }
    }
  })

// Get friends list
export const getFriendsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const friendships = await db.friendships.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.equal('status', ['accepted']),
    ])

    // Get friend profiles with avatars
    const friendsWithProfiles = await Promise.all(
      friendships.rows.map(async (friendship) => {
        const profile = await db.userProfiles.list([
          Query.equal('createdBy', [friendship.friendUserId]),
          Query.limit(1),
        ])

        const friendProfile = profile.rows[0]
        const avatarUrl = friendProfile
          ? await getAvatarUrl(friendProfile.avatarFileId)
          : null

        return {
          ...friendship,
          profile: friendProfile
            ? {
                ...friendProfile,
                avatarUrl,
              }
            : null,
        }
      }),
    )

    return { friends: friendsWithProfiles }
  },
)

// Remove friend
export const removeFriendFn = createServerFn({ method: 'POST' })
  .inputValidator(removeFriendSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const friendship = await db.friendships.get(data.friendshipId)

    if (!friendship || friendship.createdBy !== currentUser.$id) {
      throw new Error('Friendship not found')
    }

    // Delete both directions
    await db.friendships.delete(data.friendshipId)

    // Find and delete reverse friendship
    const reverse = await db.friendships.list([
      Query.equal('createdBy', [friendship.friendUserId]),
      Query.equal('friendUserId', [currentUser.$id]),
      Query.limit(1),
    ])

    if (reverse.rows.length > 0) {
      await db.friendships.delete(reverse.rows[0].$id)
    }

    return { success: true }
  })

// Get leaderboard (friends + me) with daily, weekly, and all-time stats
export const getLeaderboardFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get week start (Monday)
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    if (weekStart > today) weekStart.setDate(weekStart.getDate() - 7)

    // Get my profile
    const myProfileResult = await db.userProfiles.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.limit(1),
    ])

    const myProfile = myProfileResult.rows[0]
    const myAvatarUrl = myProfile
      ? await getAvatarUrl(myProfile.avatarFileId)
      : null

    // Get my friends
    const friendships = await db.friendships.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.equal('status', ['accepted']),
    ])

    // Collect all user IDs (me + friends)
    const userIds = [
      currentUser.$id,
      ...friendships.rows.map((f) => f.friendUserId),
    ]

    // Get daily, weekly, and all-time totals for all users
    const leaderboardData = await Promise.all(
      userIds.map(async (userId) => {
        // Get daily intake
        const dailyIntake = await db.waterIntake.list([
          Query.equal('createdBy', [userId]),
          Query.greaterThanEqual('loggedAt', today.toISOString()),
          Query.lessThan('loggedAt', tomorrow.toISOString()),
        ])

        // Get weekly intake
        const weeklyIntake = await db.waterIntake.list([
          Query.equal('createdBy', [userId]),
          Query.greaterThanEqual('loggedAt', weekStart.toISOString()),
          Query.lessThan('loggedAt', tomorrow.toISOString()),
        ])

        // Get all-time intake (limit to 1000 most recent for performance)
        const allTimeIntake = await db.waterIntake.list([
          Query.equal('createdBy', [userId]),
          Query.orderDesc('loggedAt'),
          Query.limit(1000),
        ])

        const dailyTotal = dailyIntake.rows.reduce(
          (sum, i) => sum + i.amount,
          0,
        )
        const weeklyTotal = weeklyIntake.rows.reduce(
          (sum, i) => sum + i.amount,
          0,
        )
        const allTimeTotal = allTimeIntake.rows.reduce(
          (sum, i) => sum + i.amount,
          0,
        )

        // Calculate unique days tracked
        const uniqueDays = new Set(
          allTimeIntake.rows.map((i) => new Date(i.loggedAt).toDateString()),
        )
        const totalDays = uniqueDays.size

        // Calculate average daily intake (for weekly view)
        const daysInWeek = Math.min(
          7,
          Math.ceil(
            (tomorrow.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
        const avgDaily =
          daysInWeek > 0 ? Math.round(weeklyTotal / daysInWeek) : 0

        // Get user profile
        let profile = null
        let avatarUrl = null

        if (userId === currentUser.$id) {
          profile = myProfile
          avatarUrl = myAvatarUrl
        } else {
          const profileResult = await db.userProfiles.list([
            Query.equal('createdBy', [userId]),
            Query.limit(1),
          ])
          profile = profileResult.rows[0]
          avatarUrl = profile ? await getAvatarUrl(profile.avatarFileId) : null
        }

        // Get user settings for goal
        const settingsResult = await db.userSettings.list([
          Query.equal('createdBy', [userId]),
          Query.limit(1),
        ])
        const settings = settingsResult.rows[0]
        const dailyGoal = settings?.dailyGoal || 2000

        // Calculate streak
        const streak = await calculateStreak(userId)

        return {
          userId,
          isMe: userId === currentUser.$id,
          displayName: profile?.displayName || 'Unknown',
          avatarUrl,
          dailyTotal,
          weeklyTotal,
          allTimeTotal,
          dailyGoal,
          dailyPercentage: Math.min(
            Math.round((dailyTotal / dailyGoal) * 100),
            100,
          ),
          streak,
          totalDays,
          avgDaily,
        }
      }),
    )

    // Sort by daily total (descending)
    const dailyLeaderboard = [...leaderboardData].sort(
      (a, b) => b.dailyTotal - a.dailyTotal,
    )

    // Sort by weekly total (descending)
    const weeklyLeaderboard = [...leaderboardData].sort(
      (a, b) => b.weeklyTotal - a.weeklyTotal,
    )

    // Sort by all-time total (descending)
    const allTimeLeaderboard = [...leaderboardData].sort(
      (a, b) => b.allTimeTotal - a.allTimeTotal,
    )

    return {
      daily: dailyLeaderboard,
      weekly: weeklyLeaderboard,
      allTime: allTimeLeaderboard,
    }
  },
)

// Get friend activity feed
export const getFriendActivityFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Get my friends
    const friendships = await db.friendships.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.equal('status', ['accepted']),
    ])

    const friendIds = friendships.rows.map((f) => f.friendUserId)

    if (friendIds.length === 0) {
      return { activities: [] }
    }

    // Get recent intakes from friends (last 24 hours)
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)

    const activities: Array<{
      id: string
      userId: string
      displayName: string
      avatarUrl: string | null
      type: 'intake' | 'goal_reached' | 'streak' | 'milestone'
      message: string
      timestamp: string
      amount?: number
      streak?: number
    }> = []

    // Get friend profiles for display names
    const friendProfiles = await Promise.all(
      friendIds.map(async (friendId) => {
        const profile = await db.userProfiles.list([
          Query.equal('createdBy', [friendId]),
          Query.limit(1),
        ])
        const p = profile.rows[0]
        const avatarUrl = p ? await getAvatarUrl(p.avatarFileId) : null
        return {
          userId: friendId,
          displayName: p?.displayName || 'Unknown',
          avatarUrl,
        }
      }),
    )

    const profileMap = new Map(friendProfiles.map((p) => [p.userId, p]))

    // Get recent intakes from all friends
    for (const friendId of friendIds) {
      const intakes = await db.waterIntake.list([
        Query.equal('createdBy', [friendId]),
        Query.greaterThanEqual('loggedAt', yesterday.toISOString()),
        Query.orderDesc('loggedAt'),
        Query.limit(5),
      ])

      const profile = profileMap.get(friendId)

      for (const intake of intakes.rows) {
        activities.push({
          id: intake.$id,
          userId: friendId,
          displayName: profile?.displayName || 'Unknown',
          avatarUrl: profile?.avatarUrl || null,
          type: 'intake',
          message: `drank ${intake.amount}ml of water`,
          timestamp: intake.loggedAt,
          amount: intake.amount,
        })
      }

      // Check if friend reached their goal today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayIntakes = await db.waterIntake.list([
        Query.equal('createdBy', [friendId]),
        Query.greaterThanEqual('loggedAt', today.toISOString()),
        Query.lessThan('loggedAt', tomorrow.toISOString()),
      ])

      const todayTotal = todayIntakes.rows.reduce((sum, i) => sum + i.amount, 0)

      // Get friend's goal
      const settings = await db.userSettings.list([
        Query.equal('createdBy', [friendId]),
        Query.limit(1),
      ])
      const dailyGoal = settings.rows[0]?.dailyGoal || 2000

      if (todayTotal >= dailyGoal && todayIntakes.rows.length > 0) {
        // Find the intake that pushed them over the goal
        let runningTotal = 0
        for (const intake of todayIntakes.rows.sort(
          (a, b) =>
            new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
        )) {
          runningTotal += intake.amount
          if (runningTotal >= dailyGoal) {
            // Check if we already have this goal_reached activity
            const existingGoal = activities.find(
              (a) => a.userId === friendId && a.type === 'goal_reached',
            )
            if (!existingGoal) {
              activities.push({
                id: `goal-${friendId}-${today.toISOString()}`,
                userId: friendId,
                displayName: profile?.displayName || 'Unknown',
                avatarUrl: profile?.avatarUrl || null,
                type: 'goal_reached',
                message: `reached their daily goal of ${dailyGoal}ml! 🎉`,
                timestamp: intake.loggedAt,
              })
            }
            break
          }
        }
      }

      // Check for streaks
      const streak = await calculateStreak(friendId)
      if (streak >= 7 && streak % 7 === 0) {
        activities.push({
          id: `streak-${friendId}-${streak}`,
          userId: friendId,
          displayName: profile?.displayName || 'Unknown',
          avatarUrl: profile?.avatarUrl || null,
          type: 'streak',
          message: `is on a ${streak}-day hydration streak! 🔥`,
          timestamp: new Date().toISOString(),
          streak,
        })
      }
    }

    // Sort by timestamp (most recent first) and limit
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    return { activities: activities.slice(0, 20) }
  },
)
