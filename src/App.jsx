import { useState, useEffect, useRef } from "react";

const POPULAR_CREATORS = [
  { name: "Joshua Weissman", handle: "@JoshuaWeissman", channelId: "UChBEbMKI1eCcejTtmI32UEw" },
  { name: "Ethan Chlebowski", handle: "@EthanChlebowski", channelId: "UCDq5v10l4wkV5-ZBIJJFbzQ" },
  { name: "Internet Shaquille", handle: "@internetshaquille", channelId: "UCRIZtNkuoXM-pHZDIABfmIg" },
  { name: "Adam Ragusea", handle: "@aragusea", channelId: "UC9_p50tH3WmMslWRWKnM7dQ" },
  { name: "Pro Home Cooks", handle: "@ProHomeCooks", channelId: "UCzH5n3Ih5kgQoiDAQt2FwLw" },
  { name: "Alex French Guy", handle: "@AlexFrenchGuyGooking", channelId: "UCl3DmLIQFPxeRRkqnBpE5qQ" },
];

const SAMPLE_PLAN = `## 🗓️ Your Week in Food

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
    if (!apiKey.startsWith("sk-ant-")) { setError("Key should start with sk-ant-..."); return; }
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
    if (!apiKeySaved) { setError("Please save your API key first."); return; }
    if (creators.length === 0) { setError("Add at least one creator."); return; }
    setError("");
    setStage("generating");

    const msgs = [
      "Scanning your creators' channels…",
      "Pulling recent video ideas…",
      "Analyzing recipes and techniques…",
      "Building your grocery list…",
      "Almost ready…",
    ];
    let mi = 0;
    setLoadingMsg(msgs[mi]);
    const interval = setInterval(() => {
      mi = Math.min(mi + 1, msgs.length - 1);
      setLoadingMsg(msgs[mi]);
    }, 2200);

    try {
      const creatorList = creators.map(c => c.display || c.raw).join(", ");

      const prompt = `You are a weekly meal planning assistant. The user follows these YouTube cooking creators: ${creatorList}.

Based on the typical style, recipes, and content these creators make, generate a practical and delicious weekly meal plan for this person.

Please produce exactly this structure:

## 🗓️ Your Week in Food
(5 meals, Monday–Friday. For each: meal name, which creator inspired it in italics, one-sentence description, cook time, difficulty)

## 🛒 Grocery List
(Categorized into: Produce, Proteins, Dairy & Fridge, Pantry, Condiments & Spices. Be specific with quantities.)

## ⚡ Prep Tips
(3 practical batch-prep tips to save time during the week)

## ⭐ Chef's Pick This Week
(Recommend one dish to start with and why, 2-3 sentences)

Use markdown formatting with ##, ###, **, and - for lists. Be specific, practical, and enthusiastic. Match the style of the creators chosen.`;

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
        <div style={S.header}>
          <div style={S.badge}>🍳 Weekly Meal Planner</div>
          <h1 style={S.h1}>Cook like<br />your favorites.</h1>
          <p style={S.sub}>Add your go-to YouTube chefs → get a full week of meals & groceries</p>
        </div>

        {stage === "setup" && (
          <>
            {/* API Key */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ ...S.label, margin: 0 }}>Anthropic API Key</span>
                {apiKeySaved
                  ? <span style={{ background: "#0a1f0a", border: "1px solid #1a4a1a", borderRadius: 99, padding: "3px 12px", fontSize: 12, color: "#4caf50", fontFamily: "sans-serif" }}>✓ Saved</span>
                  : <button style={{ ...S.btnGhost, fontSize: 12, padding: "4px 10px", color: "#c87020", borderColor: "#3d2800" }} onClick={() => setShowKeySetup(s => !s)}>
                      {showKeySetup ? "Hide" : "Set up →"}
                    </button>
                }
              </div>

              {!apiKeySaved && showKeySetup && (
                <>
                  <div style={{ background: "#0f0c05", border: "1px solid #2a1f0a", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                    <p style={{ margin: "0 0 8px", color: "#6a5a3a", fontFamily: "sans-serif", fontSize: 13, lineHeight: 1.6 }}>
                      Get a free key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c87020" }}>console.anthropic.com</a> → API Keys → Create Key.<br />
                      Cost: ~$0.03 per plan. Key stays in your browser session only.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      style={{ ...S.input, flex: 1 }}
                      type="password"
                      placeholder="sk-ant-api03-..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveKey()}
                    />
                    <button style={S.btn} onClick={saveKey}>Save</button>
                  </div>
                </>
              )}

              {apiKeySaved && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: "#3d2800" }}>sk-ant-••••••••••••••••••••</span>
                  <button style={{ ...S.btnGhost, fontSize: 12, padding: "4px 10px" }} onClick={() => { setApiKeySaved(false); setShowKeySetup(true); }}>Change</button>
                </div>
              )}
            </div>

            {/* Creators */}
            <div style={S.card}>
              <span style={S.label}>Your Cooking Creators</span>

              {/* Popular quick-add */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#4a3a1a", fontFamily: "sans-serif", marginBottom: 8 }}>Quick add popular creators:</div>
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
                  placeholder="Paste YouTube URL or @handle…"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCreator()}
                />
                <button style={S.btn} onClick={addCreator}>Add</button>
              </div>

              {/* Creator chips */}
              {creators.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {creators.map(c => (
                    <div key={c.raw} style={S.chip}>
                      <span>🎥</span>
                      <span>{c.display}</span>
                      <button onClick={() => removeCreator(c.raw)} style={{ background: "none", border: "none", color: "#5a3a10", cursor: "pointer", padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {creators.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#3a2a10", fontFamily: "sans-serif", fontSize: 13 }}>No creators added yet</div>
              )}
            </div>

            {error && <div style={S.errorBox}>⚠ {error}</div>}

            <button
              style={{ ...S.bigBtn, opacity: creators.length > 0 && apiKeySaved ? 1 : 0.4 }}
              onClick={generate}
              disabled={creators.length === 0 || !apiKeySaved}
            >
              Generate My Weekly Plan →
            </button>

            {/* Demo */}
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button style={{ ...S.btnGhost, fontSize: 13 }} onClick={() => { setResult(SAMPLE_PLAN); setStage("result"); }}>
                👀 Preview a sample plan
              </button>
            </div>
          </>
        )}

        {stage === "generating" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 24, animation: "spin 2s linear infinite", display: "inline-block" }}>🍳</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: "#f5e6c8", marginBottom: 10 }}>Cooking up your plan…</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "#6a5a3a" }}>{loadingMsg}</div>
          </div>
        )}

        {stage === "result" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#f5e6c8", margin: 0, fontSize: 22 }}>Your Weekly Plan</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={S.btnGhost} onClick={reset}>← New Plan</button>
                <button style={S.btn} onClick={() => {
                  const blob = new Blob([result], { type: "text/markdown" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "meal_plan.md"; a.click();
                }}>↓ Save</button>
              </div>
            </div>

            <div style={{ ...S.card, padding: "28px 28px" }}>
              {parseMarkdown(result)}
            </div>

            <button style={{ ...S.bigBtn, marginTop: 8 }} onClick={() => { setStage("setup"); }}>
              ↺ Generate a new plan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
