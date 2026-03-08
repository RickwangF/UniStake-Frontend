"use client";

interface ButtonPrimaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ButtonPrimary({ children, onClick, disabled, className = "" }: ButtonPrimaryProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[48px] md:h-[52px] rounded-[12px]
        bg-gradient-to-b from-[#3B82F6] to-[#2563EB]
        text-white font-semibold text-[16px]
        hover:from-[#2563EB] hover:to-[#1D4ED8]
        active:from-[#1D4ED8] active:to-[#1E40AF]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 cursor-pointer
        shadow-[0_2px_8px_rgba(59,130,246,0.3)]
        hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]
        ${className}`}
    >
      {children}
    </button>
  );
}
