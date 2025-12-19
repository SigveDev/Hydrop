import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { format } from 'date-fns'
import { Droplets, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WaterIntake } from '@/server/lib/appwrite.types'

interface IntakeWithPhoto extends WaterIntake {
  photoUrl?: string | null
}

interface IntakeHistoryProps {
  intakes: IntakeWithPhoto[]
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function IntakeHistory({
  intakes,
  onDelete,
  isLoading,
}: IntakeHistoryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string
    amount: number
    time: string
  } | null>(null)

  if (intakes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D3E4FD] dark:bg-[#0EA5E9]/20 flex items-center justify-center">
          <Droplets className="w-8 h-8 text-[#0EA5E9]" />
        </div>
        <p className="text-[#8E9196]">No water logged today yet</p>
        <p className="text-sm text-[#8E9196]/70">
          Start by adding your first drink!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[#1A1F2C] dark:text-white mb-4">
        Today's Log
      </h3>

      <ScrollArea className="h-[300px] pr-4">
        <AnimatePresence mode="popLayout">
          {intakes.map((intake, index) => (
            <motion.div
              key={intake.$id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 mb-2 bg-white dark:bg-white/5 rounded-xl border border-[#E5DEFF] dark:border-white/10 hover:shadow-md dark:hover:shadow-black/20 transition-shadow group"
            >
              <div className="flex items-center gap-3">
                {/* Photo thumbnail */}
                {intake.photoUrl ? (
                  <button
                    onClick={() =>
                      setSelectedPhoto({
                        url: intake.photoUrl!,
                        amount: intake.amount,
                        time: format(new Date(intake.loggedAt), 'h:mm a'),
                      })
                    }
                    className="w-12 h-12 rounded-xl overflow-hidden bg-[#D3E4FD] dark:bg-[#0EA5E9]/20 flex-shrink-0 hover:ring-2 hover:ring-[#0EA5E9] transition-all"
                  >
                    <img
                      src={intake.photoUrl}
                      alt="Drink"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D3E4FD] to-[#E5DEFF] dark:from-[#0EA5E9]/20 dark:to-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-5 h-5 text-[#0EA5E9]" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[#1A1F2C] dark:text-white">
                    {intake.amount} {intake.unit}
                  </p>
                  <p className="text-xs text-[#8E9196]">
                    {format(new Date(intake.loggedAt), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {intake.photoUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8E9196] hover:text-[#0EA5E9] hover:bg-[#D3E4FD]/50 dark:hover:bg-[#0EA5E9]/10"
                    onClick={() =>
                      setSelectedPhoto({
                        url: intake.photoUrl!,
                        amount: intake.amount,
                        time: format(new Date(intake.loggedAt), 'h:mm a'),
                      })
                    }
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8E9196] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={() => onDelete(intake.$id)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-[#E5DEFF] dark:border-white/10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#8E9196]">Total entries today</span>
          <span className="font-semibold text-[#1A1F2C] dark:text-white">
            {intakes.length}
          </span>
        </div>
      </div>

      {/* Photo viewer dialog */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-[#E5DEFF] dark:border-white/10">
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-[#0EA5E9]" />
              {selectedPhoto?.amount} ml at {selectedPhoto?.time}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt="Drink verification"
                className="w-full max-h-[60vh] object-contain bg-black"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
