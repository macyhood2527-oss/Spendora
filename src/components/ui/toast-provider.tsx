"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<Toast, "id">;

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const TOAST_DURATION_MS = 3600;

const toastStyles: Record<
  ToastTone,
  {
    icon: typeof CheckCircle2;
    iconClassName: string;
    badgeClassName: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-[var(--color-primary)]",
    badgeClassName: "bg-[rgba(127,191,154,0.14)]",
  },
  error: {
    icon: CircleAlert,
    iconClassName: "text-[#a15a4b]",
    badgeClassName: "bg-[rgba(161,90,75,0.12)]",
  },
  info: {
    icon: Info,
    iconClassName: "text-[var(--color-wood)]",
    badgeClassName: "bg-[rgba(200,162,124,0.16)]",
  },
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutIds = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutIds.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, tone }: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setToasts((current) => [...current, { id, title, description, tone }].slice(-4));

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);

      timeoutIds.current.set(id, timeoutId);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col gap-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm print-hidden">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = toastStyles[toast.tone].icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto overflow-hidden rounded-[24px] border border-white/75 bg-[rgba(255,255,255,0.94)] p-4 shadow-[0_20px_40px_rgba(139,94,60,0.12)] backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toastStyles[toast.tone].badgeClassName}`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={toastStyles[toast.tone].iconClassName}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {toast.title}
                    </p>
                    {toast.description ? (
                      <p className="mt-1 text-sm leading-6 text-[color:rgba(43,43,43,0.6)]">
                        {toast.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[color:rgba(43,43,43,0.42)] transition hover:bg-[rgba(43,43,43,0.05)] hover:text-[var(--color-text)]"
                    aria-label="Dismiss notification"
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
