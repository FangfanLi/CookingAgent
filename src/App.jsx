import { useState, useEffect } from "react";

// ── Popular creators ─────────────────────────────────────────────────────────
const POPULAR_YOUTUBE_EN = [
  { name: "Joshua Weissman",    id: "UChBEbMKI1eCcejTtmI32UEw" },
  { name: "Ethan Chlebowski",   id: "UCDq5v10l4wkV5-ZBIJJFbzQ" },
  { name: "Internet Shaquille", id: "UCRIZtNkuoXM-pHZDIABfmIg" },
  { name: "Adam Ragusea",       id: "UC9_p50tH3WmMslWRWKnM7dQ" },
  { name: "Pro Home Cooks",     id: "UCzH5n3Ih5kgQoiDAQt2FwLw" },
  { name: "Alex French Guy",    id: "UCl3DmLIQFPxeRRkqnBpE5qQ" },
];

const POPULAR_YOUTUBE_ZH = [
  { name: "王刚 Chef Wang Gang",          id: "chefwang" },
  { name: "老饭骨",                        id: "LaoFanGu" },
  { name: "小高姐的Magic Ingredients",    id: "magicingredients" },
  { name: "尚食厨房",                      id: "shangshikitchen" },
  { name: "酒满饭宝",                      id: "hkchefpo" },
];

const POPULAR_BILIBILI = [
  { name: "王刚 Chef Wang Gang", id: "wang-gang" },
  { name: "曼食慢语 ManCook",    id: "mancook" },
  { name: "日食记 Ririshiji",    id: "ririshiji" },
  { name: "大厨江一舟",          id: "jiangYiZhou" },
  { name: "美食作家王刚",        id: "wanggang2" },
  { name: "朱一旦的枯燥生活",    id: "zhuyidan" },
];

// ── i18n ─────────────────────────────────────────────────────────────────────
const I18N = {
  en: {
    badge: "🍳 Weekly Meal Planner",
    h1: ["Cook like", "your favorites."],
    sub: "Add your cooking creators → get a full week of meals & groceries",
    apiLabel: "Anthropic API Key",
    apiSaved: "✓ Saved",
    apiSetup: "Set up →",
    apiHide: "Hide",
    apiDesc: <>Free key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c87020" }}>console.anthropic.com</a> → API Keys → Create Key. ~$0.03/plan.</>,
    apiSaveBtn: "Save",
    apiChange: "Change",
    apiPlaceholder: "sk-ant-api03-...",
    apiError: "Key should start with sk-ant-...",
    ytSection: "YouTube Creators",
    ytQuickAdd: "Quick add:",
    ytPlaceholder: "Paste YouTube URL or @handle…",
    biliSection: "Bilibili Creators",
    biliQuickAdd: "Quick add:",
    biliPlaceholder: "Paste Bilibili URL, UID, or type a name…",
    addBtn: "Add",
    noCreators: "None added yet",
    generateBtn: "Generate My Weekly Plan →",
    previewBtn: "👀 Preview sample",
    loadingTitle: "Cooking up your plan…",
    loadingMsgs: ["Scanning your creators…","Pulling recent video ideas…","Analyzing recipes…","Building grocery list…","Almost ready…"],
    resultTitle: "Your Weekly Plan",
    newPlan: "← New Plan",
    save: "↓ Save",
    regenerate: "↺ Regenerate",
    needKey: "Please save your API key first.",
    needCreator: "Add at least one creator.",
    prompt: (yt, bili) => {
      const parts = [];
      if (yt.length)   parts.push(`YouTube creators: ${yt.join(", ")}`);
      if (bili.length) parts.push(`Bilibili creators: ${bili.join(", ")}`);
      return `You are a weekly meal planning assistant. The user follows these cooking creators:\n${parts.join("\n")}\n\nBased on their typical style and recipes, generate a practical weekly meal plan. Respond entirely in English.\n\n## 🗓️ Your Week in Food\n(5 meals Mon–Fri. Each: meal name, creator inspired in italics, one-sentence description, cook time, difficulty)\n\n## 🛒 Grocery List\n(Sections: Produce, Proteins, Dairy & Fridge, Pantry, Condiments & Spices. Include quantities.)\n\n## ⚡ Prep Tips\n(3 batch-prep tips to save time)\n\n## ⭐ Chef's Pick\n(Best dish to start with and why, 2–3 sentences)\n\nUse ## ### ** and - for markdown. Be specific and enthusiastic.`;
    },
  },
  zh: {
    badge: "🍳 每周食谱规划",
    h1: ["跟着喜欢的", "美食博主做饭。"],
    sub: "添加你喜欢的美食博主 → 获取一周食谱和购物清单",
    apiLabel: "Anthropic API 密钥",
    apiSaved: "✓ 已保存",
    apiSetup: "设置 →",
    apiHide: "收起",
    apiDesc: <>在 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c87020" }}>console.anthropic.com</a> 免费获取密钥。每次约 ¥0.20。</>,
    apiSaveBtn: "保存",
    apiChange: "更换",
    apiPlaceholder: "sk-ant-api03-...",
    apiError: "密钥应以 sk-ant- 开头",
    ytSection: "YouTube 博主",
    ytQuickAdd: "快速添加：",
    ytPlaceholder: "粘贴 YouTube 链接或 @handle…",
    biliSection: "B站博主",
    biliQuickAdd: "快速添加：",
    biliPlaceholder: "粘贴B站链接、UID 或直接输入博主名…",
    addBtn: "添加",
    noCreators: "还没有添加博主",
    generateBtn: "生成本周食谱 →",
    previewBtn: "👀 查看示例食谱",
    loadingTitle: "正在为你规划本周食谱…",
    loadingMsgs: ["分析博主风格…","整理近期视频菜谱…","分析食材和技巧…","生成购物清单…","马上好了…"],
    resultTitle: "本周食谱",
    newPlan: "← 重新规划",
    save: "↓ 保存",
    regenerate: "↺ 重新生成",
    needKey: "请先保存 API 密钥。",
    needCreator: "请至少添加一位博主。",
    prompt: (yt, bili) => {
      const parts = [];
      if (yt.length)   parts.push(`YouTube博主：${yt.join("、")}`);
      if (bili.length) parts.push(`B站博主：${bili.join("、")}`);
      return `你是一位每周食谱规划助手。用户关注了以下美食博主：\n${parts.join("\n")}\n\n请根据这些博主的风格和菜谱，生成一份实用的一周食谱。请完全用中文回答。\n\n## 🗓️ 本周食谱\n（周一至周五5道菜。每道：菜名、灵感博主斜体、一句话描述、时间、难度）\n\n## 🛒 购物清单\n（分类：蔬菜水果、肉类海鲜、蛋奶豆制品、干货主食、调味料。注明用量。）\n\n## ⚡ 备餐小技巧\n（3条节省时间的建议）\n\n## ⭐ 本周首推\n（最值得先做的菜及原因，2-3句）\n\n使用 ## ### ** 和 - 列表格式，内容具体实用。`;
    },
  },
};

// ── Sample plans ─────────────────────────────────────────────────────────────
const SAMPLE_EN = `## 🗓️ Your Week in Food

### Monday — Smash Burgers with Special Sauce
*Inspired by Joshua Weissman*
Crispy-edged patties on brioche with tangy mayo-pickle sauce. 25 min · Easy

### Tuesday — High-Protein Chicken Bowl
*Inspired by Ethan Chlebowski*
Marinated thighs over seasoned rice with quick cucumber salad. 30 min · Easy

### Wednesday — Creamy Tuscan Pasta
*Inspired by Internet Shaquille*
Sun-dried tomatoes, spinach, and parmesan in silky cream sauce. 20 min · Easy

### Thursday — Sheet Pan Salmon
*Inspired by Adam Ragusea*
Miso-glazed salmon with roasted broccolini and lemon. 35 min · Medium

### Friday — Homemade Pizza Night
*Inspired by Pro Home Cooks*
72-hour cold-ferment dough with fresh mozzarella and basil. 20 min active · Medium

---

## 🛒 Grocery List

**Produce**
- 2 heads garlic · 1 lemon · 1 bag spinach · 2 cucumbers · 1 head broccolini · fresh basil

**Proteins**
- 1 lb ground beef (80/20) · 4 chicken thighs · 2 salmon fillets

**Dairy & Fridge**
- Fresh mozzarella · Parmesan block · Heavy cream · Brioche buns · Eggs

**Pantry**
- Rigatoni · Long-grain rice · Pizza flour (00) · Active dry yeast · Sun-dried tomatoes

**Condiments & Spices**
- Mayo · Dill pickles · Smoked paprika · Red pepper flakes · Miso paste

---

## ⚡ Prep Tips

1. **Sunday batch:** Cook rice and marinate chicken overnight — saves 15 min Tuesday.
2. **Start pizza dough Friday morning** — cold ferment is hands-off, just 10 min active.
3. **Double the burger sauce** — keeps a week, doubles as dressing or dip.

---

## ⭐ Chef's Pick

**Start with the Smash Burgers.** Fast, satisfying, and the smashing technique is a revelation. Nail that and you'll feel great the rest of the week.`;

const SAMPLE_ZH = `## 🗓️ 本周食谱

### 周一 — 红烧肉
*灵感来自 王刚 Chef Wang Gang*
五花肉慢炖至软糯，色泽红亮，米饭绝配。约60分钟 · 中等难度

### 周二 — 番茄炒蛋盖饭
*灵感来自 日食记 Ririshiji*
经典家常菜，酸甜适口，10分钟快手搞定。约15分钟 · 简单

### 周三 — 蒜蓉粉丝蒸虾
*灵感来自 曼食慢语 ManCook*
鲜虾蒸至嫩滑，蒜香四溢，摆盘精致。约25分钟 · 简单

### 周四 — 麻婆豆腐
*灵感来自 大厨江一舟*
川味麻辣，豆腐嫩滑，下饭神器。约20分钟 · 中等难度

### 周五 — 葱油拌面
*灵感来自 美食作家王刚*
焦香葱油拌上劲道面条，简单却令人难忘。约15分钟 · 简单

---

## 🛒 购物清单

**蔬菜水果**
- 番茄 3个 · 大葱 2根 · 大蒜 1头 · 姜 1块 · 小葱适量

**肉类海鲜**
- 五花肉 500g · 鲜虾 300g · 鸡蛋 4个

**蛋奶豆制品**
- 嫩豆腐 2盒 · 粉丝 1把

**干货主食**
- 碱水面 300g · 白米适量

**调味料**
- 豆瓣酱 · 生抽 · 老抽 · 料酒 · 花椒 · 辣椒面 · 香油

---

## ⚡ 备餐小技巧

1. **提前炸好葱油** — 冰箱冷藏一周，周五拌面直接用。
2. **红烧肉建议翻倍** — 多做一份冷冻，下周直接加热省时省力。
3. **葱姜蒜提前处理** — 切好装盒冷藏，每天烹饪直接取用。

---

## ⭐ 本周首推

**从红烧肉开始（周一）。** 王刚老师的步骤清晰，掌握火候和上色技巧后你会对家常炖菜充满信心。满屋飘香，绝对值得。`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseYT(val) {
  if (val.includes("youtube.com/@"))      return "@" + val.split("youtube.com/@")[1].split(/[/?]/)[0];
  if (val.includes("youtube.com/c/"))     return val.split("youtube.com/c/")[1].split(/[/?]/)[0];
  if (val.includes("youtube.com/channel/")) return val.split("youtube.com/channel/")[1].split(/[/?]/)[0];
  return val.trim();
}
function parseBili(val) {
  if (val.includes("space.bilibili.com/")) return "UID:" + val.split("space.bilibili.com/")[1].split(/[/?]/)[0];
  if (val.includes("bilibili.com/@"))     return val.split("bilibili.com/@")[1].split(/[/?]/)[0];
  return val.trim();
}

function Grain() {
  return (
    <svg style={{ position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.035,pointerEvents:"none",zIndex:0 }}>
      <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#g)"/>
    </svg>
  );
}

function parseMd(text) {
  const out = []; let k = 0;
  for (const line of text.split("\n")) {
    if (line.startsWith("### "))           out.push(<h3 key={k++} style={{color:"#f5c842",fontFamily:"Georgia,serif",fontSize:18,margin:"22px 0 3px",fontWeight:700}}>{line.slice(4)}</h3>);
    else if (line.startsWith("## "))       out.push(<h2 key={k++} style={{color:"#ff8c42",fontFamily:"Georgia,serif",fontSize:21,margin:"28px 0 10px",borderBottom:"1px solid #2a2010",paddingBottom:7}}>{line.slice(3)}</h2>);
    else if (/^\*\*.*\*\*$/.test(line))   out.push(<p  key={k++} style={{color:"#e8d5a3",fontFamily:"sans-serif",fontWeight:700,fontSize:13,margin:"12px 0 3px",textTransform:"uppercase",letterSpacing:1}}>{line.slice(2,-2)}</p>);
    else if (line.startsWith("- "))        out.push(<p  key={k++} style={{color:"#c4a96e",fontFamily:"sans-serif",fontSize:14,margin:"2px 0 2px 12px",lineHeight:1.6}}>· {line.slice(2)}</p>);
    else if (/^\*[^*].*[^*]\*$/.test(line)) out.push(<p key={k++} style={{color:"#7a6a4a",fontFamily:"sans-serif",fontStyle:"italic",fontSize:13,margin:"0 0 5px"}}>{line.slice(1,-1)}</p>);
    else if (line.match(/^\d+\./))         out.push(<p  key={k++} style={{color:"#b09a72",fontFamily:"sans-serif",fontSize:14,margin:"5px 0",lineHeight:1.7}}>{line}</p>);
    else if (line === "---")               out.push(<hr key={k++} style={{border:"none",borderTop:"1px solid #2a2010",margin:"18px 0"}}/>);
    else if (line.trim())                  out.push(<p  key={k++} style={{color:"#b09a72",fontFamily:"sans-serif",fontSize:14,margin:"3px 0",lineHeight:1.7}}>{line}</p>);
  }
  return out;
}

// ── Reusable platform input row ───────────────────────────────────────────────
function PlatformInput({ placeholder, addLabel, accentColor, onAdd }) {
  const [val, setVal] = useState("");
  const commit = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(""); }
  };
  return (
    <div style={{ display:"flex", gap:8, marginBottom:12 }}>
      <input
        style={{ flex:1, background:"#0f0c05", border:`1px solid ${accentColor}33`, borderRadius:9, padding:"10px 14px", color:"#e8d5a3", fontFamily:"sans-serif", fontSize:14, outline:"none" }}
        placeholder={placeholder} value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && commit()}
      />
      <button style={{ background:`linear-gradient(135deg,${accentColor}cc,${accentColor})`, border:"none", borderRadius:9, padding:"10px 18px", color:"#fff", fontFamily:"sans-serif", fontWeight:800, fontSize:13, cursor:"pointer" }}
        onClick={commit}>{addLabel}</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,       setLang]       = useState("en");
  const t = I18N[lang];
  const SAMPLE = lang === "zh" ? SAMPLE_ZH : SAMPLE_EN;
  const POPULAR_YOUTUBE = lang === "zh" ? POPULAR_YOUTUBE_ZH : POPULAR_YOUTUBE_EN;

  const [apiKey,       setApiKey]       = useState("");
  const [apiKeySaved,  setApiKeySaved]  = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);

  const [ytList,   setYtList]   = useState([]);
  const [biliList, setBiliList] = useState([]);

  const [stage,      setStage]      = useState("setup");
  const [result,     setResult]     = useState("");
  const [error,      setError]      = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("anthro_key");
    if (saved) { setApiKey(saved); setApiKeySaved(true); }
  }, []);

  const saveKey = () => {
    if (!apiKey.startsWith("sk-ant-")) { setError(t.apiError); return; }
    sessionStorage.setItem("anthro_key", apiKey);
    setApiKeySaved(true); setShowKeySetup(false); setError("");
  };

  const addYt   = (raw) => { const d = parseYT(raw);   if (d && !ytList.find(c=>c.d===d))   setYtList(p=>[...p,{raw,d}]); };
  const addBili = (raw) => { const d = parseBili(raw); if (d && !biliList.find(c=>c.d===d)) setBiliList(p=>[...p,{raw,d}]); };

  const totalCreators = ytList.length + biliList.length;

  const generate = async () => {
    if (!apiKeySaved)     { setError(t.needKey);     return; }
    if (!totalCreators)   { setError(t.needCreator); return; }
    setError(""); setStage("generating");
    const msgs = t.loadingMsgs; let mi = 0; setLoadingMsg(msgs[0]);
    const iv = setInterval(() => { mi = Math.min(mi+1, msgs.length-1); setLoadingMsg(msgs[mi]); }, 2200);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, messages:[{ role:"user", content:t.prompt(ytList.map(c=>c.d), biliList.map(c=>c.d)) }] }),
      });
      clearInterval(iv);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message||"API error"); }
      const data = await res.json();
      setResult(data.content.map(b=>b.text||"").join(""));
      setStage("result");
    } catch(e) { clearInterval(iv); setError(e.message); setStage("setup"); }
  };

  // ── Chip list component ───────────────────────────────────────────────────
  const ChipList = ({ items, onRemove, chipColor, chipBg, chipBorder }) =>
    items.length > 0 ? (
      <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:4 }}>
        {items.map(c => (
          <div key={c.raw} style={{ display:"inline-flex", alignItems:"center", gap:7, background:chipBg, border:`1px solid ${chipBorder}`, borderRadius:99, padding:"5px 10px 5px 13px", fontFamily:"sans-serif", fontSize:13, color:chipColor }}>
            <span>{c.d}</span>
            <button onClick={() => onRemove(c.raw)} style={{ background:"none", border:"none", color:chipBorder, cursor:"pointer", padding:0, fontSize:15, lineHeight:1 }}>×</button>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ textAlign:"center", padding:"12px 0", color:"#3a2a10", fontFamily:"sans-serif", fontSize:13 }}>{t.noCreators}</div>
    );

  // ── Shared card style ─────────────────────────────────────────────────────
  const card   = { background:"rgba(20,15,5,0.85)", borderRadius:14, padding:"20px", marginBottom:12, backdropFilter:"blur(8px)" };
  const input  = { width:"100%", background:"#0f0c05", border:"1px solid #2a1f0a", borderRadius:10, padding:"11px 15px", color:"#e8d5a3", fontFamily:"sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const btn    = { background:"linear-gradient(135deg,#c87020,#e8a030)", border:"none", borderRadius:10, padding:"11px 20px", color:"#0c0a06", fontFamily:"sans-serif", fontWeight:800, fontSize:14, cursor:"pointer" };
  const ghost  = { background:"transparent", border:"1px solid #2a1f0a", borderRadius:10, padding:"9px 16px", color:"#6a5a3a", fontFamily:"sans-serif", fontSize:13, cursor:"pointer" };
  const bigBtn = { width:"100%", padding:"15px", fontSize:16, borderRadius:12, background:"linear-gradient(135deg,#c87020,#e8a030)", border:"none", color:"#0c0a06", fontFamily:"Georgia,serif", fontWeight:900, cursor:"pointer" };
  const label  = { fontFamily:"sans-serif", fontSize:11, color:"#6a5a3a", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8, display:"block" };
  const qLabel = (color) => ({ fontSize:11, color, fontFamily:"sans-serif", marginBottom:7 });
  const qBtn   = (added, color) => ({ background: added?"#051a0a":"#0f0c05", border:`1px solid ${added?"#1a5a2a":"#2a1f0a"}`, borderRadius:99, padding:"5px 12px", fontFamily:"sans-serif", fontSize:12, color:added?"#4caf50":color, cursor:added?"default":"pointer", transition:"all 0.15s" });

  return (
    <div style={{ minHeight:"100vh", background:"#0c0a06", position:"relative", overflow:"hidden" }}>
      <Grain />
      <div style={{ position:"fixed", top:-200, left:"50%", transform:"translateX(-50%)", width:700, height:400, background:"radial-gradient(ellipse,rgba(200,120,30,0.12) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      <div style={{ position:"relative", zIndex:1, maxWidth:680, margin:"0 auto", padding:"0 20px 80px" }}>

        {/* Lang toggle */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, paddingTop:28, marginBottom:4 }}>
          {["en","zh"].map(l => (
            <button key={l} onClick={() => { setLang(l); setYtList([]); setBiliList([]); setError(""); }}
              style={{ padding:"5px 16px", borderRadius:99, border:`2px solid ${lang===l?"#c87020":"#2a1f0a"}`, background:lang===l?"#1f0f00":"transparent", color:lang===l?"#c87020":"#4a3a1a", fontFamily:"sans-serif", fontSize:13, cursor:"pointer" }}>
              {l==="en"?"🇺🇸 English":"🇨🇳 中文"}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"28px 0" }}>
          <div style={{ display:"inline-block", background:"#1a1200", border:"1px solid #3d2800", borderRadius:99, padding:"4px 14px", fontSize:12, color:"#c87020", fontFamily:"sans-serif", letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>{t.badge}</div>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(30px,6vw,50px)", color:"#f5e6c8", margin:0, lineHeight:1.15, fontWeight:900 }}>{t.h1[0]}<br/>{t.h1[1]}</h1>
          <p style={{ color:"#6a5a3a", fontFamily:"sans-serif", fontSize:15, marginTop:10 }}>{t.sub}</p>
        </div>

        {stage === "setup" && (
          <>
            {/* API Key card */}
            <div style={card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ ...label, margin:0 }}>{t.apiLabel}</span>
                {apiKeySaved
                  ? <span style={{ background:"#0a1f0a", border:"1px solid #1a4a1a", borderRadius:99, padding:"3px 12px", fontSize:12, color:"#4caf50", fontFamily:"sans-serif" }}>{t.apiSaved}</span>
                  : <button style={{ ...ghost, fontSize:12, padding:"4px 10px", color:"#c87020", borderColor:"#3d2800" }} onClick={() => setShowKeySetup(s=>!s)}>{showKeySetup?t.apiHide:t.apiSetup}</button>
                }
              </div>
              {!apiKeySaved && showKeySetup && (
                <>
                  <p style={{ color:"#6a5a3a", fontFamily:"sans-serif", fontSize:13, lineHeight:1.6, margin:"0 0 10px" }}>{t.apiDesc}</p>
                  <div style={{ display:"flex", gap:10 }}>
                    <input style={{ ...input, flex:1 }} type="password" placeholder={t.apiPlaceholder} value={apiKey}
                      onChange={e=>setApiKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveKey()} />
                    <button style={btn} onClick={saveKey}>{t.apiSaveBtn}</button>
                  </div>
                </>
              )}
              {apiKeySaved && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"monospace", fontSize:13, color:"#3d2800" }}>sk-ant-••••••••••••••••••••</span>
                  <button style={{ ...ghost, fontSize:12, padding:"4px 10px" }} onClick={() => { setApiKeySaved(false); setShowKeySetup(true); }}>{t.apiChange}</button>
                </div>
              )}
            </div>

            {/* ▶️ YouTube panel */}
            <div style={{ ...card, border:"1px solid #3a1a1a" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:20 }}>▶️</span>
                <span style={{ fontFamily:"sans-serif", fontSize:13, fontWeight:700, color:"#ff5555", textTransform:"uppercase", letterSpacing:1 }}>{t.ytSection}</span>
                {ytList.length > 0 && <span style={{ marginLeft:"auto", background:"#1f0505", border:"1px solid #5a1a1a", borderRadius:99, padding:"2px 10px", fontSize:12, color:"#ff7777", fontFamily:"sans-serif" }}>{ytList.length}</span>}
              </div>

              <div style={qLabel("#5a3a2a")}>{t.ytQuickAdd}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
                {POPULAR_YOUTUBE.map(c => {
                  const added = !!ytList.find(x=>x.d===c.name);
                  return <button key={c.id} onClick={()=>!added&&addYt(c.name)} style={qBtn(added,"#7a4a3a")}>{added?"✓ ":"+ "}{c.name}</button>;
                })}
              </div>

              <PlatformInput placeholder={t.ytPlaceholder} addLabel={t.addBtn} accentColor="#cc3333" onAdd={addYt} />

              <ChipList items={ytList} onRemove={raw=>setYtList(p=>p.filter(c=>c.raw!==raw))}
                chipColor="#ff7777" chipBg="#1a0505" chipBorder="#5a1a1a" />
            </div>

            {/* 📺 Bilibili panel — Chinese only */}
            {lang === "zh" && <>
            <div style={{ ...card, border:"1px solid #0a2a3a" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:20 }}>📺</span>
                <span style={{ fontFamily:"sans-serif", fontSize:13, fontWeight:700, color:"#00b4d8", textTransform:"uppercase", letterSpacing:1 }}>{t.biliSection}</span>
                {biliList.length > 0 && <span style={{ marginLeft:"auto", background:"#05151f", border:"1px solid #1a4a5a", borderRadius:99, padding:"2px 10px", fontSize:12, color:"#66ccee", fontFamily:"sans-serif" }}>{biliList.length}</span>}
              </div>

              <div style={qLabel("#1a3a4a")}>{t.biliQuickAdd}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>
                {POPULAR_BILIBILI.map(c => {
                  const added = !!biliList.find(x=>x.d===c.name);
                  return <button key={c.id} onClick={()=>!added&&addBili(c.name)}
                    style={{ background:added?"#051a0a":"#05101a", border:`1px solid ${added?"#1a4a2a":"#0a2a3a"}`, borderRadius:99, padding:"5px 12px", fontFamily:"sans-serif", fontSize:12, color:added?"#4caf50":"#3a7a9a", cursor:added?"default":"pointer" }}>
                    {added?"✓ ":"+ "}{c.name}
                  </button>;
                })}
              </div>

              <PlatformInput placeholder={t.biliPlaceholder} addLabel={t.addBtn} accentColor="#0088aa" onAdd={addBili} />

              <ChipList items={biliList} onRemove={raw=>setBiliList(p=>p.filter(c=>c.raw!==raw))}
                chipColor="#66ccee" chipBg="#05151f" chipBorder="#1a4a5a" />
            </div>
            </>}

            {error && <div style={{ background:"#1a0800", border:"1px solid #5a1a00", borderRadius:10, padding:"10px 14px", color:"#ff6b35", fontFamily:"sans-serif", fontSize:13, marginBottom:12 }}>⚠ {error}</div>}

            <button style={{ ...bigBtn, opacity: totalCreators>0&&apiKeySaved?1:0.4, marginBottom:10 }}
              onClick={generate} disabled={!totalCreators||!apiKeySaved}>{t.generateBtn}</button>

            <div style={{ textAlign:"center" }}>
              <button style={{ ...ghost, fontSize:13 }} onClick={() => { setResult(SAMPLE); setStage("result"); }}>{t.previewBtn}</button>
            </div>
          </>
        )}

        {/* Generating */}
        {stage === "generating" && (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:52, marginBottom:22, animation:"spin 2s linear infinite", display:"inline-block" }}>🍳</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:22, color:"#f5e6c8", marginBottom:8 }}>{t.loadingTitle}</div>
            <div style={{ fontFamily:"sans-serif", fontSize:14, color:"#6a5a3a" }}>{loadingMsg}</div>
          </div>
        )}

        {/* Result */}
        {stage === "result" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#f5e6c8", margin:0, fontSize:22 }}>{t.resultTitle}</h2>
              <div style={{ display:"flex", gap:8 }}>
                <button style={ghost} onClick={() => { setStage("setup"); setResult(""); }}>{t.newPlan}</button>
                <button style={btn} onClick={() => {
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(new Blob([result],{type:"text/markdown"}));
                  a.download = "meal_plan.md"; a.click();
                }}>{t.save}</button>
              </div>
            </div>
            <div style={{ ...card, padding:"26px" }}>{parseMd(result)}</div>
            <button style={{ ...bigBtn, marginTop:8 }} onClick={() => setStage("setup")}>{t.regenerate}</button>
          </>
        )}
      </div>
    </div>
  );
}
