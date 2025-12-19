import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { CTASection } from '@/components/landing/CTASection'
import { FooterSection } from '@/components/landing/FooterSection'

export const Route = createFileRoute('/_public/')({
  component: Index,
  head: () => ({
    meta: [
      { title: 'Hydrop - Stay Hydrated, Stay Healthy' },
      {
        name: 'description',
        content:
          'Track your daily water intake with smart reminders, photo verification, and compete with friends. Build healthy hydration habits with Hydrop.',
      },
    ],
  }),
})

function Index() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
