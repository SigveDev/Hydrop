import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isFuture,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Calendar,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getIntakeHistoryFn,
  getIntakeByDateFn,
} from '@/server/functions/hydration'
import { getUserSettingsFn } from '@/server/functions/hydration'

export function HistoryCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Get user settings for daily goal
  const { data: settingsData } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettingsFn(),
  })

  const dailyGoal =
    settingsData?.settings?.dailyGoal ||
    settingsData?.defaults?.dailyGoal ||
    2000

  // Get history for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const { data: historyData } = useQuery({
    queryKey: ['intake-history', format(monthStart, 'yyyy-MM')],
    queryFn: () =>
      getIntakeHistoryFn({
        data: {
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
        },
      }),
  })

  // Get detailed data for selected date
  const { data: dayData, isLoading: dayLoading } = useQuery({
    queryKey: ['intake-day', selectedDate?.toISOString()],
    queryFn: () =>
      getIntakeByDateFn({
        data: { date: format(selectedDate!, 'yyyy-MM-dd') },
      }),
    enabled: !!selectedDate,
  })

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
  const firstDayOfWeek = monthStart.getDay()
  const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const getDayData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return historyData?.byDate?.[dateKey]
  }

  const getProgressColor = (total: number) => {
    const percentage = (total / dailyGoal) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-[#0EA5E9]'
    if (percentage >= 50) return 'bg-amber-500'
    if (percentage > 0) return 'bg-red-400'
    return 'bg-gray-200 dark:bg-white/10'
  }

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="text-[#8E9196] hover:text-[#1A1F2C] dark:hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-[#1A1F2C] dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={isSameMonth(currentMonth, new Date())}
          className="text-[#8E9196] hover:text-[#1A1F2C] dark:hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[#8E9196] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for padding */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dayInfo = getDayData(day)
          const hasData = dayInfo && dayInfo.total > 0
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const percentage = hasData
            ? Math.min((dayInfo.total / dailyGoal) * 100, 100)
            : 0

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => !isFuture(day) && setSelectedDate(day)}
              disabled={isFuture(day)}
              className={`
                                aspect-square rounded-xl p-1 flex flex-col items-center justify-center relative
                                transition-all
                                ${isToday(day) ? 'ring-2 ring-[#0EA5E9]' : ''}
                                ${isSelected ? 'bg-[#0EA5E9] text-white' : 'hover:bg-[#E5DEFF]/50 dark:hover:bg-white/5'}
                                ${isFuture(day) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                            `}
              whileHover={!isFuture(day) ? { scale: 1.05 } : {}}
              whileTap={!isFuture(day) ? { scale: 0.95 } : {}}
            >
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-[#1A1F2C] dark:text-white'
                }`}
              >
                {format(day, 'd')}
              </span>
              {/* Progress indicator */}
              <div
                className={`w-6 h-1.5 rounded-full mt-1 ${
                  isSelected
                    ? 'bg-white/50'
                    : getProgressColor(dayInfo?.total || 0)
                }`}
              >
                {hasData && !isSelected && (
                  <div
                    className={`h-full rounded-full ${getProgressColor(dayInfo.total)}`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#8E9196]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>100%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#0EA5E9]" />
          <span>75%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>50%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-400" />
          <span>&lt;50%</span>
        </div>
      </div>

      {/* Day detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0EA5E9]" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          {dayLoading ? (
            <div className="py-8 text-center text-[#8E9196]">Loading...</div>
          ) : dayData?.intakes.length === 0 ? (
            <div className="py-8 text-center">
              <Droplets className="w-12 h-12 mx-auto mb-3 text-[#8E9196]/30" />
              <p className="text-[#8E9196]">No water logged this day</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-gradient-to-r from-[#D3E4FD] to-[#E5DEFF] dark:from-[#0EA5E9]/20 dark:to-[#8B5CF6]/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E9196]">Total</p>
                    <p className="text-2xl font-bold text-[#1A1F2C] dark:text-white">
                      {dayData?.totalAmount || 0} ml
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#8E9196]">Goal</p>
                    <p className="text-lg font-semibold text-[#1A1F2C] dark:text-white">
                      {Math.round(
                        ((dayData?.totalAmount || 0) / dailyGoal) * 100,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Entries list */}
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {dayData?.intakes.map((intake) => (
                    <div
                      key={intake.$id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-[#E5DEFF] dark:border-white/10"
                    >
                      {intake.photoUrl ? (
                        <button
                          onClick={() => setSelectedPhoto(intake.photoUrl!)}
                          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#0EA5E9] transition-all"
                        >
                          <img
                            src={intake.photoUrl}
                            alt="Drink"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#D3E4FD] dark:bg-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                          <Droplets className="w-5 h-5 text-[#0EA5E9]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-[#1A1F2C] dark:text-white">
                          {intake.amount} {intake.unit}
                        </p>
                        <p className="text-xs text-[#8E9196]">
                          {format(new Date(intake.loggedAt), 'h:mm a')}
                        </p>
                      </div>
                      {intake.photoUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPhoto(intake.photoUrl!)}
                          className="text-[#8E9196] hover:text-[#0EA5E9]"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Full photo viewer */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Drink verification"
              className="w-full max-h-[80vh] object-contain bg-black"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
