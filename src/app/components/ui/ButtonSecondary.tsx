"use client";

interface ButtonSecondaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ButtonSecondary({ children, onClick, disabled, className = "" }: ButtonSecondaryProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[48px] md:h-[52px] rounded-[12px]
        bg-[#EFF6FF] border border-[#BFDBFE]
        text-[#2563EB] font-semibold text-[16px]
        hover:bg-[#DBEAFE]
        active:bg-[#BFDBFE]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 cursor-pointer
        ${className}`}
    >
      {children}
    </button>
  );
}
