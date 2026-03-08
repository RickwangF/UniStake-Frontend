import { BrowserProvider, Contract, parseEther, formatEther, ethers } from "ethers";
import uniStakeAbi from "../abi/UniStake.json";
import uniTokenAbi from "../abi/UniToken.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_UNISTAKE_CONTRACT!;

export async function getContract(address: string) {
  if (!window.ethereum) throw new Error("No wallet found");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(address, uniStakeAbi, signer);
}

async function getTokenContract(address: string) {
  if (!window.ethereum) throw new Error("No wallet found");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(address, uniTokenAbi, signer);
}

export async function getPID(address: string) {
  const contract = await getContract(address);
  try {
    const ethPid = await contract.ETH_PID();
    return ethPid;
  } catch (error) {
    console.error("Error fetching ETH_PID:", error);
  }
}

export async function stake(contractAddress: string, amount: number) {
  const contract = await getContract(contractAddress);
  const tx = await contract.depositETH({
    value: ethers.parseEther(amount.toString()),
  });
  return await tx.wait();
}

export async function getStakedAmount(contractAddress: string, account: string) {
  const contract = await getContract(contractAddress);
  const pid: number = (await getPID(contractAddress)) as number;
  const amount = await contract.stakingBalance(pid, account);
  return formatEther(amount);
}

export async function fetchPendingRewards(address: string, user: string) {
  const contract = await getContract(address);
  const pid: number = (await getPID(address)) as number;
  try {
    const pending = await contract.pendingUniToken(pid, user);
    return formatEther(pending);
  } catch (error) {
    console.error("Error fetching pending rewards:", error);
  }
}

export async function claimRewards(address: string) {
  const contract = await getContract(address);
  const pid: number = (await getPID(address)) as number;
  const tx = await contract.claim(pid);
  return tx;
}

export async function unstake(address: string, amount: string) {
  const contract = await getContract(address);
  const pid: number = (await getPID(address)) as number;
  const tx = await contract.unstake(pid, parseEther(amount));
  return await tx.wait();
}

export async function withdrawAmount(address: string, user: string) {
  const contract = await getContract(address);
  const pid: number = (await getPID(address)) as number;
  const tx = await contract.withdrawAmount(pid, user);
  return tx;
}

export async function withdraw(address: string) {
  const contract = await getContract(address);
  const pid: number = (await getPID(address)) as number;
  const result = await contract.withdraw(pid);
  return result;
}

export async function approve(tokenAddress: string, contractAddress: string, amount: number) {
  const tokenContract = await getTokenContract(tokenAddress);
  try {
    const result: boolean = await tokenContract.approve(
      contractAddress,
      ethers.parseUnits(amount.toString(), 18)
    );
    return result;
  } catch (error) {
    console.error("Error during approval:", error);
  }
}

export async function allowance(tokenAddress: string, owner: string, spender: string) {
  const tokenContract = await getTokenContract(tokenAddress);
  try {
    const result = await tokenContract.allowance(owner, spender);
    return formatEther(result);
  } catch (error) {
    console.error("Error fetching allowance:", error);
  }
}

export async function hasAdminRole(accountAddress: string, address: string) {
  const contract = await getContract(address);
  try {
    const isAdmin = await contract.hasRole(await contract.ADMIN_ROLE(), accountAddress);
    return isAdmin;
  } catch (error) {
    console.error("Error checking admin role:", error);
  }
}

export { CONTRACT_ADDRESS };
