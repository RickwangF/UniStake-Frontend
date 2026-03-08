"use client";

import { ButtonPrimary } from "@/app/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/app/components/ui/ButtonSecondary";
import { InputField } from "@/app/components/ui/InputField";

interface StakeCardProps {
  stakeAmount: string;
  inputAmount: number | null;
  onInputChange: (v: number | null) => void;
  onStake: () => void;
  onClaim: () => void;
  isConnected: boolean;
}

export function StakeCard({
  stakeAmount,
  inputAmount,
  onInputChange,
  onStake,
  onClaim,
  isConnected,
}: StakeCardProps) {
  const handleInputChange = (value: string) => {
    const numericValue = parseFloat(value);
    onInputChange(isNaN(numericValue) ? null : numericValue);
  };

  if (!isConnected) {
    return (
      <GlassCard width="md:w-[480px]">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-info-card)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] text-[16px] font-medium">
            Connect your wallet to start staking
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard width="md:w-[480px]">
      {/* Staked Amount */}
      <div className="mb-5 md:mb-6">
        <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-1">
          Staked Amount
        </p>
        <p className="text-[24px] md:text-[28px] font-bold text-[var(--text-primary)]">
          {stakeAmount || "0"} <span className="text-[18px] md:text-[20px] font-semibold text-[var(--text-secondary)]">ETH</span>
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border-light)] mb-5 md:mb-6" />

      {/* Input Area */}
      <div className="mb-5 md:mb-6">
        <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-2">
          Amount to Stake
        </p>
        <InputField
          value={inputAmount}
          onChange={handleInputChange}
          placeholder="Enter ETH amount"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-[10px] md:gap-[12px]">
        <ButtonPrimary onClick={onStake}>Stake</ButtonPrimary>
        <ButtonSecondary onClick={onClaim}>Claim</ButtonSecondary>
      </div>
    </GlassCard>
  );
}

function GlassCard({ children, width = "" }: { children: React.ReactNode; width?: string }) {
  return (
    <div
      className={`rounded-[20px] md:rounded-[24px] p-px
        bg-gradient-to-br from-[#3B82F6]/25 via-[#93C5FD]/20 to-[#06B6D4]/20
        w-full ${width}`}
    >
      <div
        className="rounded-[20px] md:rounded-[24px] bg-white/80 backdrop-blur-xl
          shadow-[0_8px_40px_rgba(59,130,246,0.1)]
          p-6 md:p-8"
      >
        {children}
      </div>
    </div>
  );
}
