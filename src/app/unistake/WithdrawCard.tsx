"use client";

import { ButtonPrimary } from "@/app/components/ui/ButtonPrimary";
import { InputField } from "@/app/components/ui/InputField";
import { InfoCard } from "@/app/components/ui/InfoCard";

interface WithdrawCardProps {
  stakeAmount: string;
  availableWithdrawAmount: string;
  pendingWithdrawAmount: string;
  unstakeInputAmount: string | null;
  onUnstakeInputChange: (v: string | null) => void;
  onUnstake: () => void;
  onWithdraw: () => void;
  isConnected: boolean;
}

export function WithdrawCard({
  stakeAmount,
  availableWithdrawAmount,
  pendingWithdrawAmount,
  unstakeInputAmount,
  onUnstakeInputChange,
  onUnstake,
  onWithdraw,
  isConnected,
}: WithdrawCardProps) {
  if (!isConnected) {
    return (
      <GlassCard width="md:w-[560px]">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-info-card)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] text-[16px] font-medium">
            Connect your wallet to manage withdrawals
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard width="md:w-[560px]">
      {/* Info Cards */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-5 md:mb-6">
        <InfoCard label="Staked Amount" value={`${stakeAmount || "0"} ETH`} />
        <InfoCard label="Available to Withdraw" value={`${availableWithdrawAmount || "0"} ETH`} />
        <InfoCard label="Pending Withdraw" value={`${pendingWithdrawAmount || "0"} ETH`} />
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border-light)] mb-5 md:mb-6" />

      {/* Unstake Section */}
      <div className="mb-5 md:mb-6">
        <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">
          Unstake
        </h3>
        <div className="mb-3">
          <InputField
            value={unstakeInputAmount}
            onChange={(v) => onUnstakeInputChange(v || null)}
            placeholder="Enter ETH amount"
          />
        </div>
        <ButtonPrimary onClick={onUnstake}>Unstake</ButtonPrimary>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border-light)] mb-5 md:mb-6" />

      {/* Withdraw Section */}
      <div>
        <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">
          Withdraw
        </h3>
        <div className="mb-3">
          <InputField
            value={availableWithdrawAmount || "0"}
            disabled
            placeholder="Available amount"
          />
        </div>
        <ButtonPrimary onClick={onWithdraw}>Withdraw</ButtonPrimary>
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
          p-5 md:p-8"
      >
        {children}
      </div>
    </div>
  );
}
