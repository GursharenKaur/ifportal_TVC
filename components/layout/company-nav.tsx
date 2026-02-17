"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, LayoutDashboard, LogOut, Home, UserCircle, Building2, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function CompanyNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()
  const logout = useAuthStore((state) => state.logout)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/company/roles", label: "Roles", icon: Briefcase },
    { href: "/company/applicants", label: "Applicants", icon: Users },
    { href: "/company/profile", label: "Profile", icon: Building2 },
  ]

  const NavContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-10 relative z-10 transition-all duration-500">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center">
            <Image 
              src={theme === 'dark' ? "/TVC logo white.png" : "/TVC Logo Black.png"}
              alt="TVC Logo" 
              width={40} 
              height={40}
              className="h-8 w-8"
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tighter uppercase transition-colors">IF<span className="text-cyan-500 text-sm ml-1">Portal</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors">Company Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4 mt-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} className="block relative">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 h-12 rounded-xl transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-500 font-bold"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-500 rounded-r-full shadow-[4px_0_12px_rgba(6,182,212,0.5)]"
                  />
                )}
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-xs uppercase tracking-widest font-black">{label}</span>

                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-hsl(var(--sidebar-border)) space-y-6">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Interface Theme</span>
          <ThemeToggle />
        </div>

              <div className="px-2 py-3 bg-foreground/5 rounded-xl border border-border">
          <p className="text-[9px] font-medium text-muted-foreground text-center leading-relaxed">
            For queries contact: <span className="text-cyan-500 font-bold">Edc@thapar.edu</span>
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full h-12 justify-start gap-4 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all rounded-xl group"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Session</span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm border border-border"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <VisuallyHidden>
          <SheetContent side="left" className="w-80 p-0 bg-slate-900 text-white border-r border-slate-700">
            <NavContent />
          </SheetContent>
        </VisuallyHidden>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-background text-foreground border-r border-border flex flex-col relative overflow-hidden transition-colors duration-500 fixed left-0 top-0 h-screen z-40">
        <NavContent />
      </aside>
    </>
  )
}
