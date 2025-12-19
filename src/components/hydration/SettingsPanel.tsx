import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Settings, Bell, Moon, Target, Save } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsData {
  dailyGoal: number
  goalUnit: string
  notificationsEnabled: boolean
  reminderIntervalMinutes: number
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

interface SettingsPanelProps {
  settings: SettingsData
  onSave: (settings: SettingsData) => Promise<void>
  isLoading?: boolean
}

export function SettingsPanel({
  settings,
  onSave,
  isLoading,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<SettingsData>(settings)
  const [open, setOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setHasChanges(changed)
  }, [localSettings, settings])

  const handleSave = async () => {
    try {
      await onSave(localSettings)
      toast.success('Settings saved!', { icon: '⚙️' })
      setOpen(false)
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-[#E5DEFF] dark:border-[#6E59A5]/30 hover:border-[#8B5CF6] hover:bg-[#E5DEFF]/30 dark:hover:bg-[#6E59A5]/20"
        >
          <Settings className="w-5 h-5 text-[#8B5CF6]" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white dark:bg-[#1A1F2C] border-l border-[#E5DEFF] dark:border-white/10">
        <SheetHeader className="px-2">
          <SheetTitle className="flex items-center gap-2 text-[#1A1F2C] dark:text-white">
            <Settings className="w-5 h-5 text-[#8B5CF6]" />
            Settings
          </SheetTitle>
          <SheetDescription className="text-[#8E9196]">
            Customize your hydration goals and reminders
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8 px-2">
          {/* Daily Goal Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-[#1A1F2C] dark:text-white">
              <Target className="w-5 h-5 text-[#0EA5E9]" />
              <h3 className="font-semibold">Daily Goal</h3>
            </div>

            <div className="space-y-3 px-1">
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={localSettings.dailyGoal}
                  onChange={(e) =>
                    updateSetting('dailyGoal', parseInt(e.target.value) || 2000)
                  }
                  min={500}
                  max={10000}
                  className="flex-1 bg-white dark:bg-white/5 border-[#E5DEFF] dark:border-white/10"
                />
                <span className="text-[#8E9196] font-medium">
                  {localSettings.goalUnit}
                </span>
              </div>
              <p className="text-xs text-[#8E9196]">
                Recommended: 2000-3000ml per day
              </p>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-[#1A1F2C] dark:text-white">
              <Bell className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="font-semibold">Reminders</h3>
            </div>

            <div className="space-y-4 px-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="notifications"
                  className="text-[#1A1F2C] dark:text-white"
                >
                  Enable reminders
                </Label>
                <Switch
                  id="notifications"
                  checked={localSettings.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting('notificationsEnabled', checked)
                  }
                />
              </div>

              {localSettings.notificationsEnabled && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Label className="text-sm text-[#8E9196]">
                    Remind me every {localSettings.reminderIntervalMinutes}{' '}
                    minutes
                  </Label>
                  <Slider
                    value={[localSettings.reminderIntervalMinutes]}
                    onValueChange={([value]) =>
                      updateSetting('reminderIntervalMinutes', value)
                    }
                    min={15}
                    max={240}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#8E9196]">
                    <span>15 min</span>
                    <span>4 hours</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Quiet Hours Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-[#1A1F2C] dark:text-white">
              <Moon className="w-5 h-5 text-[#6E59A5]" />
              <h3 className="font-semibold">Quiet Hours</h3>
            </div>

            <div className="space-y-4 px-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="quietHours"
                  className="text-[#1A1F2C] dark:text-white"
                >
                  Enable quiet hours
                </Label>
                <Switch
                  id="quietHours"
                  checked={localSettings.quietHoursEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting('quietHoursEnabled', checked)
                  }
                />
              </div>

              {localSettings.quietHoursEnabled && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <p className="text-sm text-[#8E9196]">
                    No reminders will be sent during these hours
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-[#8E9196]">From</Label>
                      <Input
                        type="time"
                        value={localSettings.quietHoursStart}
                        onChange={(e) =>
                          updateSetting('quietHoursStart', e.target.value)
                        }
                        className="bg-white dark:bg-white/5 border-[#E5DEFF] dark:border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-[#8E9196]">To</Label>
                      <Input
                        type="time"
                        value={localSettings.quietHoursEnd}
                        onChange={(e) =>
                          updateSetting('quietHoursEnd', e.target.value)
                        }
                        className="bg-white dark:bg-white/5 border-[#E5DEFF] dark:border-white/10"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#E5DEFF]/30 dark:bg-[#6E59A5]/20 rounded-xl">
                    <p className="text-sm text-[#6E59A5] dark:text-[#D6BCFA]">
                      💤 Quiet from {localSettings.quietHoursStart} to{' '}
                      {localSettings.quietHoursEnd}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            className="px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white py-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
