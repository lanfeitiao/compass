import { AppNav } from '@/components/nav/app-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="pb-20 md:pb-0 md:pl-56">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
