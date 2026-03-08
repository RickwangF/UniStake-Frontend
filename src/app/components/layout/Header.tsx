"use client";

import { WalletButton } from "../wallet/WalletButton";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: "stake", label: "Stake" },
  { key: "withdraw", label: "Withdraw" },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/[0.73] backdrop-blur-[8px] shadow-sm border-b border-[var(--border-light)]/50">
      {/* Desktop: single row */}
      <div className="hidden md:flex items-center justify-between h-[64px] px-6 max-w-7xl mx-auto">
        <Logo />
        <TabBar activeTab={activeTab} onTabChange={onTabChange} />
        <WalletButton />
      </div>

      {/* Mobile: two rows */}
      <div className="md:hidden">
        <div className="flex items-center justify-between h-[52px] px-4">
          <Logo />
          <WalletButton />
        </div>
        <div className="flex justify-center h-[44px]">
          <TabBar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span className="text-[22px] font-extrabold text-[var(--accent-primary)] select-none">
      UniStake
    </span>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <nav className="flex gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`relative px-1 py-2 text-[15px] font-semibold transition-colors duration-200 cursor-pointer
            ${activeTab === tab.key
              ? "text-[var(--accent-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--accent-primary)] rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
}
