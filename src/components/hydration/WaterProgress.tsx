import { motion } from 'motion/react'
import { Droplets } from 'lucide-react'

interface WaterProgressProps {
  currentAmount: number
  goalAmount: number
  unit: string
  percentage: number
}

export function WaterProgress({
  currentAmount,
  goalAmount,
  unit,
  percentage,
}: WaterProgressProps) {
  const clampedPercentage = Math.min(percentage, 100)

  return (
    <div className="flex flex-col items-center">
      {/* Main water container */}
      <div className="relative w-48 h-64 mb-6">
        {/* Glass outline */}
        <div className="absolute inset-0 border-4 border-[#0EA5E9]/30 dark:border-[#0EA5E9]/40 rounded-b-[3rem] rounded-t-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          {/* Water fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0EA5E9] via-[#38BDF8] to-[#7DD3FC]"
            initial={{ height: '0%' }}
            animate={{ height: `${clampedPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Wave effect */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-4"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                borderRadius: '50% 50% 0 0',
              }}
              animate={{
                scaleX: [1, 1.02, 1],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Bubbles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '10%',
                }}
                animate={{
                  y: [0, -100],
                  opacity: [0.6, 0],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Percentage badge */}
        <motion.div
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-[#1A1F2C] rounded-2xl px-3 py-2 shadow-lg border border-[#E5DEFF] dark:border-white/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-2xl font-bold text-[#0EA5E9]">
            {clampedPercentage}%
          </span>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Droplets className="w-6 h-6 text-[#0EA5E9]" />
          <span className="text-4xl font-bold text-[#1A1F2C] dark:text-white">
            {currentAmount.toLocaleString()}
          </span>
          <span className="text-xl text-[#8E9196]">{unit}</span>
        </div>
        <p className="text-[#8E9196]">
          of {goalAmount.toLocaleString()} {unit} daily goal
        </p>
      </motion.div>

      {/* Motivational message */}
      <motion.div
        className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#D3E4FD] to-[#E5DEFF] dark:from-[#0EA5E9]/20 dark:to-[#8B5CF6]/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm font-medium text-[#6E59A5] dark:text-[#D6BCFA]">
          {percentage >= 100
            ? '🎉 Goal achieved! Great job!'
            : percentage >= 75
              ? '💪 Almost there! Keep going!'
              : percentage >= 50
                ? '👍 Halfway there!'
                : percentage >= 25
                  ? '💧 Good start! Keep drinking!'
                  : "🌊 Let's get hydrated!"}
        </p>
      </motion.div>
    </div>
  )
}
