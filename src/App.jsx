import { useState, useEffect, useRef } from "react";

const POPULAR_CREATORS_EN = [
  { name: "Joshua Weissman", handle: "@JoshuaWeissman", channelId: "UChBEbMKI1eCcejTtmI32UEw" },
  { name: "Ethan Chlebowski", handle: "@EthanChlebowski", channelId: "UCDq5v10l4wkV5-ZBIJJFbzQ" },
  { name: "Internet Shaquille", handle: "@internetshaquille", channelId: "UCRIZtNkuoXM-pHZDIABfmIg" },
  { name: "Adam Ragusea", handle: "@aragusea", channelId: "UC9_p50tH3WmMslWRWKnM7dQ" },
  { name: "Pro Home Cooks", handle: "@ProHomeCooks", channelId: "UCzH5n3Ih5kgQoiDAQt2FwLw" },
  { name: "Alex French Guy", handle: "@AlexFrenchGuyGooking", channelId: "UCl3DmLIQFPxeRRkqnBpE5qQ" },
];

const POPULAR_CREATORS_ZH = [
  { name: "王刚 Chef Wang Gang", handle: "王刚", channelId: "wang-gang" },
  { name: "曼食慢语 ManCook", handle: "曼食慢语", channelId: "mancook" },
  { name: "日食记 Ririshiji", handle: "日食记", channelId: "ririshiji" },
  { name: "大厨江一舟", handle: "大厨江一舟", channelId: "jiangYiZhou" },
  { name: "美食作家王刚", handle: "美食作家王刚", channelId: "wanggang2" },
  { name: "朱一旦的枯燥生活", handle: "朱一旦", channelId: "zhuyidan" },
];

const I18N = {
  en: {
    badge: "🍳 Weekly Meal Planner",
    h1: ["Cook like", "your favorites."],
    sub: "Add your go-to YouTube chefs → get a full week of meals & groceries",
    apiLabel: "Anthropic API Key",
    apiSaved: "✓ Saved",
    apiSetup: "Set up →",
    apiHide: "Hide",
    apiDesc: <>Get a free key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c87020" }}>console.anthropic.com</a> → API Keys → Create Key.<br />Cost: ~$0.03 per plan. Key stays in your browser session only.</>,
    apiSaveBtn: "Save",
    apiChange: "Change",
    apiPlaceholder: "sk-ant-api03-...",
    apiError: "Key should start with sk-ant-...",
    creatorsLabel: "Your Cooking Creators",
    quickAdd: "Quick add popular creators:",
    inputPlaceholder: "Paste YouTube URL or @handle…",
    addBtn: "Add",
    noCreators: "No creators added yet",
    generateBtn: "Generate My Weekly Plan →",
    previewBtn: "👀 Preview a sample plan",
    loadingTitle: "Cooking up your plan…",
    loadingMsgs: ["Scanning your creators' channels…", "Pulling recent video ideas…", "Analyzing recipes and techniques…", "Building your grocery list…", "Almost ready…"],
    resultTitle: "Your Weekly Plan",
    newPlan: "← New Plan",
    save: "↓ Save",
    regenerate: "↺ Generate a new plan",
    platformLabel: "Platform",
    needKey: "Please save your API key first.",
    needCreator: "Add at least one creator.",
    promptIntro: (creators, lang) => `You are a weekly meal planning assistant. The user follows these YouTube cooking creators: ${creators}.\n\nBased on the typical style, recipes, and content these creators make, generate a practical and delicious weekly meal plan.\n\nRespond entirely in English.\n\nPlease produce exactly this structure:\n\n## 🗓️ Your Week in Food\n(5 meals, Monday–Friday. For each: meal name, which creator inspired it in italics, one-sentence description, cook time, difficulty)\n\n## 🛒 Grocery List\n(Categorized into: Produce, Proteins, Dairy & Fridge, Pantry, Condiments & Spices. Be specific with quantities.)\n\n## ⚡ Prep Tips\n(3 practical batch-prep tips to save time during the week)\n\n## ⭐ Chef's Pick This Week\n(Recommend one dish to start with and why, 2-3 sentences)\n\nUse markdown formatting with ##, ###, **, and - for lists. Be specific, practical, and enthusiastic.`,
  },
  zh: {
    badge: "🍳 每周食谱规划",
    h1: ["跟着喜欢的", "美食博主做饭。"],
    sub: "添加你喜欢的B站美食博主 → 获取一周食谱和购物清单",
    apiLabel: "Anthropic API 密钥",
    apiSaved: "✓ 已保存",
    apiSetup: "设置 →",
    apiHide: "收起",
    apiDesc: <>在 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c87020" }}>console.anthropic.com</a> 免费获取密钥 → API Keys → Create Key。<br />每次生成约 ¥0.20。密钥仅保存在本次浏览器会话中。</>,
    apiSaveBtn: "保存",
    apiChange: "更换",
    apiPlaceholder: "sk-ant-api03-...",
    apiError: "密钥应以 sk-ant- 开头",
    creatorsLabel: "你关注的美食博主",
    quickAdd: "快速添加热门博主：",
    inputPlaceholder: "粘贴B站链接或输入博主名称…",
    addBtn: "添加",
    noCreators: "还没有添加博主",
    generateBtn: "生成本周食谱 →",
    previewBtn: "👀 查看示例食谱",
    loadingTitle: "正在为你规划本周食谱…",
    loadingMsgs: ["正在分析博主风格…", "整理近期视频菜谱…", "分析食材和烹饪技巧…", "生成购物清单…", "马上好了…"],
    resultTitle: "本周食谱",
    newPlan: "← 重新规划",
    save: "↓ 保存",
    regenerate: "↺ 重新生成",
    platformLabel: "平台",
    needKey: "请先保存 API 密钥。",
    needCreator: "请至少添加一位博主。",
    promptIntro: (creators) => `你是一位专业的每周食谱规划助手。用户关注了以下美食博主（主要来自B站）：${creators}。\n\n请根据这些博主的典型风格、菜谱和内容，为用户生成一份实用美味的一周食谱计划。\n\n请完全用中文回答。\n\n请严格按照以下结构输出：\n\n## 🗓️ 本周食谱\n（周一至周五共5道菜。每道菜包含：菜名、灵感来源博主（斜体）、一句话描述、烹饪时间、难度）\n\n## 🛒 购物清单\n（按分类：蔬菜水果、肉类海鲜、蛋奶豆制品、干货主食、调味料。注明用量。）\n\n## ⚡ 备餐小技巧\n（3条节省时间的批量备餐建议）\n\n## ⭐ 本周首推\n（推荐一道最值得先做的菜，并说明原因，2-3句话）\n\n使用 Markdown 格式，包括 ##、###、** 和 - 列表。内容要具体实用，充满热情。`,
  },
};

const SAMPLE_PLAN_ZH = `## 🗓️ 本周食谱

### 周一 — 红烧肉
*灵感来自 王刚 Chef Wang Gang*
五花肉慢炖至软糯，色泽红亮，米饭的绝配。约60分钟 · 中等难度

### 周二 — 番茄炒蛋盖饭
*灵感来自 日食记 Ririshiji*
经典家常菜，酸甜适口，10分钟快手搞定。约15分钟 · 简单

### 周三 — 蒜蓉粉丝蒸虾
*灵感来自 曼食慢语 ManCook*
鲜虾蒸至嫩滑，蒜香四溢，摆盘精致好看。约25分钟 · 简单

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
- 豆瓣酱 · 生抽 · 老抽 · 料酒 · 花椒 · 辣椒面 · 香油 · 蚝油

---

## ⚡ 备餐小技巧

1. **周日提前处理**：葱油可以一次多炸一些，冰箱冷藏可用一周，周五拌面直接用。
2. **红烧肉建议翻倍**：多做一份冷冻起来，下周直接加热，省时省力。
3. **备好万能葱姜蒜**：提前切好装盒冷藏，每天烹饪直接取用，节省10分钟。

---

## ⭐ 本周首推

**从红烧肉开始（周一）。** 王刚老师的红烧肉做法步骤清晰，一旦掌握火候和上色技巧，你会对家常炖菜充满信心。炖的过程中满屋飘香，绝对值得花这一个小时。`;


const SAMPLE_PLAN_EN = `## 🗓️ Your Week in Food

### Monday — Smash Burgers with Special Sauce
*Inspired by Joshua Weissman*
Crispy-edged smash patties on toasted brioche with a tangy mayo-pickle sauce. 25 min · Easy

### Tuesday — High-Protein Chicken & Rice Bowl
*Inspired by Ethan Chlebowski*
Marinated thighs over seasoned rice with quick cucumber salad. 30 min · Easy

### Wednesday — Creamy Tuscan Pasta
*Inspired by Internet Shaquille*
Sun-dried tomatoes, spinach, and parmesan in a silky cream sauce. 20 min · Easy

### Thursday — Sheet Pan Salmon & Veg
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
- Short pasta (rigatoni) · Long-grain white rice · Pizza flour (00) · Active dry yeast
- Sun-dried tomatoes · Miso paste · Panko breadcrumbs

**Condiments & Spices**
- Mayonnaise · Dill pickles · Smoked paprika · Red pepper flakes · Soy sauce

---

## ⚡ Prep Tips

1. **Sunday batch:** Cook a big pot of rice and marinate the chicken overnight — saves 15 min on Tuesday.
2. **Start pizza dough Friday morning** — cold ferment needs time but hands-on is only 10 minutes.
3. **Make double burger sauce** — it keeps a week and works as a dipping sauce or salad dressing.

---

## ⭐ Chef's Pick This Week

**Start with the Smash Burgers (Monday).** They're fast, satisfying, and if you've never smashed a burger at home the technique is a genuine revelation. Once you nail that, you'll feel great going into the rest of the week.`;

function Grain() {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none", zIndex: 0 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} style={{ color: "#f5c842", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, margin: "24px 0 4px", fontWeight: 700 }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} style={{ color: "#ff8c42", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, margin: "32px 0 12px", borderBottom: "1px solid #2a2010", paddingBottom: 8 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++} style={{ color: "#e8d5a3", fontFamily: "sans-serif", fontWeight: 700, fontSize: 14, margin: "12px 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      elements.push(<p key={key++} style={{ color: "#c4a96e", fontFamily: "sans-serif", fontSize: 14, margin: "2px 0 2px 12px", lineHeight: 1.6 }}>· {line.slice(2)}</p>);
    } else if (line.startsWith("*Inspired")) {
      elements.push(<p key={key++} style={{ color: "#7a6a4a", fontFamily: "sans-serif", fontStyle: "italic", fontSize: 13, margin: "0 0 6px" }}>{line.slice(1, -1)}</p>);
    } else if (line === "---") {
      elements.push(<hr key={key++} style={{ border: "none", borderTop: "1px solid #2a2010", margin: "20px 0" }} />);
    } else if (line.trim()) {
      elements.push(<p key={key++} style={{ color: "#b09a72", fontFamily: "sans-serif", fontSize: 14, margin: "4px 0", lineHeight: 1.7 }}>{line}</p>);
    }
  }
  return elements;
}

export default function App() {
  const [lang, setLang] = useState("en");
  const t = I18N[lang];
  const POPULAR_CREATORS = lang === "zh" ? POPULAR_CREATORS_ZH : POPULAR_CREATORS_EN;
  const SAMPLE_PLAN = lang === "zh" ? SAMPLE_PLAN_ZH : SAMPLE_PLAN_EN;

  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [creators, setCreators] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [stage, setStage] = useState("setup"); // setup | generating | result
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [showKeySetup, setShowKeySetup] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("anthro_key");
    if (saved) { setApiKey(saved); setApiKeySaved(true); }
  }, []);

  const saveKey = () => {
    if (!apiKey.startsWith("sk-ant-")) { setError(t.apiError); return; }
    sessionStorage.setItem("anthro_key", apiKey);
    setApiKeySaved(true);
    setShowKeySetup(false);
    setError("");
  };

  const addCreator = () => {
    const val = inputVal.trim();
    if (!val || creators.find(c => c.raw === val)) return;
    // Parse YouTube URL or plain name
    let name = val;
    if (val.includes("youtube.com/@")) {
      name = "@" + val.split("youtube.com/@")[1].split("/")[0].split("?")[0];
    } else if (val.includes("youtube.com/c/")) {
      name = val.split("youtube.com/c/")[1].split("/")[0];
    } else if (val.startsWith("@")) {
      name = val;
    }
    setCreators(prev => [...prev, { raw: val, display: name }]);
    setInputVal("");
    inputRef.current?.focus();
  };

  const addPopular = (c) => {
    if (creators.find(x => x.display === c.handle)) return;
    setCreators(prev => [...prev, { raw: c.channelId, display: c.name, channelId: c.channelId }]);
  };

  const removeCreator = (raw) => setCreators(prev => prev.filter(c => c.raw !== raw));

  const generate = async () => {
    if (!apiKeySaved) { setError(t.needKey); return; }
    if (creators.length === 0) { setError(t.needCreator); return; }
    setError("");
    setStage("generating");

    const msgs = t.loadingMsgs;
    let mi = 0;
    setLoadingMsg(msgs[mi]);
    const interval = setInterval(() => {
      mi = Math.min(mi + 1, msgs.length - 1);
      setLoadingMsg(msgs[mi]);
    }, 2200);

    try {
      const creatorList = creators.map(c => c.display || c.raw).join(", ");
      const prompt = t.promptIntro(creatorList);

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("");
      setResult(text);
      setStage("result");
    } catch (e) {
      clearInterval(interval);
      setError(e.message);
      setStage("setup");
    }
  };

  const reset = () => { setStage("setup"); setResult(""); };

  // ── STYLES ──
  const S = {
    wrap: { minHeight: "100vh", background: "#0c0a06", position: "relative", overflow: "hidden" },
    glow: { position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(200,120,30,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
    inner: { position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 20px 80px" },
    header: { textAlign: "center", padding: "52px 0 36px" },
    badge: { display: "inline-block", background: "#1a1200", border: "1px solid #3d2800", borderRadius: 99, padding: "4px 14px", fontSize: 12, color: "#c87020", fontFamily: "sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 },
    h1: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(32px,6vw,52px)", color: "#f5e6c8", margin: 0, lineHeight: 1.15, fontWeight: 900 },
    sub: { color: "#6a5a3a", fontFamily: "sans-serif", fontSize: 15, marginTop: 10 },
    card: { background: "rgba(20,15,5,0.8)", border: "1px solid #2a1f0a", borderRadius: 16, padding: "24px", marginBottom: 16, backdropFilter: "blur(8px)" },
    label: { fontFamily: "sans-serif", fontSize: 11, color: "#6a5a3a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, display: "block" },
    input: { width: "100%", background: "#0f0c05", border: "1px solid #2a1f0a", borderRadius: 10, padding: "12px 16px", color: "#e8d5a3", fontFamily: "sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
    btn: { background: "linear-gradient(135deg, #c87020, #e8a030)", border: "none", borderRadius: 10, padding: "12px 22px", color: "#0c0a06", fontFamily: "sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 0.5, transition: "opacity 0.2s" },
    btnGhost: { background: "transparent", border: "1px solid #2a1f0a", borderRadius: 10, padding: "10px 18px", color: "#6a5a3a", fontFamily: "sans-serif", fontSize: 13, cursor: "pointer" },
    chip: { display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1200", border: "1px solid #3d2800", borderRadius: 99, padding: "6px 12px 6px 14px", fontFamily: "sans-serif", fontSize: 13, color: "#c87020" },
    errorBox: { background: "#1a0800", border: "1px solid #5a1a00", borderRadius: 10, padding: "10px 14px", color: "#ff6b35", fontFamily: "sans-serif", fontSize: 13, marginTop: 12 },
    bigBtn: { width: "100%", padding: "16px", fontSize: 17, borderRadius: 12, background: "linear-gradient(135deg, #c87020, #e8a030)", border: "none", color: "#0c0a06", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, cursor: "pointer", letterSpacing: 0.3, transition: "opacity 0.2s, transform 0.1s" },
  };

  return (
    <div style={S.wrap}>
      <Grain />
      <div style={S.glow} />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      <div style={S.inner}>
        {/* Header */}
        {/* Language Toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <button onClick={() => { setLang("en"); setCreators([]); }} style={{ padding: "6px 18px", borderRadius: 99, border: `2px solid ${lang === "en" ? "#c87020" : "#2a1f0a"}`, background: lang === "en" ? "#1f0f00" : "transparent", color: lang === "en" ? "#c87020" : "#4a3a1a", fontFamily: "sans-serif", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>🇺🇸 English</button>
          <button onClick={() => { setLang("zh"); setCreators([]); }} style={{ padding: "6px 18px", borderRadius: 99, border: `2px solid ${lang === "zh" ? "#c87020" : "#2a1f0a"}`, background: lang === "zh" ? "#1f0f00" : "transparent", color: lang === "zh" ? "#c87020" : "#4a3a1a", fontFamily: "sans-serif", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>🇨🇳 中文</button>
        </div>

        {/* Header */}
        <div style={S.header}>
          <div style={S.badge}>{t.badge}</div>
          <h1 style={S.h1}>{t.h1[0]}<br />{t.h1[1]}</h1>
          <p style={S.sub}>{t.sub}</p>
        </div>

        {stage === "setup" && (
          <>
            {/* API Key */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ ...S.label, margin: 0 }}>{t.apiLabel}</span>
                {apiKeySaved
                  ? <span style={{ background: "#0a1f0a", border: "1px solid #1a4a1a", borderRadius: 99, padding: "3px 12px", fontSize: 12, color: "#4caf50", fontFamily: "sans-serif" }}>{t.apiSaved}</span>
                  : <button style={{ ...S.btnGhost, fontSize: 12, padding: "4px 10px", color: "#c87020", borderColor: "#3d2800" }} onClick={() => setShowKeySetup(s => !s)}>
                      {showKeySetup ? t.apiHide : t.apiSetup}
                    </button>
                }
              </div>

              {!apiKeySaved && showKeySetup && (
                <>
                  <div style={{ background: "#0f0c05", border: "1px solid #2a1f0a", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                    <p style={{ margin: "0 0 8px", color: "#6a5a3a", fontFamily: "sans-serif", fontSize: 13, lineHeight: 1.6 }}>
                      {t.apiDesc}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      style={{ ...S.input, flex: 1 }}
                      type="password"
                      placeholder={t.apiPlaceholder}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveKey()}
                    />
                    <button style={S.btn} onClick={saveKey}>{t.apiSaveBtn}</button>
                  </div>
                </>
              )}

              {apiKeySaved && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: "#3d2800" }}>sk-ant-••••••••••••••••••••</span>
                  <button style={{ ...S.btnGhost, fontSize: 12, padding: "4px 10px" }} onClick={() => { setApiKeySaved(false); setShowKeySetup(true); }}>{t.apiChange}</button>
                </div>
              )}
            </div>

            {/* Creators */}
            <div style={S.card}>
              <span style={S.label}>{t.creatorsLabel}</span>

              {/* Popular quick-add */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#4a3a1a", fontFamily: "sans-serif", marginBottom: 8 }}>{t.quickAdd}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {POPULAR_CREATORS.map(c => {
                    const added = creators.find(x => x.display === c.name);
                    return (
                      <button key={c.channelId} onClick={() => !added && addPopular(c)}
                        style={{ background: added ? "#0a1a0a" : "#120e04", border: `1px solid ${added ? "#1a4a1a" : "#2a1f0a"}`, borderRadius: 99, padding: "5px 12px", fontFamily: "sans-serif", fontSize: 12, color: added ? "#4caf50" : "#8a6a3a", cursor: added ? "default" : "pointer", transition: "all 0.15s" }}>
                        {added ? "✓ " : "+ "}{c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom input */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <input
                  ref={inputRef}
                  style={{ ...S.input, flex: 1 }}
                  placeholder={t.inputPlaceholder}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCreator()}
                />
                <button style={S.btn} onClick={addCreator}>{t.addBtn}</button>
              </div>

              {/* Creator chips */}
              {creators.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {creators.map(c => (
                    <div key={c.raw} style={S.chip}>
                      <span>{lang === "zh" ? "📺" : "🎥"}</span>
                      <span>{c.display}</span>
                      <button onClick={() => removeCreator(c.raw)} style={{ background: "none", border: "none", color: "#5a3a10", cursor: "pointer", padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {creators.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#3a2a10", fontFamily: "sans-serif", fontSize: 13 }}>{t.noCreators}</div>
              )}
            </div>

            {error && <div style={S.errorBox}>⚠ {error}</div>}

            <button
              style={{ ...S.bigBtn, opacity: creators.length > 0 && apiKeySaved ? 1 : 0.4 }}
              onClick={generate}
              disabled={creators.length === 0 || !apiKeySaved}
            >
              {t.generateBtn}
            </button>

            {/* Demo */}
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button style={{ ...S.btnGhost, fontSize: 13 }} onClick={() => { setResult(SAMPLE_PLAN); setStage("result"); }}>
                {t.previewBtn}
              </button>
            </div>
          </>
        )}

        {stage === "generating" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 24, animation: "spin 2s linear infinite", display: "inline-block" }}>🍳</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: "#f5e6c8", marginBottom: 10 }}>{t.loadingTitle}</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "#6a5a3a" }}>{loadingMsg}</div>
          </div>
        )}

        {stage === "result" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#f5e6c8", margin: 0, fontSize: 22 }}>{t.resultTitle}</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={S.btnGhost} onClick={reset}>{t.newPlan}</button>
                <button style={S.btn} onClick={() => {
                  const blob = new Blob([result], { type: "text/markdown" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "meal_plan.md"; a.click();
                }}>{t.save}</button>
              </div>
            </div>

            <div style={{ ...S.card, padding: "28px 28px" }}>
              {parseMarkdown(result)}
            </div>

            <button style={{ ...S.bigBtn, marginTop: 8 }} onClick={() => { setStage("setup"); }}>
              {t.regenerate}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
