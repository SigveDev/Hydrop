import { motion } from 'motion/react'
import { Droplets, Bell, Moon, BarChart3, Camera, Trophy } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'Photo Verification',
    description:
      'Every drink requires a photo proof, keeping you accountable and honest about your intake.',
    color: '#0EA5E9',
    bgColor: '#D3E4FD',
    darkBgColor: 'rgba(14, 165, 233, 0.2)',
  },
  {
    icon: Trophy,
    title: 'Friend Competition',
    description:
      'Add friends and compete on daily and weekly leaderboards to stay motivated together.',
    color: '#F97316',
    bgColor: '#FEC6A1',
    darkBgColor: 'rgba(249, 115, 22, 0.2)',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description:
      'Get personalized notifications based on your daily goal and drinking pace.',
    color: '#8B5CF6',
    bgColor: '#E5DEFF',
    darkBgColor: 'rgba(139, 92, 246, 0.2)',
  },
  {
    icon: Moon,
    title: 'Quiet Hours',
    description:
      "Set custom quiet hours so you won't be disturbed during sleep or work.",
    color: '#6E59A5',
    bgColor: '#E5DEFF',
    darkBgColor: 'rgba(110, 89, 165, 0.2)',
  },
  {
    icon: BarChart3,
    title: 'History & Photos',
    description:
      'Browse your hydration history with all your verification photos organized by date.',
    color: '#0EA5E9',
    bgColor: '#D3E4FD',
    darkBgColor: 'rgba(14, 165, 233, 0.2)',
  },
  {
    icon: Droplets,
    title: 'Quick Logging',
    description:
      'Log your water intake with preset amounts or custom entries in seconds.',
    color: '#D946EF',
    bgColor: '#FFDEE2',
    darkBgColor: 'rgba(217, 70, 239, 0.2)',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-[#1A1F2C]">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] dark:text-white mb-4">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6]">
              {' '}
              Stay Hydrated
            </span>
          </h2>
          <p className="text-lg text-[#8E9196] max-w-2xl mx-auto">
            Hydrop combines powerful features with a beautiful interface to make
            drinking water a habit you'll actually enjoy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-2xl bg-[#F1F0FB]/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300 border border-transparent hover:border-[#E5DEFF] dark:hover:border-white/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: feature.bgColor }}
              >
                <feature.icon
                  className="w-7 h-7"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1F2C] dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-[#8E9196]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
