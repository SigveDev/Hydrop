import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import { Droplets, Bell, Target, ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#D3E4FD] via-white to-[#E5DEFF] dark:from-[#1A1F2C] dark:via-[#221F26] dark:to-[#1A1F2C]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#0EA5E9]/20 dark:bg-[#0EA5E9]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#8B5CF6]/20 dark:bg-[#8B5CF6]/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5DEFF] dark:bg-[#8B5CF6]/20 rounded-full mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Droplets className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-sm font-medium text-[#6E59A5] dark:text-[#D6BCFA]">
                Your Personal Hydration Companion
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1F2C] dark:text-white mb-6 leading-tight">
              Stay Hydrated,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6]">
                Stay Healthy
              </span>
            </h1>

            <p className="text-lg text-[#8E9196] mb-8 max-w-lg mx-auto lg:mx-0">
              Track your daily water intake with photo verification, compete
              with friends on the leaderboard, and build healthy hydration
              habits with smart reminders and quiet hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#0EA5E9]/30 group"
                >
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg rounded-xl border-2 border-[#E5DEFF] dark:border-white/20 hover:bg-[#E5DEFF]/30 dark:hover:bg-white/5 text-[#1A1F2C] dark:text-white"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 mt-12 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '1M+', label: 'Glasses Logged' },
                { value: '4.9', label: 'App Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-[#1A1F2C] dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#8E9196]">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content - Phone mockup */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="w-72 h-[580px] bg-[#1A1F2C] rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-[#D3E4FD] to-[#E5DEFF] rounded-[2.5rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="flex justify-center pt-3">
                    <div className="w-24 h-6 bg-[#1A1F2C] rounded-full" />
                  </div>

                  {/* App content preview */}
                  <div className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <p className="text-sm text-[#8E9196]">Today's Progress</p>
                      <p className="text-3xl font-bold text-[#1A1F2C]">
                        1,500 ml
                      </p>
                    </div>

                    {/* Water glass visualization */}
                    <div className="relative w-32 h-44 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-[#0EA5E9]/30 rounded-b-[2rem] rounded-t-xl bg-white/50">
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0EA5E9] to-[#7DD3FC] rounded-b-[1.5rem]"
                          initial={{ height: '0%' }}
                          animate={{ height: '75%' }}
                          transition={{
                            duration: 2,
                            delay: 0.5,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white rounded-xl px-2 py-1 shadow-lg">
                        <span className="text-lg font-bold text-[#0EA5E9]">
                          75%
                        </span>
                      </div>
                    </div>

                    {/* Quick add buttons preview */}
                    <div className="flex gap-2 justify-center">
                      {['150ml', '250ml', '500ml'].map((amount) => (
                        <div
                          key={amount}
                          className="px-3 py-2 bg-white rounded-xl text-sm font-medium text-[#1A1F2C] shadow-sm"
                        >
                          {amount}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating feature cards */}
              <motion.div
                className="absolute -left-16 top-20 bg-white dark:bg-[#1A1F2C] rounded-2xl p-4 shadow-xl hidden md:flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.6 },
                  x: { duration: 0.5, delay: 0.6 },
                  y: { duration: 3, repeat: Infinity, delay: 1.1 },
                }}
              >
                <div className="w-10 h-10 bg-[#0EA5E9]/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#0EA5E9]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1F2C] dark:text-white">
                    Smart Reminders
                  </p>
                  <p className="text-xs text-[#8E9196]">
                    Never forget to drink
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-12 bottom-32 bg-white dark:bg-[#1A1F2C] rounded-2xl p-4 shadow-xl hidden md:flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.8 },
                  x: { duration: 0.5, delay: 0.8 },
                  y: { duration: 3, repeat: Infinity, delay: 1.3 },
                }}
              >
                <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1F2C] dark:text-white">
                    Daily Goals
                  </p>
                  <p className="text-xs text-[#8E9196]">Personalized targets</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
