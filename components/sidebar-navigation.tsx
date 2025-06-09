"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
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
  ChevronDown,
  Settings,
  Users,
  Activity,
  Briefcase,
  HardDrive,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavigationProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function SidebarNavigation({ isCollapsed, onToggle }: SidebarNavigationProps) {
  const pathname = usePathname()

  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (sectionTitle: string) => {
    if (isCollapsed) return
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle)
  }

  const navigationItems = [
    {
      title: "Project",
      icon: Briefcase,
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
      icon: HardDrive,
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
      icon: Activity,
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
      icon: Shield,
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img
              src="https://media.licdn.com/dms/image/v2/D4D0BAQFiA30oLk4j6Q/company-logo_200_200/B4DZUEzffZHkAQ-/0/1739542362935/altrix_one_logo?e=1755129600&v=beta&t=WsAu4slspqFrs5M6YFE08EJTKPUcMyy2SOaBPWBrojw"
              alt="Cohenix Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-gray-900">Cohenix</div>
              <div className="text-xs text-gray-500">Data Platform</div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-2">
          {navigationItems.map((section) => {
            const SectionIcon = section.icon
            const isExpanded = expandedSection === section.title
            const hasActiveChild = section.items.some((item) => pathname === item.href)

            return (
              <div key={section.title} className="space-y-1">
                {/* Top-level Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "flex items-center w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200",
                    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
                    isCollapsed ? "justify-center" : "justify-between",
                    hasActiveChild ? "bg-blue-50 text-blue-900" : "text-gray-700",
                  )}
                  title={isCollapsed ? section.title : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <SectionIcon
                      className={cn("h-5 w-5 shrink-0", hasActiveChild ? "text-blue-600" : "text-gray-500")}
                    />
                    {!isCollapsed && <span className="text-sm font-medium">{section.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-gray-400 transition-transform duration-200",
                        isExpanded ? "rotate-180" : "",
                      )}
                    />
                  )}
                </button>

                {/* Sub-items */}
                {!isCollapsed && isExpanded && (
                  <div className="ml-2 space-y-1 border-l-2 border-gray-100 pl-4">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              "group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200",
                              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
                              isActive ? "bg-blue-100 text-blue-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600",
                              )}
                            />
                            <div className="ml-3 flex-1 min-w-0">
                              <div
                                className={cn(
                                  "text-sm font-medium truncate",
                                  isActive ? "text-blue-900" : "text-gray-700",
                                )}
                              >
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{item.description}</div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Collapsed state tooltip items */}
                {isCollapsed && (
                  <div className="hidden group-hover:block absolute left-16 top-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48">
                    <div className="text-sm font-medium text-gray-900 mb-2">{section.title}</div>
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div className="flex items-center px-2 py-1 rounded hover:bg-gray-50 text-sm text-gray-700">
                          <item.icon className="h-4 w-4 mr-2 text-gray-400" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-100 p-4">
          <div className="text-xs text-gray-500 text-center">
            <div className="font-medium">Cohenix Data Platform</div>
            <div className="mt-1">Version 1.0.0</div>
          </div>
        </div>
      )}
    </div>
  )
}
