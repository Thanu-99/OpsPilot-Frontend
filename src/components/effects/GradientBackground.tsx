type GradientBackgroundProps = {
  children: React.ReactNode;
  className?: string;
};

function GradientBackground({
  children,
  className = "",
}: GradientBackgroundProps) {
  return (
    <div
      className={`
        relative
        isolate
        overflow-hidden
        ${className}
      `}
    >
      {/* Ambient glow */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          -z-10
          h-[600px]
          w-[900px]
          -translate-x-1/2
          rounded-full
          bg-violet-200/30
          blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/3
          -z-10
          h-[450px]
          w-[450px]
          rounded-full
          bg-indigo-200/20
          blur-[110px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-40
          bottom-0
          -z-10
          h-[400px]
          w-[400px]
          rounded-full
          bg-blue-100/30
          blur-[100px]
        "
      />

      {/* Very subtle grid */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          opacity-[0.035]
          [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      {children}
    </div>
  );
}

export default GradientBackground;
