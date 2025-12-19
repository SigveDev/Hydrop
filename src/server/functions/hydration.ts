import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { Query, ID, Permission, Role, Storage } from 'node-appwrite'
import { InputFile } from 'node-appwrite/file'
import { db } from '@/server/lib/db'
import { authMiddleware } from '@/server/functions/auth'
import { createAdminClient } from '@/server/lib/appwrite'

const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID!

// Schema definitions
const createIntakeSchema = z.object({
  amount: z.number().min(1).max(5000),
  unit: z.string().default('ml'),
  photoBase64: z.string(), // Required photo as base64
})

const updateIntakeSchema = z.object({
  id: z.string(),
  amount: z.number().min(1).max(5000).optional(),
  unit: z.string().optional(),
})

const deleteIntakeSchema = z.object({
  id: z.string(),
})

const settingsSchema = z.object({
  dailyGoal: z.number().min(500).max(10000),
  goalUnit: z.string().default('ml'),
  notificationsEnabled: z.boolean(),
  reminderIntervalMinutes: z.number().min(15).max(240),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string(), // HH:mm format
  quietHoursEnd: z.string(), // HH:mm format
})

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const getHistoryByDateSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
})

// Helper to compress and upload image
async function uploadPhoto(
  userId: string,
  base64Data: string,
): Promise<string> {
  const { client } = createAdminClient()
  const storage = new Storage(client)

  // Strip data URL prefix if present
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Clean, 'base64')

  // Create file from buffer
  const fileId = ID.unique()
  const inputFile = InputFile.fromBuffer(buffer, `drink_${fileId}.jpg`)

  await storage.createFile({
    bucketId: APPWRITE_BUCKET_ID,
    fileId,
    file: inputFile,
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  })

  return fileId
}

// Helper to get photo URL
async function getPhotoUrl(fileId: string): Promise<string | null> {
  if (!fileId) return null

  try {
    const { client } = createAdminClient()
    const storage = new Storage(client)
    const result = await storage.getFileView({
      bucketId: APPWRITE_BUCKET_ID,
      fileId,
    })

    // Convert ArrayBuffer to base64 data URL
    const buffer = Buffer.from(result)
    const base64 = buffer.toString('base64')
    return `data:image/jpeg;base64,${base64}`
  } catch {
    return null
  }
}

// Create water intake entry with photo
export const createIntakeFn = createServerFn({ method: 'POST' })
  .inputValidator(createIntakeSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Upload photo first
    const photoFileId = await uploadPhoto(currentUser.$id, data.photoBase64)

    const intake = await db.waterIntake.create({
      createdBy: currentUser.$id,
      amount: data.amount,
      unit: data.unit,
      loggedAt: new Date().toISOString(),
      photoFileId,
    })

    return { intake }
  })

// Get today's water intake entries
export const getTodayIntakeFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const result = await db.waterIntake.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.greaterThanEqual('loggedAt', today.toISOString()),
      Query.lessThan('loggedAt', tomorrow.toISOString()),
      Query.orderDesc('loggedAt'),
    ])

    // Fetch photo URLs for each intake
    const intakesWithPhotos = await Promise.all(
      result.rows.map(async (intake) => ({
        ...intake,
        photoUrl: await getPhotoUrl(intake.photoFileId),
      })),
    )

    return {
      intakes: intakesWithPhotos,
      total: result.total,
    }
  },
)

// Get intake history for a specific date
export const getIntakeByDateFn = createServerFn({ method: 'GET' })
  .inputValidator(getHistoryByDateSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const date = new Date(data.date)
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const result = await db.waterIntake.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.greaterThanEqual('loggedAt', date.toISOString()),
      Query.lessThan('loggedAt', nextDay.toISOString()),
      Query.orderDesc('loggedAt'),
    ])

    // Fetch photo URLs for each intake
    const intakesWithPhotos = await Promise.all(
      result.rows.map(async (intake) => ({
        ...intake,
        photoUrl: await getPhotoUrl(intake.photoFileId),
      })),
    )

    const totalAmount = result.rows.reduce((sum, i) => sum + i.amount, 0)

    return {
      intakes: intakesWithPhotos,
      total: result.total,
      totalAmount,
      date: data.date,
    }
  })

// Get intake history with optional date range (for calendar view)
export const getIntakeHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator(dateRangeSchema.optional())
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const queries = [
      Query.equal('createdBy', [currentUser.$id]),
      Query.orderDesc('loggedAt'),
      Query.limit(500),
    ]

    if (data?.startDate) {
      queries.push(Query.greaterThanEqual('loggedAt', data.startDate))
    }
    if (data?.endDate) {
      queries.push(Query.lessThan('loggedAt', data.endDate))
    }

    const result = await db.waterIntake.list(queries)

    // Group by date for calendar view
    const byDate: Record<
      string,
      { total: number; count: number; entries: typeof result.rows }
    > = {}

    for (const intake of result.rows) {
      const dateKey = intake.loggedAt.split('T')[0]
      if (!byDate[dateKey]) {
        byDate[dateKey] = { total: 0, count: 0, entries: [] }
      }
      byDate[dateKey].total += intake.amount
      byDate[dateKey].count += 1
      byDate[dateKey].entries.push(intake)
    }

    return {
      intakes: result.rows,
      total: result.total,
      byDate,
    }
  })

// Update water intake entry
export const updateIntakeFn = createServerFn({ method: 'POST' })
  .inputValidator(updateIntakeSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Verify ownership
    const existing = await db.waterIntake.get(data.id)
    if (!existing || existing.createdBy !== currentUser.$id) {
      throw new Error('Not found or unauthorized')
    }

    const updateData: Record<string, unknown> = {}
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.unit !== undefined) updateData.unit = data.unit

    const intake = await db.waterIntake.update(data.id, updateData)

    return { intake }
  })

// Delete water intake entry
export const deleteIntakeFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteIntakeSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Verify ownership
    const existing = await db.waterIntake.get(data.id)
    if (!existing || existing.createdBy !== currentUser.$id) {
      throw new Error('Not found or unauthorized')
    }

    // Delete the photo from storage
    if (existing.photoFileId) {
      try {
        const { client } = createAdminClient()
        const storage = new Storage(client)
        await storage.deleteFile({
          bucketId: APPWRITE_BUCKET_ID,
          fileId: existing.photoFileId,
        })
      } catch {
        // Photo might already be deleted, continue
      }
    }

    await db.waterIntake.delete(data.id)

    return { success: true }
  })

// Get user settings
export const getUserSettingsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const result = await db.userSettings.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.limit(1),
    ])

    if (result.rows.length === 0) {
      // Return default settings
      return {
        settings: null,
        defaults: {
          dailyGoal: 2000,
          goalUnit: 'ml',
          notificationsEnabled: true,
          reminderIntervalMinutes: 60,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        },
      }
    }

    return { settings: result.rows[0], defaults: null }
  },
)

// Create or update user settings
export const saveUserSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(settingsSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // Check if settings exist
    const existing = await db.userSettings.list([
      Query.equal('createdBy', [currentUser.$id]),
      Query.limit(1),
    ])

    if (existing.rows.length > 0) {
      // Update existing
      const settings = await db.userSettings.update(existing.rows[0].$id, {
        dailyGoal: data.dailyGoal,
        goalUnit: data.goalUnit,
        notificationsEnabled: data.notificationsEnabled,
        reminderIntervalMinutes: data.reminderIntervalMinutes,
        quietHoursEnabled: data.quietHoursEnabled,
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
      })
      return { settings }
    } else {
      // Create new
      const settings = await db.userSettings.create({
        createdBy: currentUser.$id,
        dailyGoal: data.dailyGoal,
        goalUnit: data.goalUnit,
        notificationsEnabled: data.notificationsEnabled,
        reminderIntervalMinutes: data.reminderIntervalMinutes,
        quietHoursEnabled: data.quietHoursEnabled,
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
      })
      return { settings }
    }
  })

// Get daily summary (total intake for today)
export const getDailySummaryFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [intakeResult, settingsResult] = await Promise.all([
      db.waterIntake.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.greaterThanEqual('loggedAt', today.toISOString()),
        Query.lessThan('loggedAt', tomorrow.toISOString()),
      ]),
      db.userSettings.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ]),
    ])

    const totalIntake = intakeResult.rows.reduce(
      (sum, intake) => sum + intake.amount,
      0,
    )
    const settings = settingsResult.rows[0] || null
    const dailyGoal = settings?.dailyGoal || 2000

    return {
      totalIntake,
      dailyGoal,
      percentage: Math.min(Math.round((totalIntake / dailyGoal) * 100), 100),
      entriesCount: intakeResult.total,
      unit: settings?.goalUnit || 'ml',
    }
  },
)

// Register user for push notifications
export const registerForNotificationsFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const { currentUser } = await authMiddleware()
  if (!currentUser) throw new Error('Unauthorized')

  // Check if user has settings, if not create with notifications enabled
  const existing = await db.userSettings.list([
    Query.equal('createdBy', [currentUser.$id]),
    Query.limit(1),
  ])

  if (existing.rows.length === 0) {
    // Create settings with notifications enabled
    await db.userSettings.create({
      createdBy: currentUser.$id,
      dailyGoal: 2000,
      goalUnit: 'ml',
      notificationsEnabled: true,
      reminderIntervalMinutes: 60,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    })
  } else if (!existing.rows[0].notificationsEnabled) {
    // Enable notifications if they were disabled
    await db.userSettings.update(existing.rows[0].$id, {
      notificationsEnabled: true,
    })
  }

  return {
    success: true,
    userId: currentUser.$id,
    message: 'Successfully registered for notifications',
  }
})
