"use client";

import { Download, Menu, RefreshCw, Sprout, WifiOff } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { usePwa } from "@/components/pwa/pwa-provider";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { Sidebar } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const hasMounted = useHasMounted();
  const { applyUpdate, canInstall, isOffline, promptInstall, updateReady } = usePwa();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-[1600px]">
        <Sidebar
          collapsed={sidebarCollapsed}
          isMobileOpen={mobileSidebarOpen}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div
          className={`min-w-0 transition-[padding] duration-300 ${
            sidebarCollapsed ? "lg:pl-[112px]" : "lg:pl-[310px]"
          }`}
        >
          <div className="print-hidden mx-3 mt-3 space-y-3 sm:mx-4 sm:mt-4 lg:mx-6 lg:mt-5 lg:mr-8">
            {hasMounted && isOffline ? (
              <div className="rounded-[22px] border border-white/70 bg-[rgba(255,248,240,0.9)] px-4 py-3 text-sm text-[color:rgba(43,43,43,0.72)] shadow-[0_12px_30px_rgba(139,94,60,0.06)] backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(200,162,124,0.16)] text-[var(--color-wood)]">
                    <WifiOff size={16} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">You are offline</p>
                    <p className="mt-1 text-xs leading-5 text-[color:rgba(43,43,43,0.56)]">
                      Cached pages and your local expense data are still available.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {hasMounted && (canInstall || updateReady) ? (
              <div className="rounded-[22px] border border-white/70 bg-[rgba(255,255,255,0.88)] px-4 py-3 shadow-[0_12px_30px_rgba(139,94,60,0.06)] backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {updateReady ? "An updated version is ready" : "Install Spendora"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[color:rgba(43,43,43,0.56)]">
                      {updateReady
                        ? "Refresh into the latest cached version."
                        : "Add Spendora to your device for quicker access and better offline use."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={updateReady ? applyUpdate : () => void promptInstall()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(63,143,104,0.2)] hover:-translate-y-0.5 hover:bg-[#367b59]"
                  >
                    {updateReady ? (
                      <>
                        <RefreshCw size={15} strokeWidth={1.8} />
                        Refresh app
                      </>
                    ) : (
                      <>
                        <Download size={15} strokeWidth={1.8} />
                        Install
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <header className="cozy-surface print-hidden mx-3 mb-3 mt-3 flex items-center justify-between rounded-[24px] border border-white/70 px-4 py-3 shadow-[0_18px_45px_rgba(139,94,60,0.08)] sm:mx-4 sm:mb-4 sm:mt-4 sm:rounded-[28px] sm:px-5 sm:py-4 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_12px_22px_rgba(63,143,104,0.22)]">
                <Sprout size={18} strokeWidth={1.7} />
              </span>
              <div>
                <p className="font-display text-[1.75rem] leading-none text-[var(--color-text)] sm:text-3xl">
                  Spendora
                </p>
                <p className="mt-1 text-xs text-[color:rgba(43,43,43,0.56)]">
                  {pathname === "/" ? "Dashboard" : "Expense tracker"}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-[var(--color-primary)] shadow-[0_10px_20px_rgba(139,94,60,0.06)]"
              aria-label="Open sidebar"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </header>

          <main className="mx-3 mb-5 mt-4 sm:mx-4 sm:mb-6 sm:mt-5 lg:mx-6 lg:mb-8 lg:mr-8 lg:mt-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
