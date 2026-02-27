// ─────────────────────────────────────────────────────────────────────────────
// BTC TIP JAR — OP_NET · Bitcoin Testnet
// Wallet: @btc-vision/walletconnect V2 (useWalletConnect hook)
// Data: localStorage (real, persisten, no dummy)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useWalletConnect } from "@btc-vision/walletconnect";

// ─── KONFIGURASI ──────────────────────────────────────────────────────────────
// Ganti dengan testnet Bitcoin address kamu (tb1...)
// Buka OP_WALLET → switch ke Testnet → copy address
const OWNER_ADDRESS = "bcrt1ptnwzw3czz7vy28fgx2530jq3v5qh2up2a4asa8zr046cgsst2fzqph6d4q";

// ─── SEND BITCOIN HELPER ──────────────────────────────────────────────────────
// Mencoba beberapa cara untuk kirim BTC:
// 1. walletInstance.sendBitcoin()  ← dari hook @btc-vision/walletconnect
// 2. window.opnet.sendBitcoin()    ← direct injection fallback
// 3. window.unisat.sendBitcoin()   ← unisat fallback
// Juga ada timeout 60 detik agar tidak loading selamanya
async function sendBitcoinSafe(walletInstance, toAddress, sats) {
  const timeoutMs = 60_000; // 60 detik timeout

  const withTimeout = (promise) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out (60s). Please try again.")), timeoutMs)
      ),
    ]);

  // Cara 1: walletInstance dari hook
  if (walletInstance && typeof walletInstance.sendBitcoin === "function") {
    console.log("[TipJar] Using walletInstance.sendBitcoin");
    try {
      const txid = await withTimeout(walletInstance.sendBitcoin(toAddress, sats));
      if (txid) return txid;
    } catch (e) {
      console.warn("[TipJar] walletInstance.sendBitcoin failed:", e.message);
      // Coba fallback berikutnya
    }
  }

  // Cara 2: window.opnet direct
  if (window.opnet && typeof window.opnet.sendBitcoin === "function") {
    console.log("[TipJar] Using window.opnet.sendBitcoin (fallback)");
    try {
      const txid = await withTimeout(window.opnet.sendBitcoin(toAddress, sats));
      if (txid) return txid;
    } catch (e) {
      console.warn("[TipJar] window.opnet.sendBitcoin failed:", e.message);
    }
  }

  // Cara 3: window.unisat fallback
  if (window.unisat && typeof window.unisat.sendBitcoin === "function") {
    console.log("[TipJar] Using window.unisat.sendBitcoin (fallback)");
    try {
      const txid = await withTimeout(window.unisat.sendBitcoin(toAddress, sats));
      if (txid) return txid;
    } catch (e) {
      console.warn("[TipJar] window.unisat.sendBitcoin failed:", e.message);
    }
  }

  throw new Error(
    "Could not send transaction. Make sure OP_WALLET is unlocked, set to Testnet, and you have enough tBTC."
  );
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const shortAddr = (addr) => {
  if (!addr || addr.length < 12) return addr || "???";
  return addr.slice(0, 8) + "..." + addr.slice(-6);
};
const timeAgo = (ts) => {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};
const satsToBtc = (sats) => (sats / 1e8).toFixed(5);
const btcToSats = (btc) => Math.round(parseFloat(btc) * 1e8);

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "btc_tipjar_v1";
const loadTips = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};
const persistTip = (tip) => {
  const next = [tip, ...loadTips()].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
const totalSats = (tips) => tips.reduce((s, t) => s + (t.sats || 0), 0);

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const C = {
  pink: "#ff2d78", cyan: "#00f5ff", green: "#39ff14",
  yellow: "#ffe600", purple: "#b400ff", bg: "#05000f",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@700&display=swap');

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }

  @keyframes pulseBtn {
    0%,100% { box-shadow: 0 0 14px #ff2d7888, 0 0 36px #ff2d7844; }
    50%     { box-shadow: 0 0 28px #ff2d78cc, 0 0 70px #ff2d7866; }
  }
  @keyframes slideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes flicker  { 0%,100%{opacity:1} 93%{opacity:.7} 96%{opacity:.9} }
  @keyframes glitch   {
    0%,88%,100% { text-shadow:-2px 0 #ff2d78,2px 0 #00f5ff; clip-path:none; }
    89% { clip-path:inset(20% 0 50% 0); text-shadow:3px 0 #ff2d78; }
    90% { clip-path:inset(55% 0 5% 0);  text-shadow:-3px 0 #00f5ff; }
    91% { clip-path:none; }
  }
  @keyframes confettiFall {
    0%   { transform:translateY(-10px) rotate(0deg);   opacity:1; }
    100% { transform:translateY(110vh) rotate(720deg); opacity:0; }
  }
  @keyframes gridScroll {
    from { background-position:0 0; }
    to   { background-position:40px 40px; }
  }
  @keyframes newBadge {
    0%  { transform:scale(.5); opacity:0; }
    60% { transform:scale(1.2); }
    100%{ transform:scale(1);  opacity:1; }
  }
  @keyframes progressBar {
    0%   { width: 0%; }
    100% { width: 100%; }
  }

  .tip-card { transition: border-color .3s, background .3s; }
  .tip-card:hover {
    border-color: rgba(0,245,255,.5) !important;
    background:   rgba(0,245,255,.07) !important;
  }
  .send-btn {
    animation: pulseBtn 2.5s ease-in-out infinite;
    transition: transform .15s, letter-spacing .2s;
  }
  .send-btn:hover {
    transform: scale(1.06); letter-spacing: 6px;
    animation: none;
    box-shadow: 0 0 50px #ff2d78, 0 0 100px #ff2d7888 !important;
  }
  .send-btn:active { transform: scale(.97); }
  .qbtn { transition: all .15s; }
  .qbtn:hover { filter: brightness(1.4); transform: scale(1.06); }
  .hover-cyan:hover { background: rgba(0,245,255,.1) !important; }
`;

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
const CONFETTI_COLS  = [C.pink, C.cyan, C.green, C.yellow, C.purple];
const CONFETTI_CHARS = ["▪","◆","▸","✦","★","⬡","▲","●"];
function Confetti({ active }) {
  const pieces = useRef(
    Array.from({ length: 55 }, (_, i) => ({
      id: i, left: Math.random() * 100,
      delay: Math.random() * 1.2, dur: 1.5 + Math.random() * 1.2,
      color: CONFETTI_COLS[i % CONFETTI_COLS.length],
      char: CONFETTI_CHARS[i % CONFETTI_CHARS.length],
      size: i % 4 === 0 ? 18 : 10,
    }))
  ).current;
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999, overflow:"hidden" }}>
      {pieces.map(p => (
        <span key={p.id} style={{
          position:"absolute", left:`${p.left}%`, top:"-20px",
          fontSize:`${p.size}px`, color:p.color,
          filter:`drop-shadow(0 0 5px ${p.color})`,
          animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }}>{p.char}</span>
      ))}
    </div>
  );
}

// ─── TIP CARD ─────────────────────────────────────────────────────────────────
function TipCard({ tip }) {
  const [hi, setHi] = useState(tip.isNew);
  useEffect(() => {
    if (tip.isNew) { const t = setTimeout(() => setHi(false), 4000); return () => clearTimeout(t); }
  }, []);
  const hue = ((tip.sender?.charCodeAt(4) || 0) * 17 + (tip.sender?.charCodeAt(5) || 0) * 7) % 360;
  return (
    <div className="tip-card" style={{
      background: hi ? "rgba(255,45,120,.07)" : "rgba(0,245,255,.03)",
      border:`1px solid ${hi ? C.pink : "rgba(0,245,255,.15)"}`,
      borderRadius:"4px", padding:"16px 20px 14px", marginBottom:"10px",
      position:"relative", overflow:"hidden",
      animation: tip.isNew ? "slideDown .35s ease" : "none",
      boxShadow: hi ? `0 0 24px ${C.pink}22` : "none",
      fontFamily:"'Share Tech Mono', monospace",
    }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"3px",
        background: hi ? `linear-gradient(to bottom,${C.pink},${C.purple})` : C.cyan,
        boxShadow:`0 0 8px ${hi ? C.pink : C.cyan}`,
      }}/>
      {hi && (
        <span style={{
          position:"absolute", top:"10px", right:"12px",
          background:C.pink, color:"#000", fontSize:"10px", fontWeight:900,
          padding:"2px 9px", borderRadius:"2px", letterSpacing:"2px",
          animation:"newBadge .4s ease", boxShadow:`0 0 10px ${C.pink}`,
          fontFamily:"'Share Tech Mono', monospace",
        }}>NEW</span>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{
            width:"26px", height:"26px", borderRadius:"3px", flexShrink:0,
            background:`hsl(${hue},80%,55%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"11px", fontWeight:900, color:"#000",
          }}>{(tip.sender?.[4] || "?").toUpperCase()}</div>
          <span style={{ color:C.cyan, fontSize:"12px" }}>{shortAddr(tip.sender)}</span>
        </div>
        <span style={{ color:"rgba(255,255,255,.2)", fontSize:"11px" }}>{timeAgo(tip.ts)}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px" }}>
        <p style={{ color:"#ccc", fontSize:"13px", lineHeight:1.5, flex:1 }}>
          <span style={{ color:C.cyan }}>{">"}</span> {tip.message}
        </p>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ color:C.green, fontSize:"19px", fontWeight:700, letterSpacing:"1px", filter:`drop-shadow(0 0 8px ${C.green})` }}>
            ₿{satsToBtc(tip.sats)}
          </div>
          {tip.txid && tip.txid !== "unknown" && (
            <a href={`https://mempool.space/testnet4/tx/${tip.txid}`} target="_blank" rel="noreferrer"
              style={{ color:"#444", fontSize:"10px", textDecoration:"none" }}>view tx ↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function TipModal({ onClose, onSent, senderAddress, walletInstance }) {
  const [amount,  setAmount]  = useState("");
  const [message, setMessage] = useState("");
  const [errors,  setErrors]  = useState({});
  const [step,    setStep]    = useState("form"); // "form" | "waiting" | "success"
  const [txid,    setTxid]    = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const QUICK = ["0.0001","0.0005","0.001","0.005"];

  // Elapsed timer saat waiting — tampilkan berapa detik sudah berlalu
  useEffect(() => {
    if (step === "waiting") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const validate = () => {
    const e = {};
    const n = parseFloat(amount);
    if (!amount || isNaN(n) || n <= 0) e.amount = "Enter a valid amount";
    if (n > 0.1) e.amount = "Max 0.1 tBTC per tip";
    if (!message.trim()) e.message = "Write a message!";
    if (message.length > 120) e.message = "Max 120 characters";
    return e;
  };

  const handleSend = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep("waiting");

    try {
      const sats = btcToSats(amount);
      // Pakai helper dengan fallback + timeout 60s
      const id = await sendBitcoinSafe(walletInstance, OWNER_ADDRESS, sats);
      setTxid(id || "unknown");
      onSent({ sats, message, txid: id || "unknown", sender: senderAddress });
      setStep("success");
    } catch (err) {
      console.error("[TipJar] Send error:", err);
      setErrors({ submit: err?.message || "Transaction failed." });
      setStep("form");
    }
  };

  const inp = (err) => ({
    width:"100%", background:"rgba(0,245,255,.04)",
    border:`1px solid ${err ? C.pink : "rgba(0,245,255,.2)"}`,
    borderRadius:"4px", padding:"13px 16px",
    color:"#fff", fontSize:"14px",
    fontFamily:"'Share Tech Mono', monospace", outline:"none",
  });

  const corners = [[false,false],[false,true],[true,false],[true,true]];

  return (
    <div onClick={e => e.target === e.currentTarget && step !== "waiting" && onClose()}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,15,.88)",
        backdropFilter:"blur(12px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        zIndex:1000, padding:"20px",
      }}>
      <div style={{
        width:"100%", maxWidth:"460px", background:"#080012",
        border:`1px solid ${step === "success" ? C.green : C.pink}`,
        borderRadius:"6px", padding:"36px 32px",
        animation:"slideDown .3s ease",
        boxShadow:`0 0 60px ${step === "success" ? C.green : C.pink}33`,
        fontFamily:"'Share Tech Mono', monospace",
        position:"relative", overflow:"hidden",
      }}>
        {/* Corner brackets */}
        {corners.map(([b,r],i) => (
          <div key={i} style={{
            position:"absolute",
            top:!b?0:"auto", bottom:b?0:"auto",
            left:!r?0:"auto", right:r?0:"auto",
            width:"14px", height:"14px",
            borderTop:    !b ? `2px solid ${C.cyan}` : "none",
            borderBottom:  b ? `2px solid ${C.cyan}` : "none",
            borderLeft:   !r ? `2px solid ${C.cyan}` : "none",
            borderRight:   r ? `2px solid ${C.cyan}` : "none",
          }}/>
        ))}

        {/* ── WAITING STATE ─────────────────────────────────────────────── */}
        {step === "waiting" && (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            {/* Spinner */}
            <div style={{
              width:"56px", height:"56px", margin:"0 auto 20px",
              border:`3px solid rgba(255,45,120,.2)`,
              borderTopColor:C.pink, borderRadius:"50%",
              animation:"spin 1s linear infinite",
              filter:`drop-shadow(0 0 12px ${C.pink})`,
            }}/>

            <h2 style={{ color:C.pink, fontSize:"18px", letterSpacing:"3px", marginBottom:"8px", filter:`drop-shadow(0 0 8px ${C.pink})` }}>
              AWAITING SIGNATURE
            </h2>
            <p style={{ color:"#555", fontSize:"12px", letterSpacing:"1px", marginBottom:"20px", lineHeight:1.6 }}>
              Check your OP_WALLET popup and <strong style={{ color:"#888" }}>approve the transaction</strong>.
            </p>

            {/* Progress bar */}
            <div style={{ background:"rgba(255,255,255,.05)", borderRadius:"2px", height:"3px", overflow:"hidden", marginBottom:"12px" }}>
              <div style={{
                height:"100%",
                background:`linear-gradient(90deg,${C.pink},${C.purple})`,
                animation:`progressBar 60s linear forwards`,
                boxShadow:`0 0 8px ${C.pink}`,
              }}/>
            </div>

            {/* Elapsed time */}
            <p style={{ color:"#333", fontSize:"11px", letterSpacing:"1px" }}>
              {elapsed}s elapsed · timeout at 60s
            </p>

            <div style={{
              marginTop:"20px", background:"rgba(255,230,0,.05)",
              border:`1px solid ${C.yellow}22`, borderRadius:"4px", padding:"10px 14px",
            }}>
              <p style={{ color:"#666", fontSize:"11px", lineHeight:1.6, letterSpacing:"0.5px" }}>
                💡 If no popup appeared, click the <span style={{ color:C.yellow }}>OP_WALLET</span> icon
                in your browser toolbar to find the pending request.
              </p>
            </div>
          </div>
        )}

        {/* ── SUCCESS STATE ──────────────────────────────────────────────── */}
        {step === "success" && (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:"48px", marginBottom:"14px", filter:`drop-shadow(0 0 20px ${C.green})` }}>⚡</div>
            <h2 style={{ color:C.green, fontSize:"20px", letterSpacing:"4px", marginBottom:"10px", filter:`drop-shadow(0 0 8px ${C.green})` }}>
              TIP SENT!
            </h2>
            <p style={{ color:"#555", fontSize:"12px", marginBottom:"20px", letterSpacing:"1px" }}>
              // Broadcast to Bitcoin testnet via OP_NET
            </p>
            {txid && txid !== "unknown" && (
              <div style={{ background:`${C.green}08`, border:`1px solid ${C.green}33`, borderRadius:"4px", padding:"10px 14px", marginBottom:"20px" }}>
                <p style={{ color:C.green, fontSize:"10px", marginBottom:"4px" }}>TXID:</p>
                <p style={{ color:"#666", fontSize:"11px", wordBreak:"break-all", marginBottom:"6px" }}>{txid}</p>
                <a href={`https://mempool.space/testnet4/tx/${txid}`} target="_blank" rel="noreferrer"
                  style={{ color:C.cyan, fontSize:"11px" }}>View on Mempool ↗</a>
              </div>
            )}
            <button onClick={onClose} style={{
              background:"transparent", border:`1px solid ${C.cyan}`, color:C.cyan,
              padding:"12px 32px", borderRadius:"4px", fontSize:"13px",
              cursor:"pointer", letterSpacing:"3px",
              fontFamily:"'Share Tech Mono', monospace",
            }}>[ CLOSE ]</button>
          </div>
        )}

        {/* ── FORM STATE ────────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            <div style={{ marginBottom:"28px" }}>
              <h2 style={{ fontSize:"20px", letterSpacing:"4px", color:C.pink, filter:`drop-shadow(0 0 10px ${C.pink})` }}>
                SEND A TIP
              </h2>
              <p style={{ color:"#444", fontSize:"11px", marginTop:"6px", letterSpacing:"1px" }}>
                // BITCOIN TESTNET · REAL TRANSACTION
              </p>
            </div>

            {/* Amount */}
            <div style={{ marginBottom:"20px" }}>
              <label style={{ display:"block", color:C.cyan, fontSize:"11px", letterSpacing:"2px", marginBottom:"8px" }}>
                AMOUNT (tBTC)
              </label>
              <div style={{ position:"relative" }}>
                <input type="number" placeholder="0.0001" value={amount}
                  onChange={e => { setAmount(e.target.value); setErrors(p => ({...p, amount:""})); }}
                  style={{ ...inp(errors.amount), paddingRight:"40px" }}
                />
                <span style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", color:C.green, fontSize:"16px" }}>₿</span>
              </div>
              {errors.amount && <p style={{ color:C.pink, fontSize:"11px", marginTop:"4px" }}>⚠ {errors.amount}</p>}
              <div style={{ display:"flex", gap:"6px", marginTop:"8px" }}>
                {QUICK.map(v => (
                  <button key={v} className="qbtn"
                    onClick={() => { setAmount(v); setErrors(p => ({...p, amount:""})); }}
                    style={{
                      flex:1, background: amount===v ? `${C.cyan}18` : "transparent",
                      border:`1px solid ${amount===v ? C.cyan : "#2a2a2a"}`,
                      color: amount===v ? C.cyan : "#555",
                      borderRadius:"3px", padding:"5px 2px", fontSize:"11px",
                      cursor:"pointer", fontFamily:"'Share Tech Mono', monospace",
                    }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom:"28px" }}>
              <label style={{ display:"block", color:C.cyan, fontSize:"11px", letterSpacing:"2px", marginBottom:"8px" }}>
                MESSAGE <span style={{ color:"#333" }}>({message.length}/120)</span>
              </label>
              <textarea rows={3} placeholder="// drop your message here..."
                value={message} maxLength={120}
                onChange={e => { setMessage(e.target.value); setErrors(p => ({...p, message:""})); }}
                style={{ ...inp(errors.message), resize:"none" }}
              />
              {errors.message && <p style={{ color:C.pink, fontSize:"11px", marginTop:"4px" }}>⚠ {errors.message}</p>}
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div style={{ background:`${C.pink}0d`, border:`1px solid ${C.pink}44`, borderRadius:"4px", padding:"12px 14px", marginBottom:"16px" }}>
                <p style={{ color:C.pink, fontSize:"12px", lineHeight:1.6 }}>⚠ {errors.submit}</p>
                {/* Hint jika error */}
                <p style={{ color:"#444", fontSize:"11px", marginTop:"6px", lineHeight:1.6 }}>
                  💡 Try: Open OP_WALLET → check network is <span style={{ color:C.yellow }}>Testnet</span> → make sure balance &gt; 0
                </p>
              </div>
            )}

            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={onClose} style={{
                flex:1, background:"transparent", border:"1px solid #2a2a2a",
                color:"#555", borderRadius:"4px", padding:"13px", fontSize:"13px",
                cursor:"pointer", letterSpacing:"2px",
                fontFamily:"'Share Tech Mono', monospace",
              }}>[ CANCEL ]</button>
              <button onClick={handleSend} style={{
                flex:2,
                background:`linear-gradient(135deg,${C.pink}dd,${C.purple}dd)`,
                border:`1px solid ${C.pink}`, color:"#fff", borderRadius:"4px",
                padding:"13px", fontSize:"14px", fontWeight:700,
                cursor:"pointer", letterSpacing:"3px",
                fontFamily:"'Share Tech Mono', monospace",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                boxShadow:`0 0 20px ${C.pink}55`,
              }}>
                ⚡ SEND BTC
              </button>
            </div>
            <p style={{ color:"#1a1a1a", fontSize:"10px", textAlign:"center", marginTop:"14px", letterSpacing:"1px" }}>
              // Sends real tBTC → {shortAddr(OWNER_ADDRESS)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── INSTALL BANNER ───────────────────────────────────────────────────────────
function InstallBanner() {
  return (
    <div style={{
      background:`${C.yellow}08`, border:`1px solid ${C.yellow}33`,
      borderRadius:"4px", padding:"16px 20px", marginBottom:"20px",
      fontFamily:"'Share Tech Mono', monospace",
    }}>
      <p style={{ color:C.yellow, fontSize:"12px", letterSpacing:"1px", marginBottom:"8px" }}>
        ⚠ OP_WALLET NOT DETECTED
      </p>
      <p style={{ color:"#555", fontSize:"12px", lineHeight:1.6 }}>
        Install OP_WALLET Chrome extension to connect and send tips.
      </p>
      <a href="https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb"
        target="_blank" rel="noreferrer"
        style={{ color:C.cyan, fontSize:"12px", display:"inline-block", marginTop:"8px" }}>
        → Install OP_WALLET ↗
      </a>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const {
    walletAddress,
    walletInstance,
    connecting,
    openConnectModal,
    disconnect,
    walletBalance,
    allWallets,
  } = useWalletConnect();

  const [tips,         setTips]         = useState(() => loadTips());
  const [showModal,    setShowModal]    = useState(false);
  const [showThanks,   setShowThanks]   = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [blockHeight,  setBlockHeight]  = useState("...");
  const idRef = useRef(Date.now());

  const opWalletInstalled = allWallets?.some(w => w.name === "OP_WALLET" && w.isInstalled) ?? false;

  // Fetch block height
  useEffect(() => {
    const f = () =>
      fetch("https://mempool.space/testnet4/api/blocks/tip/height")
        .then(r => r.text()).then(h => setBlockHeight(parseInt(h).toLocaleString())).catch(() => {});
    f();
    const iv = setInterval(f, 30000);
    return () => clearInterval(iv);
  }, []);

  const fireCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleTipSent = ({ sats, message, txid, sender }) => {
    const tip = {
      id: ++idRef.current,
      sender: sender || walletAddress || "unknown",
      sats, message, txid,
      ts: Date.now(), isNew: true,
    };
    setTips(persistTip(tip));
    setShowThanks(true);
    fireCelebration();
    setTimeout(() => setShowThanks(false), 6000);
  };

  const total = totalSats(tips);

  return (
    <div style={{
      minHeight:"100vh", width:"100%",
      background:C.bg, color:"#fff",
      fontFamily:"'Share Tech Mono', monospace",
      position:"relative", overflow:"hidden",
    }}>
      <style>{CSS}</style>
      <Confetti active={showConfetti} />

      {/* Grid background */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`
          linear-gradient(rgba(0,245,255,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,.04) 1px, transparent 1px)
        `,
        backgroundSize:"40px 40px", animation:"gridScroll 10s linear infinite",
      }}/>

      {/* Scanlines */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:1,
        background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px)",
      }}/>

      {/* Glow orbs */}
      <div style={{ position:"fixed", top:"-100px", left:"-100px", width:"500px", height:"500px", borderRadius:"50%", background:`radial-gradient(circle,${C.purple}16,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"fixed", bottom:"-100px", right:"-100px", width:"600px", height:"600px", borderRadius:"50%", background:`radial-gradient(circle,${C.pink}10,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>

      {/* STATUS BAR */}
      <div style={{
        position:"relative", zIndex:10, width:"100%",
        borderBottom:"1px solid rgba(0,245,255,.1)",
        background:"rgba(0,0,15,.8)", backdropFilter:"blur(12px)",
        padding:"8px 28px", display:"flex", justifyContent:"space-between", alignItems:"center",
        fontSize:"11px", letterSpacing:"1px", flexWrap:"wrap", gap:"8px",
      }}>
        <div style={{ display:"flex", gap:"20px", alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ color:C.cyan, filter:`drop-shadow(0 0 6px ${C.cyan})` }}>OP_NET</span>
          <span style={{ color:"#1e1e1e" }}>|</span>
          <span style={{ color:"#444" }}>BLK <span style={{ color:C.yellow }}>{blockHeight}</span></span>
          <span style={{ color:"#1e1e1e" }}>|</span>
          <span style={{ color:"#444" }}>NET <span style={{ color:C.green, filter:`drop-shadow(0 0 4px ${C.green})` }}>TESTNET</span></span>
          {walletAddress && walletBalance && (
            <>
              <span style={{ color:"#1e1e1e" }}>|</span>
              <span style={{ color:"#444" }}>BAL <span style={{ color:C.yellow }}>{satsToBtc(walletBalance.confirmed)} tBTC</span></span>
            </>
          )}
        </div>
        {walletAddress ? (
          <button onClick={disconnect} style={{
            background:"transparent", border:`1px solid rgba(255,45,120,.3)`,
            color:"#ff2d7888", borderRadius:"3px", padding:"3px 10px",
            fontSize:"10px", cursor:"pointer", letterSpacing:"1px",
            fontFamily:"'Share Tech Mono', monospace",
          }}>
            {shortAddr(walletAddress)} · DISCONNECT
          </button>
        ) : (
          <span style={{ color:C.pink, letterSpacing:"2px" }}>[ NOT CONNECTED ]</span>
        )}
      </div>

      {/* MAIN */}
      <div style={{ position:"relative", zIndex:10, maxWidth:"700px", margin:"0 auto", padding:"48px 20px 80px" }}>

        {/* HERO */}
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <div style={{ fontSize:"60px", marginBottom:"10px", filter:`drop-shadow(0 0 24px ${C.yellow})`, animation:"flicker 10s infinite" }}>₿</div>
          <h1 style={{ fontFamily:"'Rajdhani', sans-serif", fontWeight:700, fontSize:"clamp(36px,7vw,60px)", letterSpacing:"8px", marginBottom:"8px", animation:"flicker 8s infinite" }}>
            <span style={{ color:C.pink, animation:"glitch 5s infinite", display:"inline-block" }}>BTC</span>
            {" "}<span style={{ color:"#fff" }}>TIP JAR</span>
          </h1>
          <p style={{ color:"#333", fontSize:"12px", letterSpacing:"4px" }}>
            // POWERED BY <span style={{ color:C.cyan, filter:`drop-shadow(0 0 6px ${C.cyan})` }}>OP_NET</span> · BITCOIN TESTNET
          </p>

          {/* Stats */}
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginTop:"32px", flexWrap:"wrap" }}>
            {[
              { label:"TOTAL RAISED", value:`₿ ${satsToBtc(total)}`, color:C.green },
              { label:"TIPS COUNT",   value:tips.length,              color:C.cyan  },
              { label:"NETWORK",      value:"TESTNET",                color:C.pink  },
            ].map(s => (
              <div key={s.label} style={{
                background:"rgba(0,0,0,.55)", border:`1px solid ${s.color}28`,
                borderRadius:"4px", padding:"14px 24px", textAlign:"center", minWidth:"120px",
              }}>
                <div style={{ color:s.color, fontSize:"18px", fontWeight:700, filter:`drop-shadow(0 0 8px ${s.color})`, letterSpacing:"1px" }}>
                  {s.value}
                </div>
                <div style={{ color:"#2a2a2a", fontSize:"10px", marginTop:"4px", letterSpacing:"2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CONNECT / SEND */}
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          {!walletAddress ? (
            <>
              <button className="hover-cyan" onClick={openConnectModal} disabled={connecting}
                style={{
                  background:"transparent", border:`1px solid ${C.cyan}`,
                  color:C.cyan, borderRadius:"4px", padding:"11px 28px",
                  fontSize:"13px", letterSpacing:"2px", cursor:"pointer",
                  marginBottom:"20px", display:"inline-block",
                  fontFamily:"'Share Tech Mono', monospace",
                  boxShadow:`0 0 12px ${C.cyan}22`, transition:"background .2s",
                }}>
                {connecting
                  ? <><span style={{ animation:"blink .8s infinite", display:"inline-block" }}>█</span> CONNECTING...</>
                  : "[ CONNECT OP_WALLET ]"}
              </button>
              <br/>
            </>
          ) : (
            <>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                background:`${C.green}0d`, border:`1px solid ${C.green}33`,
                borderRadius:"4px", padding:"7px 18px",
                fontSize:"12px", color:C.green, marginBottom:"20px", letterSpacing:"1px",
              }}>
                <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:C.green, filter:`drop-shadow(0 0 4px ${C.green})`, animation:"blink 2s infinite", display:"inline-block" }}/>
                {shortAddr(walletAddress)} — CONNECTED
              </div>
              <br/>
            </>
          )}

          <button className="send-btn"
            onClick={() => walletAddress ? setShowModal(true) : openConnectModal()}
            style={{
              background:`linear-gradient(135deg,${C.pink},${C.purple})`,
              border:`1px solid ${C.pink}`, color:"#fff", borderRadius:"4px",
              padding:"22px 64px", fontSize:"22px", fontWeight:700,
              letterSpacing:"4px", cursor:"pointer",
              fontFamily:"'Rajdhani', sans-serif",
            }}>
            ⚡ SEND A TIP
          </button>

          {!walletAddress && (
            <p style={{ color:"#333", fontSize:"11px", marginTop:"12px", letterSpacing:"1px" }}>
              // Connect OP_WALLET first to send a real tip
            </p>
          )}
        </div>

        {!opWalletInstalled && !walletAddress && <InstallBanner />}

        {/* THANK YOU */}
        {showThanks && (
          <div style={{
            background:`linear-gradient(135deg,${C.green}0d,${C.cyan}0d)`,
            border:`1px solid ${C.green}55`, borderRadius:"4px",
            padding:"20px 24px", textAlign:"center", marginBottom:"24px",
            animation:"slideDown .4s ease", boxShadow:`0 0 30px ${C.green}22`,
          }}>
            <div style={{ fontSize:"28px", marginBottom:"8px", filter:`drop-shadow(0 0 12px ${C.green})` }}>⚡</div>
            <h3 style={{ color:C.green, letterSpacing:"4px", fontSize:"15px", filter:`drop-shadow(0 0 8px ${C.green})`, marginBottom:"8px" }}>
              TIP SENT SUCCESSFULLY
            </h3>
            <p style={{ color:"#444", fontSize:"11px", letterSpacing:"1px" }}>
              // Broadcast on Bitcoin Testnet · Thank you! 💛
            </p>
          </div>
        )}

        {/* TIP FEED */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px" }}>
            <h2 style={{ fontSize:"12px", letterSpacing:"4px", color:"#444", whiteSpace:"nowrap" }}>TIP FEED</h2>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg,${C.cyan}33,transparent)` }}/>
            <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:C.pink, letterSpacing:"1px" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.pink, filter:`drop-shadow(0 0 4px ${C.pink})`, animation:"blink 1.2s infinite", display:"inline-block" }}/>
              LIVE
            </div>
          </div>

          {tips.length === 0 ? (
            <div style={{
              textAlign:"center", padding:"60px 0",
              border:"1px solid rgba(0,245,255,.06)", borderRadius:"4px",
              color:"#2a2a2a", fontSize:"13px", letterSpacing:"2px",
            }}>
              <div style={{ fontSize:"32px", marginBottom:"16px", filter:"grayscale(1)" }}>🪙</div>
              // NO TIPS YET — BE THE FIRST ⚡
            </div>
          ) : tips.map(tip => <TipCard key={tip.id} tip={tip} />)}
        </div>

        <div style={{ textAlign:"center", marginTop:"48px", paddingTop:"24px", borderTop:"1px solid rgba(0,245,255,.07)" }}>
          <p style={{ color:"#1e1e1e", fontSize:"11px", letterSpacing:"2px" }}>
            // BTC TIP JAR · OP_NET · BITCOIN TESTNET · #opnetvibecode
          </p>
        </div>
      </div>

      {showModal && (
        <TipModal
          onClose={() => setShowModal(false)}
          onSent={handleTipSent}
          senderAddress={walletAddress}
          walletInstance={walletInstance}
        />
      )}
    </div>
  );
}