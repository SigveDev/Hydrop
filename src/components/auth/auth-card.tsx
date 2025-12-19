import * as React from 'react'
import { motion } from 'motion/react'
import { Droplets } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#D3E4FD] via-white to-[#E5DEFF] dark:from-[#1A1F2C] dark:via-[#221F26] dark:to-[#1A1F2C] p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-[#0EA5E9]/20 dark:bg-[#0EA5E9]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8B5CF6]/20 dark:bg-[#8B5CF6]/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Floating bubbles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-[#0EA5E9]/30 dark:bg-[#0EA5E9]/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '-20px',
            }}
            animate={{
              y: [0, -400 - i * 50],
              opacity: [0.6, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#0EA5E9]/30 group-hover:shadow-[#0EA5E9]/50 transition-shadow">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] bg-clip-text text-transparent">
              Hydrop
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white/80 dark:bg-[#1A1F2C]/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#0EA5E9]/10 dark:shadow-black/30 border border-white/50 dark:border-white/10 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#0EA5E9] via-[#8B5CF6] to-[#D946EF]" />

          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1A1F2C] dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-[#8E9196] dark:text-[#8E9196]">
                {description}
              </p>
            </div>

            {children}
          </div>
        </motion.div>

        {/* Footer text */}
        <motion.p
          className="text-center text-sm text-[#8E9196] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Stay hydrated, stay healthy 💧
        </motion.p>
      </motion.div>
    </div>
  )
}
