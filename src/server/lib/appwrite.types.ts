import { type Models } from 'node-appwrite'

export type WaterIntake = Models.Row & {
  createdBy: string
  amount: number
  unit: string
  loggedAt: string
  photoFileId: string
}

export type UserSettings = Models.Row & {
  createdBy: string
  dailyGoal: number
  goalUnit: string
  notificationsEnabled: boolean
  reminderIntervalMinutes: number
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

export type Friendships = Models.Row & {
  createdBy: string
  friendUserId: string
  status: string
  friendEmail: string | null
  friendName: string | null
}

export type UserProfiles = Models.Row & {
  createdBy: string
  displayName: string
  email: string
  avatarFileId: string | null
  friendCode: string
}
