"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 h-[40px] px-5 rounded-full
                      bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]
                      text-white text-[14px] font-semibold
                      hover:from-[#2563EB] hover:to-[#3B82F6]
                      transition-all duration-200 cursor-pointer
                      shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                    Connect Wallet
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 h-[34px] md:h-[40px] px-3 md:px-4 rounded-full
                    bg-[#F1F5F9] border border-[#E2E8F0]
                    text-[var(--text-primary)]
                    hover:bg-[#E2E8F0]
                    transition-all duration-200 cursor-pointer"
                >
                  {/* Green dot */}
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-success)]" />

                  {/* Balance */}
                  <span className="text-[11px] md:text-[13px] font-medium">
                    {account.displayBalance}
                  </span>

                  {/* Divider */}
                  <span className="w-px h-4 bg-[var(--border-light)]" />

                  {/* Address */}
                  <span className="text-[11px] md:text-[13px] font-medium">
                    {account.displayName}
                  </span>

                  {/* Avatar */}
                  <div
                    className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA]"
                  />
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
