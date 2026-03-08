# UniStake 设计稿 100% 还原 — React 组件实现计划

## Context

pencil-stake.pen 设计稿已完成（含 PC 端 + 移动端 9 个屏幕 + 11 个可复用组件 + 完整 Design Tokens）。现在需要将设计稿精确还原为 React 组件代码。

**设计稿位置：** `/Users/rickwang/Documents/Work/TestCan/UniStake-Frontend/pencil-stake.pen`

**核心目标：** 100% 像素级还原设计稿的视觉效果，同时保留所有合约交互逻辑。

**重要约束：** 不修改现有 `/stake` 路由和页面，新建 `/unistake` 路由承载新版页面，旧版保留用于对比参考。

**与旧版设计(UniStake.pen)的主要差异：**
- 主色调从靛蓝(#6366F1)更换为蓝色(#3B82F6)
- 页面背景从线性渐变改为 mesh gradient（网格渐变），视觉层次更丰富
- 背景作为独立图层（Component/BgDesktop、Component/BgMobile），方便切图和替换
- 新增钱包未连接空状态屏幕（Desktop + Mobile）
- 新增交易弹窗 overlay 屏幕（Loading / Success / Error 三种状态）

---

## 关键决策

| 决策 | 方案 | 原因 |
|------|------|------|
| 路由策略 | 新建 `/unistake` 路由 | 保留旧 `/stake` 页面不动，便于对比和回退 |
| MUI Tabs → 自定义 Tabs | 替换 | MUI Tabs 自带 ripple/indicator 样式，难以精确匹配设计稿的 3px 底部边框 |
| MUI TextField → 原生 input | 替换 | 设计稿要求简洁的 #F1F5F9 填充 + 12px 圆角，MUI TextField DOM 层级过深 |
| MUI Dialog (LoadingModal) | 保留 | 弹窗功能完备，不影响主页面设计还原 |
| RainbowKit ConnectButton | 用 ConnectButton.Custom 包装 | 实现设计稿中的两态钱包按钮（未连接/已连接） |
| 样式方案 | 纯 Tailwind CSS v4 | 通过 CSS 变量映射 Design Tokens，所有新组件用 Tailwind 类名 |
| 响应式断点 | `md:` (768px) | 移动端优先，md 以上走桌面布局 |

---

## 文件结构（新增文件清单）

```
src/app/
├── globals.css                              ← 修改：追加 Design Tokens（不影响旧页面）
├── layout.tsx                               ← 修改：追加 Inter 字体，保留 Geist 兼容
│
├── components/                              ← 新建通用组件目录
│   ├── ui/
│   │   ├── ButtonPrimary.tsx                ← 新建
│   │   ├── ButtonSecondary.tsx              ← 新建
│   │   ├── InputField.tsx                   ← 新建（含 disabled 状态）
│   │   └── InfoCard.tsx                     ← 新建
│   ├── layout/
│   │   ├── Header.tsx                       ← 新建（含自定义 Tabs）
│   │   ├── Footer.tsx                       ← 新建
│   │   └── PageBackground.tsx               ← 新建（渐变+光晕背景层）
│   ├── wallet/
│   │   └── WalletButton.tsx                 ← 新建（ConnectButton.Custom 封装）
│   └── LoadingModal.tsx                      ← 保留不动（新旧页面共用）
│
├── unistake/                                ← 新建路由目录（/unistake）
│   ├── page.tsx                             ← 新建：页面编排层
│   ├── StakeCard.tsx                        ← 新建
│   ├── WithdrawCard.tsx                     ← 新建
│   └── hooks/
│       └── useStaking.ts                    ← 新建：从旧 stake/page.tsx 提取并改造
│
├── stake/                                    ← ⚠️ 完全不动，保留原样
│   ├── page.tsx
│   └── stake.module.css
│
└── lib/
    └── contract.ts                           ← 暂不改动
```

---

## 设计规格速查

### Design Tokens

```css
/* 颜色 */
--accent-primary: #3B82F6;        --accent-primary-hover: #2563EB;
--accent-secondary: #60A5FA;      --accent-success: #10B981;
--accent-error: #EF4444;          --accent-value: #2563EB;
--text-primary: #0F172A;          --text-secondary: #64748B;
--text-tertiary: #94A3B8;         --text-on-primary: #FFFFFF;
--bg-page: #F8FAFC;               --bg-card: #FFFFFF;
--bg-info-card: #F1F5F9;          --bg-input: #F1F5F9;
--bg-input-disabled: #E2E8F0;     --border-light: #E2E8F0;

/* 间距 */
--space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
--space-lg: 24px; --space-xl: 32px;

/* 圆角 */
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px;
```

### 组件规格

| 组件 | 尺寸 | 圆角 | 填充 | 字体 |
|------|------|------|------|------|
| ButtonPrimary | w-full × 52h (桌面) / 48h (移动) | 12px | gradient #3B82F6→#2563EB | Inter 16px/600 白色 |
| ButtonSecondary | w-full × 52h / 48h | 12px | #EFF6FF + 1px #BFDBFE 边框 | Inter 16px/600 #2563EB |
| InputField | w-full × 48h | 12px | #F1F5F9 | Inter 15px placeholder |
| InputDisabled | w-full × 48h | 12px | #E2E8F0 opacity-60 | Inter 15px/500 |
| InfoCard | flex-1 × auto | 12px | #F1F5F9 | label 13px/500 + value 20px/700 |
| WalletButton(未连接) | auto × 40h | 20px pill | gradient #3B82F6→#60A5FA | Inter 14px/600 白色 |
| WalletConnected(已连接) | auto × 40h / 34h(移动) | 20px pill | #F1F5F9 + 1px #E2E8F0 | Inter 13px |

### 页面布局规格

**桌面端 (≥768px)：**
- Header: 64h, `bg-white/[0.73] backdrop-blur-[8px]`, Logo | Tabs | Wallet 三栏
- StakeCard: 480w, 24px 圆角, 32px 内边距, 毛玻璃 + 渐变边框(#3B82F6→#93C5FD→#06B6D4)
- WithdrawCard: 560w, 同上, InfoCards 横排 gap-12
- Footer: 56h, 毛玻璃, 顶部 1px 边框

**移动端 (<768px)：**
- Header: 双行 — 上 52h(Logo+Wallet), 下 44h(Tabs 居中)
- StakeCard: full-width, 20px 圆角, 24px 内边距
- WithdrawCard: full-width, 20px 圆角, 20px 内边距, InfoCards 竖排 gap-8
- Footer: 48h

**页面背景：**
- 底层: mesh gradient（网格渐变），多个色块融合：#EFF6FF、#E0F2FE、#F0F9FF、#DBEAFE、#F8FAFC、#EDE9FE、#F5F3FF
- 背景作为独立图层（Component/BgDesktop、Component/BgMobile），方便切图和替换
- 叠加: 径向光晕（蓝色左上、浅蓝右下、青色中间）

---

## 实施步骤（按依赖顺序）

### Phase 1：基础层（Design Tokens + 字体 + 背景）

**Step 1.1 — 修改 `globals.css`（追加方式，不破坏旧样式）**

在现有内容之后追加 `:root` 块定义所有 UniStake Design Tokens。保留旧的 `@theme inline` 以免影响 `/stake` 页面。

**Step 1.2 — 修改 `layout.tsx`**
- 追加 `Inter` 字体加载（weights: 400,500,600,700,800），保留 `Geist` 不删
- CSS 变量 `--font-inter`，body 同时携带两组字体变量
- html/body 加 `h-full`
- metadata title → "UniStake"（或保持不变，由页面自行设置）

**Step 1.3 — 新建 `components/layout/PageBackground.tsx`**
- `fixed inset-0 -z-10` 定位，不影响页面流
- 底层 mesh gradient（网格渐变），多组径向渐变叠加模拟色块融合效果
- 主色调为蓝色系（#EFF6FF、#E0F2FE、#DBEAFE、#F0F9FF）+ 淡紫点缀（#EDE9FE、#F5F3FF）
- 仅在 `/unistake` 路由中使用，不影响 `/stake`

### Phase 2：UI 原子组件（4 个文件）

**Step 2.1 — `components/ui/ButtonPrimary.tsx`**
```
Props: children, onClick?, disabled?, className?
样式: h-[52px] md 下 / h-[48px] 移动, rounded-[12px]
      bg-gradient-to-b from-[#3B82F6] to-[#2563EB]
      text-white font-semibold text-[16px]
      hover: from-[#2563EB] to-[#1D4ED8]
      disabled: opacity-50 cursor-not-allowed
```

**Step 2.2 — `components/ui/ButtonSecondary.tsx`**
```
同 Props · 同尺寸
bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]
hover: bg-[#DBEAFE]
```

**Step 2.3 — `components/ui/InputField.tsx`**
```
Props: value, onChange, placeholder?, disabled?, className?
样式: h-[48px] rounded-[12px] px-4
      正常: bg-[var(--bg-input)]
      禁用: bg-[var(--bg-input-disabled)] opacity-60
      聚焦: ring-2 ring-[var(--accent-primary)]/30
      placeholder: text-[var(--text-tertiary)] text-[15px]
```

**Step 2.4 — `components/ui/InfoCard.tsx`**
```
Props: label, value
样式: p-4 rounded-[12px] bg-[var(--bg-info-card)]
      label: text-[13px] font-medium text-[var(--text-secondary)]
      value: text-[20px] font-bold text-[var(--text-primary)]
```

### Phase 3：布局组件（3 个文件）+ 钱包组件

**Step 3.1 — `components/wallet/WalletButton.tsx`**

使用 RainbowKit `ConnectButton.Custom` render prop：
- 未连接态：渐变药丸按钮 + wallet SVG 图标 + "Connect Wallet"（gradient #3B82F6→#60A5FA）
- 已连接态：浅灰药丸 — 绿色圆点(8px) + ETH余额 + 竖线分隔 + 地址缩写 + 渐变圆形头像(24px)
- 移动端：h-34, 字号 11-12px, 头像 20px
- 使用 `account.displayBalance` 和 `account.displayName` 获取数据

**Step 3.2 — `components/layout/Header.tsx`**
```
Props: activeTab: string, onTabChange: (tab: string) => void
```
- 毛玻璃: `bg-white/[0.73] backdrop-blur-[8px] shadow-sm`
- **桌面(md+)**: 单行 h-[64px], justify-between
  - 左: "UniStake" logo, text-[22px] font-extrabold accent-primary(#3B82F6)
  - 中: 两个 button（"Stake" / "Withdraw"），选中态 border-b-[3px] accent-primary(#3B82F6)
  - 右: WalletButton
- **移动(<md)**: 两行
  - 上 h-[52px]: Logo 左 + WalletButton 右
  - 下 h-[44px]: Tabs 居中

**Step 3.3 — `components/layout/Footer.tsx`**
- 毛玻璃 + `border-t border-[var(--border-light)]`
- 居中: GitHub SVG 图标 + "GitHub" 链接 + · + 版权文字
- 桌面 h-[56px] / 移动 h-[48px]
- 文字 text-[13px] (桌面) / text-[11px] (移动)

### Phase 4：业务组件（Hook + 2 个卡片）

**Step 4.1 — `unistake/hooks/useStaking.ts`**

从旧 `stake/page.tsx` 复制并重构业务逻辑：
- 所有 state: stakeAmount, pendingWithdrawAmount, availableWithdrawAmount, pendingRewards, inputAmount, unstakeAmount, loadingState
- 所有合约交互: handleStake, handleUnstake, handleWithdraw, handleClaim
- useEffect: 初始数据加载 + 合约事件监听 (Deposit, RequestUnstake, Withdraw)
- **改动点**: 移除 `debugger` 语句, 合约地址改读 `process.env.NEXT_PUBLIC_UNISTAKE_CONTRACT`

返回类型:
```typescript
interface UseStakingReturn {
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
}
```

**Step 4.2 — `unistake/StakeCard.tsx`**

毛玻璃卡片 + 渐变边框（gradient border 技巧）：
```tsx
{/* 外层渐变背景充当 1px border */}
<div className="rounded-[24px] md:rounded-[24px] p-px
  bg-gradient-to-br from-[#3B82F6]/25 via-[#93C5FD]/20 to-[#06B6D4]/20">
  {/* 内层毛玻璃卡片 */}
  <div className="rounded-[24px] bg-white/80 backdrop-blur-xl
    shadow-[0_8px_40px_rgba(59,130,246,0.1)]
    p-6 md:p-8 w-full md:w-[480px]">
    ...内容...
  </div>
</div>
```

内容结构（从上到下）：
1. DataArea: "Staked Amount" label(14px/500) + value(28px/700 桌面, 24px 移动)
2. Divider: `h-px bg-[var(--border-light)]`
3. InputArea: "Amount to Stake" label + InputField
4. ButtonArea: ButtonPrimary "Stake" + ButtonSecondary "Claim", gap-12 (桌面) / gap-10 (移动)

**Step 4.3 — `unistake/WithdrawCard.tsx`**

同样毛玻璃卡片，宽度 `md:w-[560px]`：
1. InfoCards: 桌面横排 `flex-row gap-3`，移动竖排 `flex-col gap-2`
2. Divider
3. Unstake 区: 标题(18px/600) + InputField + ButtonPrimary "Unstake"
4. Divider
5. Withdraw 区: 标题(18px/600) + InputField(disabled, 显示 availableWithdrawAmount) + ButtonPrimary "Withdraw"

### Phase 5：页面组装

**Step 5.1 — 新建 `unistake/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { PageBackground } from '@/app/components/layout/PageBackground';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { StakeCard } from './StakeCard';
import { WithdrawCard } from './WithdrawCard';
import { useStaking } from './hooks/useStaking';
import LoadingModal from '@/app/components/LoadingModal';

export default function UniStakePage() {
  const [activeTab, setActiveTab] = useState('stake');
  const staking = useStaking();

  return (
    <div className="relative min-h-screen flex flex-col font-[var(--font-inter)]">
      <PageBackground />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {activeTab === 'stake' ? (
          <StakeCard {...stakeProps} />
        ) : (
          <WithdrawCard {...withdrawProps} />
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
```

**Step 5.2 — 可选：更新首页重定向**

当前 `app/page.tsx` 重定向到 `/stake`。可暂不修改，待新页面验证完毕后再改为重定向到 `/unistake`。

---

## 注意事项

1. **旧页面保留**: `/stake` 路由下的所有文件（page.tsx, stake.module.css）完全不动
2. **globals.css 追加不覆盖**: 新 Design Tokens 追加在文件末尾，用注释块分隔，不影响旧页面样式
3. **字体共存**: Inter 和 Geist 字体同时加载，旧页面继续用 Geist，新页面用 Inter
4. **组件隔离**: 新通用组件放在 `components/ui/`, `components/layout/`, `components/wallet/`，不与旧 `components/LoadingModal.tsx` 冲突
5. **合约地址**: useStaking hook 中合约地址读取 `process.env.NEXT_PUBLIC_UNISTAKE_CONTRACT`，需确保 `.env.local` 已配置

---

## 验证方式

1. `npm run dev` 启动开发服务器
2. 浏览器打开 `http://localhost:3000/unistake` 查看新页面
3. 同时打开 `http://localhost:3000/stake` 确认旧页面未受影响
4. 逐项对照 pencil-stake.pen 设计稿截图：
   - Header 布局、毛玻璃效果、Tab 样式、钱包两态
   - 卡片圆角、阴影、渐变边框
   - 按钮渐变色、尺寸、hover 效果
   - 输入框样式、禁用态
   - 背景渐变 + 光晕效果
   - InfoCard 三列/竖排布局
5. 缩小浏览器窗口至 <768px 验证移动端响应式
6. 连接 MetaMask 测试钱包按钮两态 + 合约交互
7. `npm run build` 确认无编译错误
