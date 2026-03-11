"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CircleHelp,
  Info,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Settings2,
  Sprout,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-expense", label: "Add Expense", icon: PlusCircle },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export const mobilePrimaryNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/add-expense", label: "Add", icon: PlusCircle },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

const infoItems = [
  {
    href: "/about",
    label: "About",
    icon: Info,
  },
  {
    href: "/faqs",
    label: "FAQs",
    icon: CircleHelp,
  },
] as const;

type SidebarProps = {
  collapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

export function Sidebar({
  collapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      <div className="print-hidden fixed inset-y-0 left-0 z-30 hidden lg:block">
        <aside
          className={`relative h-full border-r border-white/70 bg-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_rgba(139,94,60,0.06)] backdrop-blur transition-[width] duration-300 ${
            collapsed ? "w-[88px]" : "w-[286px]"
          }`}
        >
          <SidebarContent
            collapsed={collapsed}
            isMobile={false}
            onClose={onCloseMobile}
          />
        </aside>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute left-full top-8 -ml-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[rgba(250,250,247,0.96)] shadow-[0_10px_20px_rgba(139,94,60,0.08)] hover:bg-white"
        >
          {collapsed ? (
            <ChevronRight
              size={18}
              strokeWidth={1.5}
              className="text-[var(--color-primary)]/80"
            />
          ) : (
            <ChevronLeft
              size={18}
              strokeWidth={1.5}
              className="text-[var(--color-primary)]/80"
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="print-hidden fixed inset-0 z-40 bg-[rgba(43,43,43,0.24)] lg:hidden"
            onClick={onCloseMobile}
          >
            <motion.aside
              initial={{ x: -28, opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -22, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-[min(86vw,320px)] border-r border-white/70 bg-[rgba(255,255,255,0.97)] shadow-[0_24px_55px_rgba(139,94,60,0.12)] backdrop-blur"
              onClick={(event) => event.stopPropagation()}
            >
              <SidebarContent
                collapsed={false}
                isMobile
                onClose={onCloseMobile}
              />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
};

function SidebarContent({
  collapsed,
  isMobile,
  onClose,
}: SidebarContentProps) {
  const pathname = usePathname();
  const activeItem = useMemo(
    () => navItems.find((item) => item.href === pathname),
    [pathname],
  );

  return (
    <div
      className={`flex h-full flex-col ${collapsed && !isMobile ? "px-3 py-5" : "px-4 py-6"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[22px] bg-[var(--color-primary)] text-white shadow-[0_14px_26px_rgba(63,143,104,0.22)]">
            <Sprout size={20} strokeWidth={1.7} />
          </span>
          {!collapsed || isMobile ? (
            <div className="min-w-0">
              <p className="font-display text-3xl leading-none text-[var(--color-text)]">
                Spendora
              </p>
              <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.55)]">
                Calm expense control
              </p>
            </div>
          ) : null}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(250,250,247,0.95)] hover:bg-white"
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={1.5} className="text-[var(--color-primary)]/80" />
          </button>
        ) : null}
      </div>

      <nav className="mt-6 space-y-2 sm:mt-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed && !isMobile ? item.label : undefined}
              className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium ${
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-[0_14px_26px_rgba(63,143,104,0.18)]"
                  : "text-[var(--color-text)] hover:bg-white/78"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={1.5}
                className={isActive ? "text-white" : "text-[var(--color-primary)]/75"}
              />
              {!collapsed || isMobile ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {!collapsed || isMobile ? (
          <>
            <div className="rounded-[24px] border border-white/70 bg-white/68 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                Current View
              </p>
              <p className="mt-2 text-sm text-[var(--color-text)]">
                {activeItem?.label ?? "Spendora"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[color:rgba(43,43,43,0.52)]">
                Settings and category management are now separated into the Settings page.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/68 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:rgba(43,43,43,0.44)]">
                Quiet corners
              </p>
              <div className="mt-3 space-y-2">
                {infoItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2 rounded-[16px] px-3 py-2 text-xs font-medium ${
                        isActive
                          ? "bg-[rgba(127,191,154,0.18)] text-[var(--color-primary)]"
                          : "bg-[rgba(250,250,247,0.95)] text-[color:rgba(43,43,43,0.62)] hover:bg-white"
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.7} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="rounded-2xl bg-[rgba(250,250,247,0.95)] px-3 py-2 text-xs font-medium text-[var(--color-primary)]/80">
                {activeItem?.label?.slice(0, 3) ?? "App"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {infoItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={item.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      pathname === item.href
                        ? "bg-[rgba(127,191,154,0.18)] text-[var(--color-primary)]"
                        : "bg-[rgba(250,250,247,0.95)] text-[color:rgba(43,43,43,0.6)] hover:bg-white"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.7} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
