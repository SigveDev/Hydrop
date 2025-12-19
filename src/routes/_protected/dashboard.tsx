import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import {
  Droplets,
  LogOut,
  RefreshCw,
  BellOff,
  BellRing,
  Sun,
  Moon,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WaterProgress } from '@/components/hydration/WaterProgress'
import { QuickLogButtons } from '@/components/hydration/QuickLogButtons'
import { IntakeHistory } from '@/components/hydration/IntakeHistory'
import { SettingsPanel } from '@/components/hydration/SettingsPanel'
import { FriendsPanel, Leaderboard, ActivityFeed } from '@/components/friends'
import { useHydrationReminder } from '@/hooks/use-hydration-reminder'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import {
  createIntakeFn,
  getTodayIntakeFn,
  deleteIntakeFn,
  getUserSettingsFn,
  saveUserSettingsFn,
  getDailySummaryFn,
  registerForNotificationsFn,
} from '@/server/functions/hydration'

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
  head: () => ({
    meta: [{ title: 'Dashboard - Hydrop' }],
  }),
})

function Dashboard() {
  const queryClient = useQueryClient()
  const { theme, setTheme } = useTheme()

  // Fetch daily summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: () => getDailySummaryFn(),
  })

  // Fetch today's intakes
  const { data: intakesData, isLoading: intakesLoading } = useQuery({
    queryKey: ['today-intakes'],
    queryFn: () => getTodayIntakeFn(),
  })

  // Fetch user settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettingsFn(),
  })

  const currentSettings = settingsData?.settings ||
    settingsData?.defaults || {
      dailyGoal: 2000,
      goalUnit: 'ml',
      notificationsEnabled: true,
      reminderIntervalMinutes: 60,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    }

  // Use hydration reminder hook
  const { notificationPermission, requestPermission, isInQuietHours } =
    useHydrationReminder(settingsData ? currentSettings : null)

  // Register for notifications mutation
  const registerNotificationsMutation = useMutation({
    mutationFn: () => registerForNotificationsFn(),
    onSuccess: () => {
      toast.success('Notifications enabled!', { icon: '🔔' })
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
    },
    onError: () => {
      toast.error('Failed to enable notifications')
    },
  })

  // Handle enable notifications button click
  const handleEnableNotifications = async () => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported on this device', {
        description: 'Try using a different browser or device.',
      })
      return
    }

    // For iOS Safari, we need to inform users about limitations
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (isIOS) {
      // iOS Safari doesn't support web push notifications
      // But we can still use in-app toasts
      toast.info('iOS Notification Support', {
        description:
          "iOS Safari has limited notification support. You'll receive in-app reminders instead.",
        duration: 5000,
      })
      // Still register for in-app notifications
      await registerNotificationsMutation.mutateAsync()
      return
    }

    // Request browser permission
    const granted = await requestPermission()

    if (granted) {
      // Then register with server for push notifications
      await registerNotificationsMutation.mutateAsync()
    } else {
      toast.error('Please allow notifications in your browser settings', {
        description: "You can change this in your browser's site settings.",
      })
    }
  }

  // Create intake mutation
  const createMutation = useMutation({
    mutationFn: ({
      amount,
      photoBase64,
    }: {
      amount: number
      photoBase64: string
    }) => createIntakeFn({ data: { amount, unit: 'ml', photoBase64 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] })
      queryClient.invalidateQueries({ queryKey: ['today-intakes'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['friend-activity'] })
    },
  })

  // Delete intake mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIntakeFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] })
      queryClient.invalidateQueries({ queryKey: ['today-intakes'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['friend-activity'] })
    },
  })

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: saveUserSettingsFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] })
    },
  })

  const handleLogIntake = async (amount: number, photoBase64: string) => {
    await createMutation.mutateAsync({ amount, photoBase64 })
  }

  const handleDeleteIntake = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleSaveSettings = async (settings: {
    dailyGoal: number
    goalUnit: string
    notificationsEnabled: boolean
    reminderIntervalMinutes: number
    quietHoursEnabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
  }) => {
    await saveSettingsMutation.mutateAsync({ data: settings })
  }

  const isLoading = summaryLoading || intakesLoading || settingsLoading

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3E4FD] via-white to-[#E5DEFF] dark:from-[#1A1F2C] dark:via-[#221F26] dark:to-[#1A1F2C]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1A1F2C]/80 backdrop-blur-md border-b border-[#E5DEFF] dark:border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1A1F2C] dark:text-white">
                Hydrop
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-[#8E9196] hover:text-[#8B5CF6] dark:hover:text-[#D6BCFA]"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <Link to="/history">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#8E9196] hover:text-[#0EA5E9]"
                >
                  <Calendar className="w-5 h-5" />
                </Button>
              </Link>
              <FriendsPanel />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['daily-summary'] })
                  queryClient.invalidateQueries({ queryKey: ['today-intakes'] })
                  queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
                  queryClient.invalidateQueries({
                    queryKey: ['friend-activity'],
                  })
                }}
                className="text-[#8E9196] hover:text-[#0EA5E9]"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
              <SettingsPanel
                settings={currentSettings}
                onSave={handleSaveSettings}
                isLoading={saveSettingsMutation.isPending}
              />
              <Link to="/sign-out">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#8E9196] hover:text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Greeting */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-[#1A1F2C] dark:text-white mb-1">
              {getGreeting()}
            </h1>
            <p className="text-[#8E9196]">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </motion.div>

          {/* Notification Permission Banner */}
          {currentSettings.notificationsEnabled &&
            notificationPermission !== 'granted' && (
              <motion.div
                className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <BellOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      Enable notifications
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Get reminders to stay hydrated
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleEnableNotifications}
                    disabled={registerNotificationsMutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {registerNotificationsMutation.isPending
                      ? 'Enabling...'
                      : 'Enable'}
                  </Button>
                </div>
              </motion.div>
            )}

          {/* Water Progress */}
          <motion.div
            className="bg-white dark:bg-[#1A1F2C]/80 rounded-3xl p-6 shadow-lg shadow-[#0EA5E9]/10 dark:shadow-black/20 border border-transparent dark:border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <WaterProgress
              currentAmount={summaryData?.totalIntake || 0}
              goalAmount={summaryData?.dailyGoal || 2000}
              unit={summaryData?.unit || 'ml'}
              percentage={summaryData?.percentage || 0}
            />
          </motion.div>

          {/* Quick Log Buttons */}
          <motion.div
            className="bg-white dark:bg-[#1A1F2C]/80 rounded-3xl p-6 shadow-lg shadow-[#8B5CF6]/10 dark:shadow-black/20 border border-transparent dark:border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <QuickLogButtons
              onLog={handleLogIntake}
              unit={summaryData?.unit || 'ml'}
              isLoading={createMutation.isPending}
            />
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            className="bg-white dark:bg-[#1A1F2C]/80 rounded-3xl p-6 shadow-lg shadow-amber-500/10 dark:shadow-black/20 border border-transparent dark:border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Leaderboard />
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            className="bg-white dark:bg-[#1A1F2C]/80 rounded-3xl p-6 shadow-lg shadow-[#8B5CF6]/10 dark:shadow-black/20 border border-transparent dark:border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 }}
          >
            <ActivityFeed />
          </motion.div>

          {/* Intake History */}
          <motion.div
            className="bg-white dark:bg-[#1A1F2C]/80 rounded-3xl p-6 shadow-lg shadow-[#6E59A5]/10 dark:shadow-black/20 border border-transparent dark:border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <IntakeHistory
              intakes={intakesData?.intakes || []}
              onDelete={handleDeleteIntake}
              isLoading={deleteMutation.isPending}
            />
          </motion.div>

          {/* Reminder Status */}
          {currentSettings.notificationsEnabled && (
            <motion.div
              className={`rounded-2xl p-4 ${
                isInQuietHours
                  ? 'bg-[#E5DEFF]/50 dark:bg-[#6E59A5]/20 border border-[#6E59A5]/20 dark:border-[#6E59A5]/30'
                  : 'bg-gradient-to-r from-[#D3E4FD] to-[#E5DEFF] dark:from-[#0EA5E9]/20 dark:to-[#8B5CF6]/20'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isInQuietHours
                      ? 'bg-[#6E59A5]/10 dark:bg-[#6E59A5]/30'
                      : 'bg-white/50 dark:bg-white/10'
                  }`}
                >
                  {isInQuietHours ? (
                    '🌙'
                  ) : (
                    <BellRing className="w-5 h-5 text-[#0EA5E9]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#1A1F2C] dark:text-white">
                    {isInQuietHours ? 'Quiet hours active' : 'Reminders active'}
                  </p>
                  <p className="text-sm text-[#8E9196]">
                    {isInQuietHours
                      ? `No reminders until ${currentSettings.quietHoursEnd}`
                      : `Every ${currentSettings.reminderIntervalMinutes} minutes`}
                    {currentSettings.quietHoursEnabled && !isInQuietHours && (
                      <span>
                        {' '}
                        • Quiet {currentSettings.quietHoursStart} -{' '}
                        {currentSettings.quietHoursEnd}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning! ☀️'
  if (hour < 17) return 'Good afternoon! 🌤️'
  return 'Good evening! 🌙'
}
