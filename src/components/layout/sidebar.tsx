/**
 * Sidebar Component
 * Main navigation sidebar with role-based menu visibility
 * Collapsible on desktop, sheet on mobile
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Database,
  Settings,
  ChevronDown,
  ChevronRight,
  Sun,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Map icon names to Lucide icon components */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Database,
  Settings,
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

/**
 * Sidebar — responsive navigation with role-based visibility
 * Shows full labels when expanded, icons-only when collapsed
 */
export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  /** Toggle submenu group open/close */
  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  /** Check if a nav item is accessible by current user role */
  const hasAccess = (roles: readonly string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /** Check if a path is active (current route) */
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sm text-sidebar-foreground tracking-tight">
              PLTS Tracker
            </span>
            <span className="text-[10px] text-muted-foreground">
              Supply Management
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (!hasAccess(item.roles)) return null;

          const IconComponent = ICON_MAP[item.icon] || Sun;
          const hasChildren = "children" in item && item.children;
          const isGroupOpen = openGroups.includes(item.title);
          const isItemActive = "href" in item && item.href ? isActive(item.href as string) : false;
          const isChildActive =
            hasChildren &&
            item.children?.some((child) =>
              child.href ? isActive(child.href) : false
            );

          // Single nav item (no children)
          if (!hasChildren && "href" in item && item.href) {
            const linkContent = (
              <Link
                href={item.href as string}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isItemActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70"
                )}
              >
                <IconComponent className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger render={linkContent} />
                  <TooltipContent side="right" sideOffset={8}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.title}>{linkContent}</div>;
          }

          // Group with children
          return (
            <div key={item.title}>
              <button
                onClick={() => toggleGroup(item.title)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isChildActive
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                <IconComponent className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {isGroupOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {!collapsed && isGroupOpen && hasChildren && (
                <div className="ml-4 pl-4 mt-1 space-y-0.5 border-l border-sidebar-border/50">
                  {item.children?.map((child) => {
                    if (!hasAccess(child.roles)) return null;
                    if (!child.href) return null;
                    const isSubActive = isActive(child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center py-2 px-3 rounded-md text-sm transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isSubActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/60"
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto border-t border-sidebar-border p-2 space-y-1">
        <button
          onClick={() => {
            if (confirm("Apakah Anda yakin ingin logout?")) {
              logout();
              window.location.href = "/login";
            }
          }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          )}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <div className="px-2 py-2">
            <p className="text-[10px] text-muted-foreground text-center">
              PLTS Tracker v1.0.0
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
