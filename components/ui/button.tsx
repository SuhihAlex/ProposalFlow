import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "default" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-strong)]",
  secondary: "border bg-white text-[var(--foreground)] shadow-sm hover:bg-[var(--surface-muted)]",
  ghost: "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
  outline: "border border-[var(--border-strong)] bg-transparent hover:bg-white",
  danger: "bg-[var(--danger)] text-white hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  default: "h-11 px-4",
  lg: "h-12 px-5 text-[15px]",
  icon: "size-10",
};

export function buttonClassName({ variant = "default", size = "default", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ asChild = false, variant = "default", size = "default", className, children, ...props }: ButtonProps) {
  const styles = buttonClassName({ variant, size, className });

  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, { className: cn(children.props.className, styles) });
  }

  return <button className={styles} {...props}>{children}</button>;
}
