"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  getStakedAmount,
  getContract,
  getPID,
  stake as stakeContract,
  withdraw as withdrawContract,
  unstake as unstakeContract,
  withdrawAmount as withdrawAmountContract,
  fetchPendingRewards,
  claimRewards,
  CONTRACT_ADDRESS,
} from "@/app/lib/contract";

export type LoadingModel = {
  variant: "loading" | "success" | "error";
  title: string;
  content: string;
  open: boolean;
};

export interface UseStakingReturn {
  stakeAmount: string;
  pendingWithdrawAmount: string;
  availableWithdrawAmount: string;
  pendingRewards: string;
  inputAmount: number | null;
  setInputAmount: (v: number | null) => void;
  unstakeInputAmount: string | null;
  setUnstakeInputAmount: (v: string | null) => void;
  handleStake: () => void;
  handleUnstake: () => void;
  handleWithdraw: () => void;
  handleClaim: () => void;
  loadingState: LoadingModel;
  handleCloseDialog: () => void;
  isConnected: boolean;
}

export function useStaking(): UseStakingReturn {
  const account = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [pendingWithdrawAmount, setPendingWithdrawAmount] = useState("");
  const [availableWithdrawAmount, setAvailableWithdrawAmount] = useState("");
  const [pendingRewards, setPendingRewards] = useState("");
  const [inputAmount, setInputAmount] = useState<number | null>(null);
  const [unstakeInputAmount, setUnstakeInputAmount] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingModel>({
    variant: "loading",
    title: "",
    content: "",
    open: false,
  });

  const contractAddress = CONTRACT_ADDRESS;

  const fetchStakeAmount = useCallback(async () => {
    if (!account.address) return;
    try {
      const amount = await getStakedAmount(contractAddress, account.address);
      setStakeAmount(amount);
    } catch (error) {
      console.error("Error fetching staked amount:", error);
    }
  }, [account.address, contractAddress]);

  const fetchRewards = useCallback(async () => {
    if (!account.address) return;
    try {
      const rewards = await fetchPendingRewards(contractAddress, account.address);
      setPendingRewards(rewards ?? "0");
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
    }
  }, [account.address, contractAddress]);

  const fetchWithdrawAmountData = useCallback(async () => {
    if (!account.address) return;
    try {
      const tx = await withdrawAmountContract(contractAddress, account.address);
      setAvailableWithdrawAmount(ethers.formatEther(tx.pendingWithdrawAmount));
      setPendingWithdrawAmount(ethers.formatEther(tx.requestAmount - tx.pendingWithdrawAmount));
    } catch (error) {
      console.error("Error fetching withdrawable amount:", error);
    }
  }, [account.address, contractAddress]);

  const handleStake = useCallback(async () => {
    if (inputAmount === null || inputAmount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    setLoadingState({
      variant: "loading",
      title: "Staking...",
      content: "Please wait while we process your transaction.",
      open: true,
    });
    try {
      await stakeContract(contractAddress, inputAmount);
    } catch (error) {
      setLoadingState({
        variant: "error",
        title: "Stake Failed",
        content: "There was an error during staking.",
        open: true,
      });
      console.error("Error during staking:", error);
    }
  }, [inputAmount, contractAddress]);

  const handleUnstake = useCallback(async () => {
    if (!unstakeInputAmount) {
      alert("Please enter a valid amount!");
      return;
    }
    const numericValue = parseFloat(unstakeInputAmount);
    if (isNaN(numericValue) || numericValue <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    setLoadingState({
      variant: "loading",
      title: "Unstaking...",
      content: "Please wait while we process your transaction.",
      open: true,
    });
    try {
      await unstakeContract(contractAddress, unstakeInputAmount);
      fetchStakeAmount();
      fetchWithdrawAmountData();
    } catch (error) {
      setLoadingState({
        variant: "error",
        title: "Unstake Failed",
        content: "There was an error during unstaking.",
        open: true,
      });
      console.error("Error during unstaking:", error);
    }
  }, [unstakeInputAmount, contractAddress, fetchStakeAmount, fetchWithdrawAmountData]);

  const handleWithdraw = useCallback(async () => {
    const numericValue = parseFloat(availableWithdrawAmount);
    if (isNaN(numericValue) || numericValue <= 0) {
      alert("No tokens available for withdrawal!");
      return;
    }
    setLoadingState({
      variant: "loading",
      title: "Withdrawing...",
      content: "Please wait while we process your transaction.",
      open: true,
    });
    try {
      await withdrawContract(contractAddress);
      fetchWithdrawAmountData();
    } catch (error) {
      setLoadingState({
        variant: "error",
        title: "Withdraw Failed",
        content: "There was an error during withdrawal.",
        open: true,
      });
      console.error("Error during withdrawing:", error);
    }
  }, [availableWithdrawAmount, contractAddress, fetchWithdrawAmountData]);

  const handleClaim = useCallback(async () => {
    if (pendingRewards === "0" || pendingRewards === "") {
      alert("No rewards available to claim!");
      return;
    }
    const numericValue = parseFloat(pendingRewards);
    if (isNaN(numericValue) || numericValue <= 0) {
      alert("No rewards available to claim!");
      return;
    }
    setLoadingState({
      variant: "loading",
      title: "Claiming...",
      content: "Please wait while we process your transaction.",
      open: true,
    });
    try {
      await claimRewards(contractAddress);
      setLoadingState({
        variant: "success",
        title: "Claim Successful",
        content: "Your rewards have been successfully claimed.",
        open: true,
      });
      fetchRewards();
    } catch (error) {
      setLoadingState({
        variant: "error",
        title: "Claim Failed",
        content: "There was an error during claiming.",
        open: true,
      });
      console.error("Error during claiming:", error);
    }
  }, [pendingRewards, contractAddress, fetchRewards]);

  const handleCloseDialog = useCallback(() => {
    setLoadingState((prev) => ({ ...prev, open: false }));
  }, []);

  // Fetch data when wallet connects
  useEffect(() => {
    if (account.isConnected) {
      fetchStakeAmount();
      fetchRewards();
      fetchWithdrawAmountData();
    }
  }, [account.isConnected, fetchStakeAmount, fetchRewards, fetchWithdrawAmountData]);

  // Listen for contract events
  useEffect(() => {
    if (!account.address) return;

    const listenEvents = async () => {
      const contract = await getContract(contractAddress);

      const handleDepositEvent = (user: string, pid: bigint, amount: bigint) => {
        if (user.toLowerCase() === account.address?.toLowerCase()) {
          setLoadingState({
            variant: "success",
            title: "Stake Successful",
            content: "Your ETH has been successfully staked.",
            open: true,
          });
          fetchStakeAmount();
        }
      };

      const handleWithdrawEvent = (user: string, pid: bigint, amount: bigint) => {
        if (user.toLowerCase() === account.address?.toLowerCase()) {
          setLoadingState({
            variant: "success",
            title: "Withdraw Successful",
            content: "Your ETH has been successfully withdrawn.",
            open: true,
          });
          fetchWithdrawAmountData();
        }
      };

      const handleUnstakeEvent = (user: string, pid: number, amount: bigint) => {
        if (user.toLowerCase() === account.address?.toLowerCase()) {
          setLoadingState({
            variant: "success",
            title: "Unstake Successful",
            content: "Your unstake request has been submitted.",
            open: true,
          });
          fetchStakeAmount();
          fetchWithdrawAmountData();
        }
      };

      contract.on("Deposit", handleDepositEvent);
      contract.on("Withdraw", handleWithdrawEvent);
      contract.on("RequestUnstake", handleUnstakeEvent);

      return () => {
        contract.off("Deposit", handleDepositEvent);
        contract.off("Withdraw", handleWithdrawEvent);
        contract.off("RequestUnstake", handleUnstakeEvent);
      };
    };

    const cleanupPromise = listenEvents();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [account.address, contractAddress, fetchStakeAmount, fetchWithdrawAmountData]);

  return {
    stakeAmount,
    pendingWithdrawAmount,
    availableWithdrawAmount,
    pendingRewards,
    inputAmount,
    setInputAmount,
    unstakeInputAmount,
    setUnstakeInputAmount,
    handleStake,
    handleUnstake,
    handleWithdraw,
    handleClaim,
    loadingState,
    handleCloseDialog,
    isConnected: account.isConnected,
  };
}
