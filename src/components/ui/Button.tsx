import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
};

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-200/40 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200/50",

    secondary:
      "border border-black/10 bg-white/70 text-neutral-900 shadow-sm hover:bg-white hover:shadow-md",

    ghost:
      "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950",

    dark:
      "bg-neutral-950 text-white shadow-lg shadow-black/10 hover:bg-neutral-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      {...props}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-full
        font-medium
        transition-all
        duration-200
        active:scale-[0.98]
        disabled:pointer-events-none
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;