"use client";

import { useState } from "react";
import { PageBackground } from "@/app/components/layout/PageBackground";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import { StakeCard } from "./StakeCard";
import { WithdrawCard } from "./WithdrawCard";
import { useStaking } from "./hooks/useStaking";
import LoadingModal from "@/app/components/LoadingModal";

export default function UniStakePage() {
  const [activeTab, setActiveTab] = useState("stake");
  const staking = useStaking();

  return (
    <div className="relative min-h-screen flex flex-col font-[var(--font-inter)]">
      <PageBackground />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {activeTab === "stake" ? (
          <StakeCard
            stakeAmount={staking.stakeAmount}
            inputAmount={staking.inputAmount}
            onInputChange={staking.setInputAmount}
            onStake={staking.handleStake}
            onClaim={staking.handleClaim}
            isConnected={staking.isConnected}
          />
        ) : (
          <WithdrawCard
            stakeAmount={staking.stakeAmount}
            availableWithdrawAmount={staking.availableWithdrawAmount}
            pendingWithdrawAmount={staking.pendingWithdrawAmount}
            unstakeInputAmount={staking.unstakeInputAmount}
            onUnstakeInputChange={staking.setUnstakeInputAmount}
            onUnstake={staking.handleUnstake}
            onWithdraw={staking.handleWithdraw}
            isConnected={staking.isConnected}
          />
        )}
      </main>

      <Footer />

      <LoadingModal
        open={staking.loadingState.open}
        title={staking.loadingState.title}
        content={staking.loadingState.content}
        variant={staking.loadingState.variant}
        onClose={staking.handleCloseDialog}
      />
    </div>
  );
}
