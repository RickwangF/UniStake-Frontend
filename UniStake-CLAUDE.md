# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UniStake — 一个基于 Ethereum Sepolia 测试网的 ETH 质押 DApp。用户可以连接钱包质押 ETH，获得 UniToken 奖励，并执行解质押和提取操作。纯前端项目，无后端服务，所有交互直接与链上合约通信。

**设计稿：** `pencil-stake.pen`（Pencil 格式，位于 `/Users/rickwang/Documents/Work/TestCan/UniStake-Frontend/pencil-stake.pen`，含 PC + 移动端 9 屏 + 11 个可复用组件 + 完整 Design Tokens）
**组件实施计划：** 见 [`unistake-implementation-plan.md`](./unistake-implementation-plan.md)

**设计稿屏幕清单（9 屏）：**
1. Desktop Stake — PC 端质押视图 (1440×900)
2. Desktop Withdraw — PC 端提取视图 (1440×900)
3. Mobile Stake — 移动端质押视图 (390×844)
4. Mobile Withdraw — 移动端提取视图 (390×844)
5. Desktop Not Connected — PC 端钱包未连接空状态
6. Mobile Not Connected — 移动端钱包未连接空状态
7. Desktop Loading Modal — 交易进行中弹窗 overlay
8. Desktop Success Modal — 交易成功弹窗 overlay
9. Desktop Error Modal — 交易失败弹窗 overlay

**设计特色：**
- 主色调：蓝色 (#3B82F6)，替代旧版靛蓝 (#6366F1)
- 背景：mesh gradient（网格渐变），作为独立图层方便切图替换
- 卡片：毛玻璃效果 + 渐变边框（#3B82F6→#93C5FD→#06B6D4）

---

## 从空仓库搭建 — 完整执行步骤

> 以下步骤假设在一个全新的空目录中从零开始。标注 `[人工]` 的步骤需要用户手动操作，`[Claude]` 的步骤由 Claude Code 执行。

### Step 0：创建 Next.js 项目 `[Claude]`

```bash
npx create-next-app@latest unistake-dapp \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack
cd unistake-dapp
```

### Step 1：安装依赖 `[Claude]`

```bash
# Web3 核心
npm install ethers@^6.15 wagmi@^2.18 viem@^2.38 @rainbow-me/rainbowkit@^2.2 @tanstack/react-query@^5.90

# MUI（仅用于 LoadingModal 弹窗组件）
npm install @mui/material@^7.3 @mui/icons-material@^7.3 @emotion/react@^11.14 @emotion/styled@^11.14

# CSS Reset
npm install modern-css-reset@^1.4
```

### Step 2：导入 ABI 文件 `[人工]`

用户需要从 Hardhat artifacts 中提取 ABI 并放入项目：

```
src/app/abi/
├── UniStake.json    ← 从 UniStake/artifacts/contracts/UniStake.sol/UniStake.json 提取 "abi" 字段
└── UniToken.json    ← 从 UniStake/artifacts/contracts/UniToken.sol/UniToken.json 提取 "abi" 字段
```

**提取方法：**
```bash
# 假设 Hardhat 项目在 ~/UniStake/
cat ~/UniStake/artifacts/contracts/UniStake.sol/UniStake.json | jq '.abi' > src/app/abi/UniStake.json
cat ~/UniStake/artifacts/contracts/UniToken.sol/UniToken.json | jq '.abi' > src/app/abi/UniToken.json
```

> 如果没有 `jq`，手动打开 JSON 文件，复制 `"abi": [...]` 数组内容保存为新文件即可。

### Step 3：配置环境变量 `[人工]`

创建 `.env.local`：

```env
# 合约地址 (Sepolia) — 部署后填入
NEXT_PUBLIC_UNISTAKE_CONTRACT=<UniStake 合约地址>
NEXT_PUBLIC_UNITOKEN_CONTRACT=<UniToken 合约地址>

# WalletConnect Cloud Project ID — 从 https://cloud.walletconnect.com 获取
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<你的 Project ID>
```

### Step 4：写入配置文件 `[Claude]`

Claude 需生成以下配置文件（内容见下方 [Configuration Files](#configuration-files) 节）：

- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `tailwind.config.js`
- `eslint.config.mjs`

### Step 5：写入基础架构文件 `[Claude]`

按顺序生成：

1. `src/app/globals.css` — Design Tokens + Inter 字体 + Tailwind
2. `src/app/layout.tsx` — 根布局，Inter 字体加载，Providers 包装
3. `src/app/BalanceContext.tsx` — 余额刷新 Context
4. `src/app/Providers.tsx` — Provider 嵌套栈（wagmi + RainbowKit + BalanceContext）
5. `src/app/page.tsx` — 首页，重定向到 `/unistake`

### Step 6：导入合约交互层 `[人工 + Claude]`

`src/app/lib/contract.ts` 基于旧版代码改造。用户提供旧版 contract.ts 文件，Claude 负责：

- 将 ABI 导入路径改为 `../abi/UniStake.json` 和 `../abi/UniToken.json`
- 将 `fetchPendingRewards` 改用新合约的 `pendingUniToken(pid, user)` 函数（旧版用 `user(pid, user).pendingMetaNode`）
- 移除所有 `debugger` 语句
- 合约地址改读 `process.env.NEXT_PUBLIC_UNISTAKE_CONTRACT`

### Step 7：写入通用组件 `[Claude]`

按 [`unistake-implementation-plan.md`](./unistake-implementation-plan.md) Phase 2-3 顺序生成：

```
src/app/components/
├── ui/
│   ├── ButtonPrimary.tsx         # 渐变主按钮 (#3B82F6→#2563EB)
│   ├── ButtonSecondary.tsx       # 浅色次按钮 (#EFF6FF + #BFDBFE 边框)
│   ├── InputField.tsx            # 输入框（含 disabled 态）
│   └── InfoCard.tsx              # 标签+数值信息卡
├── layout/
│   ├── PageBackground.tsx        # mesh gradient 网格渐变背景层（蓝色系多色块融合）
│   ├── Header.tsx                # 毛玻璃导航栏 + 自定义 Tabs
│   └── Footer.tsx                # 毛玻璃页脚
├── wallet/
│   └── WalletButton.tsx          # RainbowKit ConnectButton.Custom 封装（gradient #3B82F6→#60A5FA）
└── LoadingModal.tsx              # MUI Dialog 交易状态弹窗（直接复用旧版）
```

### Step 8：导入 LoadingModal `[人工]`

将旧项目的 `src/app/components/LoadingModal.tsx` 直接复制到新项目同路径。此文件无需修改。

### Step 9：写入业务组件和页面 `[Claude]`

按 [`unistake-implementation-plan.md`](./unistake-implementation-plan.md) Phase 4-5 生成：

```
src/app/unistake/
├── hooks/
│   └── useStaking.ts             # 合约交互 Hook（从旧 stake/page.tsx 提取改造）
├── StakeCard.tsx                 # Stake Tab 卡片
├── WithdrawCard.tsx              # Withdraw Tab 卡片
└── page.tsx                      # 页面编排层
```

### Step 10：验证 `[Claude + 人工]`

```bash
npm run build    # 编译检查
npm run dev      # 启动开发服务器
# 浏览器打开 http://localhost:3000/unistake 验证
```

---

## 需要用户手动提供的文件清单

| 文件 | 来源 | 说明 |
|------|------|------|
| `src/app/abi/UniStake.json` | Hardhat artifacts | 从 `UniStake.sol/UniStake.json` 提取 `abi` 字段 |
| `src/app/abi/UniToken.json` | Hardhat artifacts | 从 `UniToken.sol/UniToken.json` 提取 `abi` 字段 |
| `src/app/components/LoadingModal.tsx` | 旧项目复制 | MUI Dialog 弹窗，直接复用无需修改 |
| `.env.local` | 用户配置 | 合约地址 + WalletConnect Project ID |
| 旧版 `contract.ts` | 旧项目参考 | 作为 Claude 改造 `lib/contract.ts` 的基础 |
| 旧版 `stake/page.tsx` | 旧项目参考 | 作为 Claude 提取 `useStaking.ts` Hook 的基础 |

---

## Tech Stack（精确版本）

| 技术 | 版本 | 用途 |
|---|---|---|
| Next.js | ^15.5 | 框架，使用 App Router + Turbopack |
| React | ^19.1 | UI 库 |
| TypeScript | ^5 | 类型系统 |
| Tailwind CSS | ^4.1 | 样式，新组件全部使用 Tailwind |
| @mui/material | ^7.3 | 仅用于 LoadingModal 弹窗 |
| @mui/icons-material | ^7.3 | LoadingModal 图标 |
| @emotion/react + @emotion/styled | ^11.14 | MUI 样式引擎 |
| ethers | ^6.15 | 合约交互（BrowserProvider + Contract） |
| @rainbow-me/rainbowkit | ^2.2 | 钱包连接 UI |
| wagmi | ^2.18 | React Hooks for Ethereum |
| viem | ^2.38 | wagmi 底层依赖 |
| @tanstack/react-query | ^5.90 | 异步数据管理 |
| modern-css-reset | ^1.4 | CSS Reset |

---

## Commands

```bash
npm run dev     # 启动开发服务器 (Turbopack, port 3000)
npm run build   # 生产构建
npm run start   # 启动生产服务器
npm run lint    # ESLint 检查
```

---

## Configuration Files

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### postcss.config.mjs

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

### tailwind.config.js

```javascript
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
```

### eslint.config.mjs

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
```

---

## Target Project Structure

```
src/
├── app/
│   ├── layout.tsx                     # 根布局：Inter 字体、全局样式、Providers
│   ├── page.tsx                       # 首页 → 重定向到 /unistake
│   ├── globals.css                    # Tailwind + Design Tokens + Inter 字体
│   ├── Providers.tsx                  # Provider 嵌套栈（"use client"）
│   ├── BalanceContext.tsx             # 余额刷新 Context（"use client"）
│   │
│   ├── abi/
│   │   ├── UniStake.json             # [人工导入] UniStake 合约 ABI
│   │   └── UniToken.json             # [人工导入] UniToken 合约 ABI (ERC20)
│   │
│   ├── lib/
│   │   └── contract.ts               # 合约交互函数（基于旧版改造）
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ButtonPrimary.tsx      # 渐变主按钮 (#3B82F6→#2563EB)
│   │   │   ├── ButtonSecondary.tsx    # 浅色次按钮 (#EFF6FF + #BFDBFE)
│   │   │   ├── InputField.tsx         # 输入框（含 disabled 态）
│   │   │   └── InfoCard.tsx           # 标签+数值信息卡
│   │   ├── layout/
│   │   │   ├── PageBackground.tsx     # mesh gradient 网格渐变背景层
│   │   │   ├── Header.tsx             # 毛玻璃导航栏 + 自定义 Tabs
│   │   │   └── Footer.tsx             # 毛玻璃页脚
│   │   ├── wallet/
│   │   │   └── WalletButton.tsx       # ConnectButton.Custom 两态封装 (#3B82F6→#60A5FA)
│   │   └── LoadingModal.tsx           # [人工导入] MUI Dialog 交易弹窗
│   │
│   └── unistake/                      # /unistake 路由
│       ├── page.tsx                   # 页面编排层
│       ├── StakeCard.tsx              # Stake Tab 卡片
│       ├── WithdrawCard.tsx           # Withdraw Tab 卡片
│       └── hooks/
│           └── useStaking.ts          # 合约交互 Hook
```

---

## Design Tokens

所有设计令牌定义在 `globals.css` 的 `:root` 中，组件通过 `var(--token-name)` 或 Tailwind 任意值 `text-[var(--text-primary)]` 引用。

```css
:root {
  /* 强调色 */
  --accent-primary: #3B82F6;
  --accent-primary-hover: #2563EB;
  --accent-secondary: #60A5FA;
  --accent-success: #10B981;
  --accent-error: #EF4444;
  --accent-value: #2563EB;

  /* 文字色 */
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-tertiary: #94A3B8;
  --text-on-primary: #FFFFFF;

  /* 背景色 */
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-info-card: #F1F5F9;
  --bg-input: #F1F5F9;
  --bg-input-disabled: #E2E8F0;

  /* 边框/阴影 */
  --border-light: #E2E8F0;
  --shadow-card: rgba(15, 23, 42, 0.05);

  /* 间距 */
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
  --space-lg: 24px; --space-xl: 32px;

  /* 圆角 */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px;
}
```

---

## Environment Configuration

`.env.local` — 所有前端可读的环境变量必须以 `NEXT_PUBLIC_` 前缀：

```env
NEXT_PUBLIC_UNISTAKE_CONTRACT=<UniStake 合约地址>
NEXT_PUBLIC_UNITOKEN_CONTRACT=<UniToken 合约地址>
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<WalletConnect Cloud Project ID>
```

---

## Contract Interfaces

### UniStake 合约

UUPS 可升级合约，基于 OpenZeppelin AccessControl + Pausable。

**前端调用的核心函数：**

```solidity
// 读取
function ETH_PID() view returns (uint256)
function stakingBalance(uint256 _pid, address _user) view returns (uint256)
function pendingUniToken(uint256 _pid, address _user) view returns (uint256)
function withdrawAmount(uint256 _pid, address _user) view returns (uint256 requestAmount, uint256 pendingWithdrawAmount)
function user(uint256 pid, address user) view returns (uint256 stAmount, uint256 finishedUniToken, uint256 pendingUniToken)
function hasRole(bytes32 role, address account) view returns (bool)
function ADMIN_ROLE() view returns (bytes32)

// 写入
function depositETH() payable
function unstake(uint256 _pid, uint256 _amount)
function withdraw(uint256 _pid)
function claim(uint256 _pid)
```

**前端监听的事件：**

```solidity
event Deposit(address indexed user, uint256 indexed poolId, uint256 amount)
event RequestUnstake(address indexed user, uint256 indexed poolId, uint256 amount)
event Withdraw(address indexed user, uint256 indexed poolId, uint256 amount, uint256 indexed blockNumber)
event Claim(address indexed user, uint256 indexed poolId, uint256 uniTokenReward)
```

### UniToken 合约

标准 ERC20 代币（name: "UniToken", symbol: "UNI", decimals: 18）。

```solidity
function balanceOf(address account) view returns (uint256)
function allowance(address owner, address spender) view returns (uint256)
function approve(address spender, uint256 value) returns (bool)
function transfer(address to, uint256 value) returns (bool)
function transferFrom(address from, address to, uint256 value) returns (bool)
```

---

## Contract Interaction Layer — `lib/contract.ts`

所有合约交互通过 ethers.js v6 的 `BrowserProvider` + `Contract` 实现。合约地址从环境变量读取。

### 与旧版的关键差异

| 旧版（MetaNodeStake） | 新版（UniStake） |
|---|---|
| ABI 导入 `MetaNodeStakeABI.json` | 导入 `abi/UniStake.json` |
| ABI 导入 `erc20ABI.json` | 导入 `abi/UniToken.json` |
| `fetchPendingRewards` 调用 `user(pid, addr).pendingMetaNode` | 调用专用函数 `pendingUniToken(pid, addr)` |
| 合约地址硬编码 | 读取 `process.env.NEXT_PUBLIC_UNISTAKE_CONTRACT` |
| 含 `debugger` 语句 | 全部移除 |

### 函数清单

| 函数名 | 参数 | 返回值 | 合约调用 | 说明 |
|---|---|---|---|---|
| `getContract(address)` | 合约地址 | `Contract` | — | 创建 UniStake 合约实例（带 signer） |
| `getTokenContract(address)` | 合约地址 | `Contract` | — | 创建 UniToken 合约实例（带 signer） |
| `getPID(address)` | 合约地址 | `number` | `ETH_PID()` | 获取 ETH 质押池 ID |
| `stake(contractAddress, amount)` | 合约地址, ETH数量(number) | `TransactionReceipt` | `depositETH({value})` | 质押 ETH |
| `getStakedAmount(contractAddress, account)` | 合约地址, 用户地址 | `string` (格式化ETH) | `stakingBalance(pid, account)` | 查询质押余额 |
| `fetchPendingRewards(contractAddress, user)` | 合约地址, 用户地址 | `string` (格式化ETH) | `pendingUniToken(pid, user)` | 查询待领取 UniToken |
| `claimRewards(address)` | 合约地址 | `TransactionResponse` | `claim(pid)` | 领取奖励 |
| `unstake(address, amount)` | 合约地址, 金额(string) | `TransactionReceipt` | `unstake(pid, parseEther(amount))` | 请求解质押 |
| `withdrawAmount(address, user)` | 合约地址, 用户地址 | `{requestAmount, pendingWithdrawAmount}` | `withdrawAmount(pid, user)` | 查询可提取和待解锁金额 |
| `withdraw(address)` | 合约地址 | `TransactionResponse` | `withdraw(pid)` | 执行提取 |
| `approve(tokenAddress, contractAddress, amount)` | 代币地址, 授权地址, 数量 | `boolean` | `approve(spender, amount)` | ERC20 授权 |
| `allowance(tokenAddress, owner, spender)` | 代币地址, owner, spender | `string` (格式化ETH) | `allowance(owner, spender)` | 查询授权额度 |
| `hasAdminRole(accountAddress, contractAddress)` | 账户地址, 合约地址 | `boolean` | `hasRole(ADMIN_ROLE(), account)` | 检查管理员角色 |

### 实现模式

```typescript
// 每次调用都从 window.ethereum 获取新的 signer
async function getContract(address: string) {
    if (!window.ethereum) throw new Error('No wallet found');
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(address, uniStakeAbi, signer);
}

// ETH 质押通过 payable 函数 + msg.value
async function stake(contractAddress: string, amount: number) {
    const contract = await getContract(contractAddress);
    const tx = await contract.depositETH({
        value: ethers.parseEther(amount.toString()),
    });
    return await tx.wait();
}
```

---

## Provider Architecture

Provider 嵌套顺序（从外到内），整个 Provider 链必须是 `"use client"` 组件：

```
WagmiProvider (config: sepolia + mainnet chains)
  └── QueryClientProvider
        └── RainbowKitProvider
              └── BalanceProvider (自定义 Context)
                    └── {children}
```

### Wagmi Config

```typescript
const config = getDefaultConfig({
    appName: 'UniStake',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, mainnet],
    ssr: false,
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});
```

### BalanceContext

```typescript
interface BalanceContextType {
    refreshFlag: number;
    triggerRefresh: () => void; // setRefreshFlag(prev => prev + 1)
}
```

---

## UniStake Page — 完整功能规格

`/unistake` 路由，通过 Tab 切换 Stake 和 Withdraw 两个视图。

### State 管理

| State | 类型 | 说明 |
|---|---|---|
| `activeTab` | `string ('stake' \| 'withdraw')` | 当前 Tab |
| `stakeAmount` | `string` | 用户已质押的 ETH 数量（格式化后） |
| `pendingRewards` | `string` | 待领取的 UniToken 奖励（不在 UI 展示，Claim 校验用） |
| `inputAmount` | `number \| null` | Stake Tab 的输入金额 |
| `unstakeAmount` | `string \| null` | Withdraw Tab 的解质押输入金额 |
| `availableWithdrawAmount` | `string` | 可提取金额 |
| `pendingWithdrawAmount` | `string` | 待解锁金额（已请求但未到期） |
| `loadingState` | `LoadingModel` | 弹窗状态 `{variant, title, content, open}` |

### 数据获取时机

- 钱包连接成功后（`useEffect` 监听 `account.isConnected`）：同时拉取 stakeAmount、pendingRewards、withdrawAmount
- 交易事件触发后（合约事件监听）：自动刷新相关数据

### 事件监听

组件挂载时（`account.address` 变化），通过 `contract.on()` 监听：

| 事件 | 触发后动作 |
|---|---|
| `Deposit` | 显示成功弹窗 + 刷新 stakeAmount |
| `RequestUnstake` | 显示成功弹窗 + 刷新 stakeAmount + withdrawAmount |
| `Withdraw` | 显示成功弹窗 + 刷新 withdrawAmount |

组件卸载时通过 `contract.off()` 移除监听器。仅处理当前用户地址匹配的事件。

### 交易流程

每个写操作（stake/unstake/withdraw/claim）遵循统一流程：

1. 前置校验（输入非空、数值有效、余额充足）
2. 设置 `loadingState = { variant: 'loading', open: true }`
3. 调用 contract.ts 对应函数
4. 等待交易确认 / 事件触发
5. 事件回调中设置 `loadingState = { variant: 'success', open: true }` + 刷新数据
6. 异常时设置 `loadingState = { variant: 'error', open: true }`

### Tab 1: Stake

功能区域（从上到下）：
1. **Staked Amount 展示** — 标签 + 数值
2. **ETH 输入框** — placeholder: "Enter ETH amount"
3. **Stake 按钮** — 调用 `depositETH`
4. **Claim 按钮** — 调用 `claim(pid)`，领取前校验 pendingRewards > 0

> Pending UniToken 数值不在 Stake Tab 界面展示（但仍需在后台获取用于 Claim 校验）。

### Tab 2: Withdraw

功能区域（从上到下）：
1. **3 张信息卡片**（桌面横排，移动竖排）：
   - Staked Amount: `{stakeAmount} ETH`
   - Available to Withdraw: `{availableWithdrawAmount} ETH`
   - Pending Withdraw: `{pendingWithdrawAmount} ETH`
2. **Unstake 区域** — 标题 + 输入框 + Unstake 按钮
3. **Withdraw 区域** — 标题 + 禁用输入框（显示 availableWithdrawAmount）+ Withdraw 按钮

---

## LoadingModal Component

MUI Dialog 封装，交易过程中的状态反馈弹窗。**此文件从旧项目直接复制，无需修改。**

### Props

```typescript
type LoadingModalProps = {
    open: boolean;
    title?: string;          // 默认 'Processing'
    content?: string;        // 默认 'Please wait...'
    icon?: React.ReactNode;
    variant?: 'loading' | 'success' | 'error';
    onClose?: () => void;
    fullWidth?: boolean;     // 默认 true
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // 默认 'xs'
};
```

| variant | 图标 | 说明 |
|---|---|---|
| `loading` | MUI CircularProgress (size 48) | 交易进行中 |
| `success` | MUI CheckCircleIcon (green, size 48) | 交易成功 |
| `error` | MUI ErrorIcon (red, size 48) | 交易失败 |

---

## SSR / CSR Boundaries

| 文件 | 渲染模式 | 原因 |
|---|---|---|
| `layout.tsx` | Server Component | 只做布局嵌套，无浏览器 API |
| `page.tsx` (/) | Server Component | 重定向逻辑 |
| `Providers.tsx` | `"use client"` | wagmi/rainbowkit 需要浏览器环境 |
| `BalanceContext.tsx` | `"use client"` | 使用 React state |
| `unistake/page.tsx` | `"use client"` | 钱包交互、合约调用、事件监听 |
| `components/LoadingModal.tsx` | `"use client"` | MUI Dialog 需要客户端渲染 |
| `components/wallet/WalletButton.tsx` | `"use client"` | RainbowKit ConnectButton.Custom |
| `components/layout/Header.tsx` | `"use client"` | Tab 状态 + WalletButton |
| `components/layout/PageBackground.tsx` | Server Component | 纯 CSS，无交互 |
| `components/layout/Footer.tsx` | Server Component | 纯展示 |
| `components/ui/*` | Server Component 或 `"use client"` | 含 onClick 的需要 `"use client"` |
| `lib/contract.ts` | 纯函数模块 | 使用 `window.ethereum`，仅在客户端组件中调用 |

---

## ABI Files

| 文件 | 来源 | 说明 |
|---|---|---|
| `src/app/abi/UniStake.json` | Hardhat artifacts: `UniStake.sol/UniStake.json` → 提取 `abi` 字段 | UniStake 合约完整 ABI |
| `src/app/abi/UniToken.json` | Hardhat artifacts: `UniToken.sol/UniToken.json` → 提取 `abi` 字段 | 标准 ERC20 ABI |

ABI 源文件位于用户本地 Hardhat 项目的 `artifacts/contracts/` 目录下。
