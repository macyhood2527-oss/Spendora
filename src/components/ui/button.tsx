import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white shadow-[0_14px_28px_rgba(63,143,104,0.24)] hover:-translate-y-0.5 hover:bg-[#367b59]"
      : "bg-[var(--color-background)] text-[var(--color-text)] hover:-translate-y-0.5 hover:bg-white";

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
