import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Droplets, ArrowLeft, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HistoryCalendar } from '@/components/hydration/HistoryCalendar'
import { useTheme } from 'next-themes'

export const Route = createFileRoute('/_protected/history')({
  component: HistoryPage,
  head: () => ({
    meta: [{ title: 'History - Hydrop' }],
  }),
})

function HistoryPage() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3E4FD] via-white to-[#E5DEFF] dark:from-[#1A1F2C] dark:via-[#221F26] dark:to-[#1A1F2C]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1A1F2C]/80 backdrop-blur-md border-b border-[#E5DEFF] dark:border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#8E9196] hover:text-[#1A1F2C] dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#1A1F2C] dark:text-white">
                  Hydrop
                </span>
              </div>
            </div>

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-[#1A1F2C] dark:text-white mb-1">
              Hydration History
            </h1>
            <p className="text-[#8E9196]">
              View your past water intake and photos
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-[#1A1F2C]/80 rounded-3xl p-6 shadow-lg shadow-[#8B5CF6]/10 dark:shadow-black/20 border border-transparent dark:border-white/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <HistoryCalendar />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
