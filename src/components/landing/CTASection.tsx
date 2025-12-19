import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import { Droplets, ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Droplets className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Hydration Habits?
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-10">
            Join thousands of users who compete with friends, verify their
            drinks with photos, and stay accountable. Start your journey today —
            it's completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button
                size="lg"
                className="bg-white text-[#0EA5E9] hover:bg-white/90 px-8 py-6 text-lg rounded-xl shadow-lg group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <p className="text-white/60 text-sm mt-6">
            No credit card required • Free forever
          </p>
        </motion.div>
      </div>
    </section>
  )
}
