"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  FileIcon as FileTransfer,
  FolderOpen,
  Database,
  FileText,
  Book,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavigationProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function SidebarNavigation({ isCollapsed, onToggle }: SidebarNavigationProps) {
  const pathname = usePathname()

  const navigationItems = [
    {
      title: "Project Management",
      items: [
        {
          href: "/projects",
          label: "Projects",
          icon: FolderOpen,
          description: "Project organization",
        },
        {
          href: "/contracts",
          label: "Data Contracts",
          icon: FileText,
          description: "Contract management",
        },
      ],
    },
    {
      title: "Data Management",
      items: [
        {
          href: "/data-mapping",
          label: "Data Mapping",
          icon: Brain,
          description: "AI-powered field mapping",
        },
        {
          href: "/transform",
          label: "Transformation",
          icon: FileTransfer,
          description: "Data transformation engine",
        },
        {
          href: "/ldq",
          label: "Data Queue",
          icon: Database,
          description: "File queue management",
        },
      ],
    },
    {
      title: "Process Management",
      items: [
        {
          href: "/dashboard",
          label: "Conversion Dashboard",
          icon: BarChart3,
          description: "Monitor runs and analytics",
        },
        {
          href: "/api-docs",
          label: "API Documentation",
          icon: Book,
          description: "API reference guide",
        },
        {
          href: "/api-dashboard",
          label: "API Monitor",
          icon: Activity,
          description: "API status monitoring",
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          href: "/users",
          label: "User Management",
          icon: Users,
          description: "Manage user accounts",
        },
        {
          href: "/settings",
          label: "System Settings",
          icon: Settings,
          description: "Configure system",
        },
      ],
    },
  ]

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-gray-100 px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-sm">
            E
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-gray-900">EPI-USE</div>
              <div className="text-xs text-gray-500">Data Platform</div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-900 border-r-2 border-blue-900"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-blue-900" : "text-gray-500 group-hover:text-gray-700",
                          )}
                        />
                        {!isCollapsed && (
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
              {!isCollapsed && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-100 p-4">
          <div className="text-xs text-gray-500 text-center">
            <div>EPI-USE Data Platform</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      )}
    </div>
  )
}
