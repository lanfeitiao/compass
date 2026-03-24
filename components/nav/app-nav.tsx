'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', color: 'text-terracotta', strokeColor: 'stroke-terracotta' },
  { href: '/journal', label: 'Journal', color: 'text-olive', strokeColor: 'stroke-olive' },
  { href: '/goals', label: 'Goals', color: 'text-navy', strokeColor: 'stroke-navy' },
  { href: '/chapters', label: 'Chapters', color: 'text-gold', strokeColor: 'stroke-gold' },
] as const

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M4 16L16 5L28 16" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M7 14V27H13V20H19V27H25V14" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </svg>
  )
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="6" y="4" width="20" height="24" stroke="currentColor" strokeWidth="3" />
      <line x1="11" y1="11" x2="21" y2="11" stroke="currentColor" strokeWidth="2.5" />
      <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2.5" />
      <line x1="11" y1="21" x2="17" y2="21" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

function GoalsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" />
      <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  )
}

function ChaptersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <line x1="8" y1="4" x2="8" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M8 5H24L19 11L24 17H8" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" fill="none" />
    </svg>
  )
}

const icons = { '/': HomeIcon, '/journal': JournalIcon, '/goals': GoalsIcon, '/chapters': ChaptersIcon } as const

export function AppNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-[2.5px] border-brown bg-cream md:hidden">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = icons[item.href as keyof typeof icons]
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 transition-colors',
                    active ? item.color : 'text-brown hover:text-brown/70'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[7px] font-extrabold uppercase tracking-[1px]">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 border-r-[2.5px] border-brown bg-brown md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center px-6">
            <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-gold">
              Compass
            </span>
          </div>
          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = icons[item.href as keyof typeof icons]
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-[11px] font-bold uppercase tracking-[1.5px] transition-colors',
                        active
                          ? item.color
                          : 'text-cream hover:text-cream/70'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
