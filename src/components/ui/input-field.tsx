import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
  as?: "input" | "select" | "textarea";
  children?: ReactNode;
};

type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> &
  SelectHTMLAttributes<HTMLSelectElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export function InputField({
  label,
  name,
  as = "input",
  children,
  className = "",
  ...props
}: InputFieldProps) {
  const shared =
    "mt-2 w-full rounded-[22px] border border-[rgba(139,94,60,0.14)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[rgba(43,43,43,0.38)] focus:border-[var(--color-secondary)] focus:shadow-[0_0_0_4px_rgba(127,191,154,0.14)]";

  return (
    <label
      htmlFor={name}
      className="block rounded-[28px] bg-[var(--color-background)]/90 p-5"
    >
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      {as === "select" ? (
        <select id={name} name={name} className={`${shared} ${className}`} {...props}>
          {children}
        </select>
      ) : null}
      {as === "textarea" ? (
        <textarea id={name} name={name} className={`${shared} resize-none ${className}`} {...props} />
      ) : null}
      {as === "input" ? (
        <input id={name} name={name} className={`${shared} ${className}`} {...props} />
      ) : null}
    </label>
  );
}
