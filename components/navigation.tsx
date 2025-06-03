"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Brain, FileIcon as FileTransfer, Database, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Data Mapping", href: "/data-mapping", icon: Brain },
  { name: "Transform", href: "/transform", icon: FileTransfer },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Local Data Queue", href: "/ldq", icon: Database },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">EPI-USE</span>
              <span className="text-xs text-slate-600">Data Platform</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-100 text-blue-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col space-y-4 mt-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-blue-100 text-blue-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
