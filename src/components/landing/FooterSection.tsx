import { Droplets } from 'lucide-react'

export function FooterSection() {
  return (
    <footer className="bg-[#1A1F2C] dark:bg-[#0f1218] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Hydrop</span>
          </div>

          <p className="text-[#8E9196] text-sm text-center">
            Stay hydrated, stay healthy. Track your water intake with ease.
          </p>

          <p className="text-[#8E9196] text-sm">
            © {new Date().getFullYear()} Hydrop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
