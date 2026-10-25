import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "outline" | "accent";
};

export function ActionButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: ActionButtonProps) {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
    outline: "border border-primary/20 text-heading hover:bg-secondary",
  }[variant];

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
