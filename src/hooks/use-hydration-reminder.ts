import { useEffect, useCallback, useState } from 'react'
import { toast } from 'sonner'

interface ReminderSettings {
  notificationsEnabled: boolean
  reminderIntervalMinutes: number
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

export function useHydrationReminder(settings: ReminderSettings | null) {
  const [lastReminder, setLastReminder] = useState<Date | null>(null)
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  // Detect iOS on mount
  useEffect(() => {
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(iOS)

    // Check initial permission state
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Check if we're in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!settings?.quietHoursEnabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = settings.quietHoursStart
      .split(':')
      .map(Number)
    const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime
    }

    return currentTime >= startTime && currentTime < endTime
  }, [settings])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    // Check if Notification API is supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    // iOS Safari doesn't support web push notifications
    // But we can still show in-app toasts
    if (isIOS) {
      // For iOS, we'll rely on in-app toasts
      setNotificationPermission('granted') // Fake it for in-app toasts
      return true
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted')
      return true
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        return permission === 'granted'
      } catch (error) {
        console.error('Error requesting notification permission:', error)
        return false
      }
    }

    setNotificationPermission('denied')
    return false
  }, [isIOS])

  // Send notification
  const sendNotification = useCallback(() => {
    if (isInQuietHours()) {
      console.log('In quiet hours, skipping notification')
      return
    }

    // Show toast notification in-app (works on all platforms including iOS)
    toast('💧 Time to hydrate!', {
      description: 'Remember to drink some water to stay healthy.',
      duration: 10000,
      action: {
        label: 'Got it',
        onClick: () => {},
      },
    })

    // Send browser notification if permitted and not iOS
    // iOS Safari doesn't support the Notification constructor
    if (
      !isIOS &&
      notificationPermission === 'granted' &&
      'Notification' in window
    ) {
      try {
        new Notification('Hydrop - Time to Hydrate! 💧', {
          body: 'Remember to drink some water to stay healthy.',
          icon: '/favicon.ico',
          tag: 'hydration-reminder',
        })
      } catch {
        // Notification constructor might fail on some browsers
        console.log('Browser notification failed, using toast instead')
      }
    }

    setLastReminder(new Date())
  }, [isInQuietHours, notificationPermission, isIOS])

  // Set up reminder interval
  useEffect(() => {
    if (!settings?.notificationsEnabled) return

    // Request permission on mount (but don't block on it)
    // For iOS, this will just set up in-app toasts
    if (!isIOS) {
      requestPermission()
    }

    const intervalMs = settings.reminderIntervalMinutes * 60 * 1000

    const interval = setInterval(() => {
      sendNotification()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [settings, requestPermission, sendNotification, isIOS])

  return {
    lastReminder,
    notificationPermission,
    requestPermission,
    sendNotification,
    isInQuietHours: isInQuietHours(),
    isIOS,
  }
}
