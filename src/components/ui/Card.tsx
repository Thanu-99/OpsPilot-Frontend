import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-black/[0.06]
        bg-white/75
        shadow-[0_12px_40px_rgba(0,0,0,0.04)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-black/[0.09]
        hover:shadow-[0_18px_50px_rgba(0,0,0,0.06)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;