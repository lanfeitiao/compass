import { AppNav } from '@/components/nav/app-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b-[2.5px] border-brown bg-brown px-4 py-3 md:hidden">
        <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-gold">
          Compass
        </span>
      </header>
      <main className="pb-20 md:pb-0 md:pl-56">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
