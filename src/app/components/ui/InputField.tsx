interface InputFieldProps {
  value: string | number | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InputField({ value, onChange, placeholder, disabled, className = "" }: InputFieldProps) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full h-[48px] rounded-[12px] px-4
        text-[15px] text-[var(--text-primary)] font-medium
        outline-none transition-all duration-200
        ${disabled
          ? "bg-[var(--bg-input-disabled)] opacity-60 cursor-not-allowed"
          : "bg-[var(--bg-input)] focus:ring-2 focus:ring-[var(--accent-primary)]/30"
        }
        placeholder:text-[var(--text-tertiary)] placeholder:text-[15px]
        ${className}`}
    />
  );
}
