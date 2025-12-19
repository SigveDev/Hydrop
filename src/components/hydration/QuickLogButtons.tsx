import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Droplets, Coffee, GlassWater, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { PhotoCapture } from './PhotoCapture'

interface QuickLogButtonsProps {
  onLog: (amount: number, photoBase64: string) => Promise<void>
  unit: string
  isLoading?: boolean
}

const presets = [
  { amount: 150, label: 'Small', icon: Coffee },
  { amount: 250, label: 'Glass', icon: GlassWater },
  { amount: 500, label: 'Bottle', icon: Droplets },
]

export function QuickLogButtons({
  onLog,
  unit,
  isLoading,
}: QuickLogButtonsProps) {
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)

  const handlePresetClick = (amount: number) => {
    setPendingAmount(amount)
    setShowCamera(true)
  }

  const handleCustomLog = () => {
    const amount = parseInt(customAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (amount > 5000) {
      toast.error('Maximum 5000ml per entry')
      return
    }
    setPendingAmount(amount)
    setShowCamera(true)
  }

  const handlePhotoCapture = async (photoBase64: string) => {
    if (pendingAmount === null) return

    try {
      await onLog(pendingAmount, photoBase64)
      toast.success(`Added ${pendingAmount} ${unit}!`, {
        icon: '💧',
      })
      setCustomAmount('')
      setShowCustom(false)
    } catch {
      toast.error('Failed to log intake')
    } finally {
      setPendingAmount(null)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[#1A1F2C] dark:text-white mb-2 text-center">
        Quick Add
      </h3>
      <p className="text-xs text-[#8E9196] text-center mb-4">
        <Camera className="w-3 h-3 inline mr-1" />
        Photo required for verification
      </p>

      {/* Preset buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {presets.map((preset, index) => (
          <motion.div
            key={preset.amount}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2 border-2 border-[#D3E4FD] dark:border-[#0EA5E9]/30 hover:border-[#0EA5E9] hover:bg-[#D3E4FD]/30 dark:hover:bg-[#0EA5E9]/10 transition-all group bg-transparent"
              onClick={() => handlePresetClick(preset.amount)}
              disabled={isLoading}
            >
              <div className="w-10 h-10 rounded-xl bg-[#D3E4FD] dark:bg-[#0EA5E9]/20 group-hover:bg-[#0EA5E9]/20 dark:group-hover:bg-[#0EA5E9]/30 flex items-center justify-center transition-colors">
                <preset.icon className="w-5 h-5 text-[#0EA5E9]" />
              </div>
              <span className="text-lg font-bold text-[#1A1F2C] dark:text-white">
                {preset.amount}
              </span>
              <span className="text-xs text-[#8E9196]">{preset.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Custom amount */}
      {showCustom ? (
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Input
            type="number"
            placeholder={`Amount in ${unit}`}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 bg-white dark:bg-white/5 border-[#E5DEFF] dark:border-white/10"
            min={1}
            max={5000}
          />
          <Button
            onClick={handleCustomLog}
            disabled={isLoading || !customAmount}
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
          >
            <Camera className="w-4 h-4 mr-1" />
            Add
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setShowCustom(false)
              setCustomAmount('')
            }}
            className="text-[#8E9196] hover:text-[#1A1F2C] dark:hover:text-white"
          >
            Cancel
          </Button>
        </motion.div>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed border-2 border-[#8E9196]/30 dark:border-white/20 hover:border-[#0EA5E9] text-[#8E9196] hover:text-[#0EA5E9] bg-transparent"
          onClick={() => setShowCustom(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Custom Amount
        </Button>
      )}

      {/* Photo capture modal */}
      <PhotoCapture
        open={showCamera}
        onClose={() => {
          setShowCamera(false)
          setPendingAmount(null)
        }}
        onCapture={handlePhotoCapture}
      />
    </div>
  )
}
