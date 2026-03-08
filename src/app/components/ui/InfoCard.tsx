interface InfoCardProps {
  label: string;
  value: string;
}

export function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="p-4 rounded-[12px] bg-[var(--bg-info-card)] flex-1 min-w-0">
      <p className="text-[13px] font-medium text-[var(--text-secondary)] mb-1">
        {label}
      </p>
      <p className="text-[20px] font-bold text-[var(--text-primary)] truncate">
        {value}
      </p>
    </div>
  );
}
