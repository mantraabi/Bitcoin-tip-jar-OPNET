# ⚡ BTC Tip Jar — Bitcoin Tip Jar on OP_NET

> A cyberpunk-styled Bitcoin tip jar dApp built on Bitcoin L1 via OP_NET. Send real testnet BTC tips with a message, powered by OP_WALLET.

![Bitcoin](https://img.shields.io/badge/Bitcoin-Testnet-orange?style=flat-square&logo=bitcoin)
![OP_NET](https://img.shields.io/badge/OP__NET-L1-cyan?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

- **Real Bitcoin transactions** — sends actual tBTC on testnet via OP_WALLET
- **Cyberpunk UI** — neon grid background, scanline overlay, glitch animations
- **Live tip feed** — all tips stored in `localStorage`, persists across sessions
- **Confetti celebration** — animated confetti every time a tip is sent
- **Wallet detection** — auto-detects OP_WALLET, shows install prompt if missing
- **Balance display** — shows connected wallet's testnet balance in the status bar
- **Transaction explorer** — each tip links to `mempool.space/testnet4` for verification
- **Responsive** — works on desktop and mobile browsers

---

## 🛠 Tech Stack

| Package | Purpose |
|---|---|
| `react@19` | UI framework |
| `@btc-vision/walletconnect` | OP_WALLET / UniSat integration |
| `vite` | Build tool |
| `localStorage` | Tip data persistence |
| `mempool.space API` | Live testnet block height |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- [OP_WALLET](https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb) Chrome extension installed
- Testnet BTC (get free tBTC from a testnet faucet)

### Installation

```bash
# Clone the repo
git clone https://github.com/mantraabi/Bitcoin-tip-jar-OPNET.git
cd btc-tip-jar

# Install dependencies
npm install

# Install React 19 (required by @btc-vision/walletconnect)
npm install react@^19 react-dom@^19

# Install OP_NET wallet library
npm install @btc-vision/walletconnect
```

### Configuration

Open `src/App.jsx` and set your Bitcoin testnet address as the tip recipient:

```js
// Line ~15 in src/App.jsx
const OWNER_ADDRESS = "tb1q...your_testnet_address_here...";
```

To get your testnet address:
1. Open OP_WALLET extension
2. Switch network to **Testnet**
3. Copy your `tb1...` address

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder — ready to deploy on Vercel, Netlify, or any static host.

---

## 📁 Project Structure

```
btc-tip-jar/
├── src/
│   ├── App.jsx          # Main app — all UI + wallet logic
│   ├── main.jsx         # Entry point with WalletConnectProvider
│   └── index.css        # Global CSS reset
├── vite.config.js       # Vite config (excludes walletconnect from optimizer)
├── index.html
├── package.json
└── README.md
```

---

## 🔌 How OP_WALLET Integration Works

This app uses `@btc-vision/walletconnect` V2 API:

```jsx
import { useWalletConnect } from "@btc-vision/walletconnect";

const {
  walletAddress,    // Connected wallet address
  walletInstance,   // Raw wallet — has .sendBitcoin()
  connecting,       // Loading state
  openConnectModal, // Opens wallet selection modal
  disconnect,       // Disconnect wallet
  walletBalance,    // { confirmed, total, ... } in satoshis
  allWallets,       // List of supported wallets + install status
} = useWalletConnect();
```

Sending a tip:

```js
// walletInstance.sendBitcoin(toAddress, satoshis)
const txid = await walletInstance.sendBitcoin(OWNER_ADDRESS, 10000); // 10,000 sats
```

---

## 💾 Data Persistence

Tips are stored in `localStorage` under the key `btc_tipjar_v1` as a JSON array. No backend or database required.

```json
[
  {
    "id": 1234567890,
    "sender": "tb1q8abc...xyz",
    "sats": 10000,
    "message": "Keep building! 🚀",
    "txid": "abc123...",
    "ts": 1709000000000,
    "isNew": false
  }
]
```

---

## ⚠️ Important Notes

- This app runs on **Bitcoin Testnet** — no real money is involved
- Make sure OP_WALLET is set to **Testnet** before connecting
- Get free testnet BTC from [https://faucet.opnet.org](https://faucet.opnet.org) or any Bitcoin testnet4 faucet
- The `vite.config.js` must have `optimizeDeps: { exclude: ['@btc-vision/walletconnect'] }` — without this, Vite will throw build errors

---

## 🔧 Troubleshooting

**Error: `Could not resolve "./context/WalletConnectContext"`**
→ Make sure `vite.config.js` has `optimizeDeps: { exclude: ['@btc-vision/walletconnect'] }`

**Error: React peer dependency conflict**
→ Run `npm install react@^19 react-dom@^19`

**OP_WALLET not detected**
→ Install the extension from Chrome Web Store and refresh the page

**Transaction fails**
→ Make sure your wallet is on Testnet network and has sufficient tBTC balance

---

## 🏆 Submission

This project was built for the **[OP_NET Vibecoding Challenge](https://vibecode.finance/challenge)** — Week 1: *Bitcoin Activated*.

- **Category:** Tip Bot / dApp
- **Network:** Bitcoin Testnet via OP_NET
- **Hashtag:** [#opnetvibecode](https://x.com/search?q=%23opnetvibecode)

---

## 📄 License

MIT © 2026 — feel free to fork and build on top of this.

---

<p align="center">
  Built with ⚡ on <strong>Bitcoin L1</strong> · Powered by <strong>OP_NET</strong>
</p>