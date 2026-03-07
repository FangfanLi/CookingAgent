import { useState, useEffect, useCallback } from "react";

// ── Popular creators ──────────────────────────────────────────────────────────
const POPULAR_YOUTUBE_EN = [
  { name: "Joshua Weissman",    id: "UChBEbMKI1eCcejTtmI32UEw" },
  { name: "Ethan Chlebowski",   id: "UCDq5v10l4wkV5-ZBIJJFbzQ" },
  { name: "Internet Shaquille", id: "UCRIZtNkuoXM-pHZDIABfmIg" },
  { name: "Adam Ragusea",       id: "UC9_p50tH3WmMslWRWKnM7dQ" },
  { name: "Pro Home Cooks",     id: "UCzH5n3Ih5kgQoiDAQt2FwLw" },
  { name: "Alex French Guy",    id: "UCl3DmLIQFPxeRRkqnBpE5qQ" },
];
const POPULAR_YOUTUBE_ZH = [
  { name: "王刚 Chef Wang Gang",       id: "chefwang" },
  { name: "老饭骨",                     id: "LaoFanGu" },
  { name: "小高姐的Magic Ingredients", id: "magicingredients" },
  { name: "尚食厨房",                   id: "shangshikitchen" },
  { name: "酒满饭宝",                   id: "hkchefpo" },
];
const POPULAR_BILIBILI = [
  { name: "锅铲居士",               id: "502299736" },
  { name: "叔叔的临时生活安顿处",   id: "1816377225" },
  { name: "米线厨房",               id: "10891313" },
  { name: "王哥盐帮菜",             id: "1742023657" },
];

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  get:     ()           => fetch("/api/plans").then(r => r.json()),
  savePlan:(text,meals) => fetch("/api/plans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save_plan",text,meals})}).then(r=>r.json()),
  saveCreators:(yt,bili)=> fetch("/api/plans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save_creators",yt,bili})}).then(r=>r.json()),
  patchMeal:(planId,mealIndex,status)=>fetch("/api/plans",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({planId,mealIndex,status})}).then(r=>r.json()),
  clearHistory:()=>fetch("/api/plans",{method:"DELETE"}).then(r=>r.json()),
};

// ── i18n ──────────────────────────────────────────────────────────────────────
const I18N = {
  en: {
    badge:"🍳 Weekly Meal Planner", h1:["Cook like","your favorites."],
    sub:"Add your cooking creators → get a full week of meals & groceries",
    apiLabel:"Anthropic API Key", apiSaved:"✓ Saved", apiSetup:"Set up →", apiHide:"Hide",
    apiDesc:<>Free key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{color:"#c87020"}}>console.anthropic.com</a> → API Keys → Create Key. ~$0.03/plan.</>,
    apiSaveBtn:"Save", apiChange:"Change", apiPlaceholder:"sk-ant-api03-...", apiError:"Key should start with sk-ant-...",
    ytSection:"YouTube Creators", ytQuickAdd:"Quick add:", ytPlaceholder:"Paste YouTube URL or @handle…",
    biliSection:"Bilibili Creators", biliQuickAdd:"Quick add:", biliPlaceholder:"Paste Bilibili URL, UID, or type a name…",
    addBtn:"Add", noCreators:"None added yet",
    generateBtn:"Generate My Weekly Plan →", previewBtn:"👀 Preview sample",
    loadingTitle:"Cooking up your plan…",
    loadingMsgs:["Scanning your creators…","Pulling recent video ideas…","Analyzing recipes…","Building grocery list…","Almost ready…"],
    resultTitle:"This Week's Plan", newPlan:"← Back", save:"↓ Save .md", regenerate:"↺ Regenerate",
    historyTab:"📋 History", plannerTab:"🍳 Planner", historyTitle:"Past Plans",
    historyEmpty:"No plans yet — generate your first one!",
    markCooked:"✓ Cooked", markSkipped:"✗ Skip", weekLabel:"Week of",
    needKey:"Please save your API key first.", needCreator:"Add at least one creator.",
    dbLoading:"Loading your data…", dbError:"Could not connect to database — using local storage.",
    prompt:(yt,bili,history)=>{
      const parts=[];
      if(yt.length)   parts.push(`YouTube creators: ${yt.join(", ")}`);
      if(bili.length) parts.push(`Bilibili creators: ${bili.join(", ")}`);
      const avoid=history.length?`\n\nRecently cooked — please avoid repeating: ${history.join(", ")}.`:"";
      return `You are a weekly meal planning assistant. The user follows:\n${parts.join("\n")}${avoid}\n\nGenerate a practical weekly meal plan. Respond in English.\n\n## 🗓️ Your Week in Food\n5 meals Mon–Fri. EXACTLY this format per meal:\n### [Day] — [Meal Name]\n*Inspired by [Creator]*\n[Description]. [X] min · [Easy/Medium/Hard]\n\n## 🛒 Grocery List\nProduce · Proteins · Dairy & Fridge · Pantry · Condiments & Spices. Include quantities.\n\n## ⚡ Prep Tips\n3 batch-prep tips.\n\n## ⭐ Chef's Pick\n2–3 sentences on the best dish to start with.\n\nUse ## ### ** - markdown. Be specific and enthusiastic.`;
    },
  },
  zh: {
    badge:"🍳 每周食谱规划", h1:["跟着喜欢的","美食博主做饭。"],
    sub:"添加你喜欢的美食博主 → 获取一周食谱和购物清单",
    apiLabel:"Anthropic API 密钥", apiSaved:"✓ 已保存", apiSetup:"设置 →", apiHide:"收起",
    apiDesc:<>在 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{color:"#c87020"}}>console.anthropic.com</a> 免费获取密钥。每次约 ¥0.20。</>,
    apiSaveBtn:"保存", apiChange:"更换", apiPlaceholder:"sk-ant-api03-...", apiError:"密钥应以 sk-ant- 开头",
    ytSection:"YouTube 博主", ytQuickAdd:"快速添加：", ytPlaceholder:"粘贴 YouTube 链接或 @handle…",
    biliSection:"B站博主", biliQuickAdd:"快速添加：", biliPlaceholder:"粘贴B站链接、UID 或直接输入博主名…",
    addBtn:"添加", noCreators:"还没有添加博主",
    generateBtn:"生成本周食谱 →", previewBtn:"👀 查看示例食谱",
    loadingTitle:"正在为你规划本周食谱…",
    loadingMsgs:["分析博主风格…","整理近期视频菜谱…","分析食材和技巧…","生成购物清单…","马上好了…"],
    resultTitle:"本周食谱", newPlan:"← 返回", save:"↓ 保存", regenerate:"↺ 重新生成",
    historyTab:"📋 历史记录", plannerTab:"🍳 规划", historyTitle:"历史食谱",
    historyEmpty:"还没有食谱记录，生成第一份吧！",
    markCooked:"✓ 已做", markSkipped:"✗ 跳过", weekLabel:"生成于",
    needKey:"请先保存 API 密钥。", needCreator:"请至少添加一位博主。",
    dbLoading:"正在加载你的数据…", dbError:"无法连接数据库，使用本地存储。",
    prompt:(yt,bili,history)=>{
      const parts=[];
      if(yt.length)   parts.push(`YouTube博主：${yt.join("、")}`);
      if(bili.length) parts.push(`B站博主：${bili.join("、")}`);
      const avoid=history.length?`\n\n近期已做（请避免重复）：${history.join("、")}。`:"";
      return `你是每周食谱规划助手。用户关注：\n${parts.join("\n")}${avoid}\n\n生成一份实用的一周食谱。完全用中文回答。\n\n## 🗓️ 本周食谱\n周一至周五5道菜。严格按此格式：\n### [星期] — [菜名]\n*灵感来自 [博主]*\n[描述]。约[X]分钟 · [简单/中等/难]\n\n## 🛒 购物清单\n蔬菜水果·肉类海鲜·蛋奶豆制品·干货主食·调味料。注明用量。\n\n## ⚡ 备餐小技巧\n3条节省时间的建议。\n\n## ⭐ 本周首推\n最值得先做的菜及原因，2-3句。\n\n使用 ## ### ** 和 - 格式，内容具体实用。`;
    },
  },
};

// ── Sample plans ──────────────────────────────────────────────────────────────
const SAMPLE_EN=`## 🗓️ Your Week in Food\n\n### Monday — Smash Burgers with Special Sauce\n*Inspired by Joshua Weissman*\nCrispy-edged patties on brioche with tangy mayo-pickle sauce. 25 min · Easy\n\n### Tuesday — High-Protein Chicken Bowl\n*Inspired by Ethan Chlebowski*\nMarinated thighs over seasoned rice with quick cucumber salad. 30 min · Easy\n\n### Wednesday — Creamy Tuscan Pasta\n*Inspired by Internet Shaquille*\nSun-dried tomatoes, spinach, and parmesan in silky cream sauce. 20 min · Easy\n\n### Thursday — Sheet Pan Salmon\n*Inspired by Adam Ragusea*\nMiso-glazed salmon with roasted broccolini and lemon. 35 min · Medium\n\n### Friday — Homemade Pizza Night\n*Inspired by Pro Home Cooks*\n72-hour cold-ferment dough with fresh mozzarella and basil. 20 min active · Medium\n\n---\n\n## 🛒 Grocery List\n\n**Produce**\n- 2 heads garlic · 1 lemon · 1 bag spinach · 2 cucumbers · 1 head broccolini · fresh basil\n\n**Proteins**\n- 1 lb ground beef (80/20) · 4 chicken thighs · 2 salmon fillets\n\n**Dairy & Fridge**\n- Fresh mozzarella · Parmesan block · Heavy cream · Brioche buns · Eggs\n\n**Pantry**\n- Rigatoni · Long-grain rice · Pizza flour (00) · Active dry yeast\n\n**Condiments & Spices**\n- Mayo · Dill pickles · Smoked paprika · Miso paste\n\n---\n\n## ⚡ Prep Tips\n\n1. **Sunday batch:** Cook rice and marinate chicken overnight.\n2. **Start pizza dough Friday morning** — cold ferment is hands-off.\n3. **Double the burger sauce** — keeps a week, great as a dip too.\n\n---\n\n## ⭐ Chef's Pick\n\n**Start with the Smash Burgers.** Fast, satisfying, and the technique is a revelation.`;

const SAMPLE_ZH=`## 🗓️ 本周食谱\n\n### 周一 — 红烧肉\n*灵感来自 王刚 Chef Wang Gang*\n五花肉慢炖至软糯，色泽红亮，米饭绝配。约60分钟 · 中等难度\n\n### 周二 — 番茄炒蛋盖饭\n*灵感来自 日食记 Ririshiji*\n经典家常菜，酸甜适口。约15分钟 · 简单\n\n### 周三 — 蒜蓉粉丝蒸虾\n*灵感来自 曼食慢语 ManCook*\n鲜虾蒸至嫩滑，蒜香四溢。约25分钟 · 简单\n\n### 周四 — 麻婆豆腐\n*灵感来自 大厨江一舟*\n川味麻辣，豆腐嫩滑，下饭神器。约20分钟 · 中等难度\n\n### 周五 — 葱油拌面\n*灵感来自 美食作家王刚*\n焦香葱油拌上劲道面条。约15分钟 · 简单\n\n---\n\n## 🛒 购物清单\n\n**蔬菜水果**\n- 番茄 3个 · 大葱 2根 · 大蒜 1头 · 姜 1块\n\n**肉类海鲜**\n- 五花肉 500g · 鲜虾 300g · 鸡蛋 4个\n\n**蛋奶豆制品**\n- 嫩豆腐 2盒 · 粉丝 1把\n\n**干货主食**\n- 碱水面 300g · 白米适量\n\n**调味料**\n- 豆瓣酱 · 生抽 · 老抽 · 料酒 · 花椒 · 香油\n\n---\n\n## ⚡ 备餐小技巧\n\n1. **提前炸好葱油** — 冰箱冷藏一周，随时可用。\n2. **红烧肉建议翻倍** — 多做一份冷冻备用。\n3. **葱姜蒜提前处理** — 切好装盒冷藏，省时省力。\n\n---\n\n## ⭐ 本周首推\n\n**从红烧肉开始。** 王刚老师步骤清晰，掌握后满屋飘香，充满成就感。`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractMeals(text){const meals=[];for(const line of text.split("\n")){const m=line.match(/^###\s+(.+?)\s+[—–-]\s+(.+)$/);if(m)meals.push({day:m[1].trim(),name:m[2].trim(),status:"pending"});}return meals;}
function parseYT(v){if(v.includes("youtube.com/@"))return"@"+v.split("youtube.com/@")[1].split(/[/?]/)[0];if(v.includes("youtube.com/c/"))return v.split("youtube.com/c/")[1].split(/[/?]/)[0];if(v.includes("youtube.com/channel/"))return v.split("youtube.com/channel/")[1].split(/[/?]/)[0];return v.trim();}
function parseBili(v){if(v.includes("space.bilibili.com/"))return"UID:"+v.split("space.bilibili.com/")[1].split(/[/?]/)[0];if(v.includes("bilibili.com/@"))return v.split("bilibili.com/@")[1].split(/[/?]/)[0];return v.trim();}

function Grain(){return(<svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:0.035,pointerEvents:"none",zIndex:0}}><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>);}

function parseMd(text){const out=[];let k=0;for(const line of text.split("\n")){if(line.startsWith("### "))out.push(<h3 key={k++} style={{color:"#f5c842",fontFamily:"Georgia,serif",fontSize:18,margin:"22px 0 3px",fontWeight:700}}>{line.slice(4)}</h3>);else if(line.startsWith("## "))out.push(<h2 key={k++} style={{color:"#ff8c42",fontFamily:"Georgia,serif",fontSize:21,margin:"28px 0 10px",borderBottom:"1px solid #2a2010",paddingBottom:7}}>{line.slice(3)}</h2>);else if(/^\*\*.*\*\*$/.test(line))out.push(<p key={k++} style={{color:"#e8d5a3",fontFamily:"sans-serif",fontWeight:700,fontSize:13,margin:"12px 0 3px",textTransform:"uppercase",letterSpacing:1}}>{line.slice(2,-2)}</p>);else if(line.startsWith("- "))out.push(<p key={k++} style={{color:"#c4a96e",fontFamily:"sans-serif",fontSize:14,margin:"2px 0 2px 12px",lineHeight:1.6}}>· {line.slice(2)}</p>);else if(/^\*[^*].*[^*]\*$/.test(line))out.push(<p key={k++} style={{color:"#7a6a4a",fontFamily:"sans-serif",fontStyle:"italic",fontSize:13,margin:"0 0 5px"}}>{line.slice(1,-1)}</p>);else if(line.match(/^\d+\./))out.push(<p key={k++} style={{color:"#b09a72",fontFamily:"sans-serif",fontSize:14,margin:"5px 0",lineHeight:1.7}}>{line}</p>);else if(line==="---")out.push(<hr key={k++} style={{border:"none",borderTop:"1px solid #2a2010",margin:"18px 0"}}/>);else if(line.trim())out.push(<p key={k++} style={{color:"#b09a72",fontFamily:"sans-serif",fontSize:14,margin:"3px 0",lineHeight:1.7}}>{line}</p>);}return out;}

function PlatformInput({placeholder,addLabel,accentColor,onAdd}){const[val,setVal]=useState("");const commit=()=>{if(val.trim()){onAdd(val.trim());setVal("");}};return(<div style={{display:"flex",gap:8,marginBottom:12}}><input style={{flex:1,background:"#0f0c05",border:`1px solid ${accentColor}44`,borderRadius:9,padding:"10px 14px",color:"#e8d5a3",fontFamily:"sans-serif",fontSize:14,outline:"none"}} placeholder={placeholder} value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&commit()}/><button style={{background:`linear-gradient(135deg,${accentColor}bb,${accentColor})`,border:"none",borderRadius:9,padding:"10px 18px",color:"#fff",fontFamily:"sans-serif",fontWeight:800,fontSize:13,cursor:"pointer"}} onClick={commit}>{addLabel}</button></div>);}

function ChipList({items,onRemove,chipColor,chipBg,chipBorder,noLabel}){if(!items.length)return<div style={{textAlign:"center",padding:"12px 0",color:"#3a2a10",fontFamily:"sans-serif",fontSize:13}}>{noLabel}</div>;return(<div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:4}}>{items.map(c=>(<div key={c.raw} style={{display:"inline-flex",alignItems:"center",gap:7,background:chipBg,border:`1px solid ${chipBorder}`,borderRadius:99,padding:"5px 10px 5px 13px",fontFamily:"sans-serif",fontSize:13,color:chipColor}}><span>{c.d}</span><button onClick={()=>onRemove(c.raw)} style={{background:"none",border:"none",color:chipBorder,cursor:"pointer",padding:0,fontSize:15,lineHeight:1}}>×</button></div>))}</div>);}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,        setLang]        = useState("en");
  const t = I18N[lang];
  const SAMPLE = lang==="zh"?SAMPLE_ZH:SAMPLE_EN;
  const POPULAR_YOUTUBE = lang==="zh"?POPULAR_YOUTUBE_ZH:POPULAR_YOUTUBE_EN;

  // DB + loading state
  const [dbReady,  setDbReady]  = useState(false);
  const [dbError,  setDbError]  = useState(false);
  const [dbLoading,setDbLoading]= useState(true);

  // Data
  const [ytList,   setYtList]   = useState([]);
  const [biliList, setBiliList] = useState([]);
  const [history,  setHistory]  = useState([]);

  // Session
  const [apiKey,       setApiKey]       = useState(()=>sessionStorage.getItem("anthro_key")||"");
  const [apiKeySaved,  setApiKeySaved]  = useState(()=>!!sessionStorage.getItem("anthro_key"));
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [stage,        setStage]        = useState("setup");
  const [currentPlan,  setCurrentPlan]  = useState(null);
  const [error,        setError]        = useState("");
  const [loadingMsg,   setLoadingMsg]   = useState("");

  // ── Load data from DB on mount ───────────────────────────────────────────
  useEffect(()=>{
    const fallback = (msg) => {
      try{
        setYtList(JSON.parse(localStorage.getItem("ytList")||"[]"));
        setBiliList(JSON.parse(localStorage.getItem("biliList")||"[]"));
        setHistory(JSON.parse(localStorage.getItem("planHistory")||"[]"));
      }catch{}
      setDbError(msg || "connection failed");
      setDbLoading(false);
    };

    // 8s timeout so the loading screen never hangs forever
    const timer = setTimeout(()=>fallback("Request timed out"), 8000);

    api.get()
      .then(data=>{
        clearTimeout(timer);
        if(data.error) throw new Error(data.error);
        setYtList(data.creators.yt   || []);
        setBiliList(data.creators.bili || []);
        setHistory(data.plans || []);
        setDbReady(true);
        setDbLoading(false);
      })
      .catch(err=>{
        clearTimeout(timer);
        console.warn("DB fallback:", err?.message || err);
        fallback(err?.message || "connection failed");
      });
  },[]);

  // ── Persist creators to DB whenever they change ──────────────────────────
  const saveCreators = useCallback((yt,bili)=>{
    if(dbReady) api.saveCreators(yt,bili).catch(()=>{});
    else{ localStorage.setItem("ytList",JSON.stringify(yt)); localStorage.setItem("biliList",JSON.stringify(bili)); }
  },[dbReady]);

  const setYt   = v=>{ const next=typeof v==="function"?v(ytList):v;   setYtList(next);   saveCreators(next,biliList); };
  const setBili = v=>{ const next=typeof v==="function"?v(biliList):v; setBiliList(next); saveCreators(ytList,next);   };

  const saveKey=()=>{ if(!apiKey.startsWith("sk-ant-")){setError(t.apiError);return;} sessionStorage.setItem("anthro_key",apiKey); setApiKeySaved(true);setShowKeySetup(false);setError(""); };
  const addYt   =raw=>{ const d=parseYT(raw);   if(d&&!ytList.find(c=>c.d===d))   setYt(p=>[...p,{raw,d}]); };
  const addBili =raw=>{ const d=parseBili(raw); if(d&&!biliList.find(c=>c.d===d)) setBili(p=>[...p,{raw,d}]); };

  const recentlyCooked=history.flatMap(p=>(p.meals||[]).filter(m=>m.status==="cooked").map(m=>m.name)).slice(-10);
  const totalCreators=ytList.length+biliList.length;

  // ── Generate ─────────────────────────────────────────────────────────────
  const generate=async()=>{
    if(!apiKeySaved){setError(t.needKey);return;}
    if(!totalCreators){setError(t.needCreator);return;}
    setError("");setStage("generating");
    const msgs=t.loadingMsgs;let mi=0;setLoadingMsg(msgs[0]);
    const iv=setInterval(()=>{mi=Math.min(mi+1,msgs.length-1);setLoadingMsg(msgs[mi]);},2200);
    try{
      const prompt=t.prompt(ytList.map(c=>c.d),biliList.map(c=>c.d),recentlyCooked);
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:prompt}]})});
      clearInterval(iv);
      if(!res.ok){const e=await res.json();throw new Error(e.error?.message||"API error");}
      const data=await res.json();
      const text=data.content.map(b=>b.text||"").join("");
      const meals=extractMeals(text);
      let plan={id:Date.now(),created_at:new Date().toISOString(),text,meals};
      // Save to DB
      if(dbReady){
        const saved=await api.savePlan(text,meals);
        if(saved.plan) plan={...saved.plan,meals:saved.plan.meals||meals};
      } else {
        const updated=[plan,...history].slice(0,12);
        setHistory(updated);
        localStorage.setItem("planHistory",JSON.stringify(updated));
      }
      if(dbReady) setHistory(h=>[plan,...h].slice(0,12));
      setCurrentPlan(plan);
      setStage("result");
    }catch(e){clearInterval(iv);setError(e.message);setStage("setup");}
  };

  // ── Update meal status ───────────────────────────────────────────────────
  const updateMeal=async(planId,mealIdx,status)=>{
    const update=plans=>plans.map(p=>p.id!==planId?p:{...p,meals:(p.meals||[]).map((m,i)=>i!==mealIdx?m:{...m,status})});
    setHistory(update);
    if(currentPlan?.id===planId) setCurrentPlan(p=>({...p,meals:(p.meals||[]).map((m,i)=>i!==mealIdx?m:{...m,status})}));
    if(dbReady) await api.patchMeal(planId,mealIdx,status).catch(()=>{});
    else localStorage.setItem("planHistory",JSON.stringify(update(history)));
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const C={
    card:{background:"rgba(20,15,5,0.85)",border:"1px solid #2a1f0a",borderRadius:14,padding:"20px",marginBottom:12,backdropFilter:"blur(8px)"},
    input:{width:"100%",background:"#0f0c05",border:"1px solid #2a1f0a",borderRadius:10,padding:"11px 15px",color:"#e8d5a3",fontFamily:"sans-serif",fontSize:14,outline:"none",boxSizing:"border-box"},
    btn:{background:"linear-gradient(135deg,#c87020,#e8a030)",border:"none",borderRadius:10,padding:"11px 20px",color:"#0c0a06",fontFamily:"sans-serif",fontWeight:800,fontSize:14,cursor:"pointer"},
    ghost:{background:"transparent",border:"1px solid #2a1f0a",borderRadius:10,padding:"9px 16px",color:"#6a5a3a",fontFamily:"sans-serif",fontSize:13,cursor:"pointer"},
    bigBtn:{width:"100%",padding:"15px",fontSize:16,borderRadius:12,background:"linear-gradient(135deg,#c87020,#e8a030)",border:"none",color:"#0c0a06",fontFamily:"Georgia,serif",fontWeight:900,cursor:"pointer"},
    label:{fontFamily:"sans-serif",fontSize:11,color:"#6a5a3a",textTransform:"uppercase",letterSpacing:1.2,marginBottom:8,display:"block"},
    qLabel:c=>({fontSize:11,color:c,fontFamily:"sans-serif",marginBottom:7}),
    qBtn:added=>({background:added?"#051a0a":"#0f0c05",border:`1px solid ${added?"#1a5a2a":"#2a1f0a"}`,borderRadius:99,padding:"5px 12px",fontFamily:"sans-serif",fontSize:12,color:added?"#4caf50":"#8a6a3a",cursor:added?"default":"pointer"}),
    sc:s=>s==="cooked"?"#4caf50":s==="skipped"?"#666":"#c87020",
  };

  const MealTracker=({plan})=>(
    <div style={{...C.card,marginTop:12}}>
      <div style={{fontFamily:"sans-serif",fontSize:11,color:"#6a5a3a",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>🥘 Meal Tracker</div>
      {(plan.meals||[]).length===0
        ?<div style={{color:"#4a3a1a",fontFamily:"sans-serif",fontSize:13}}>No meals detected.</div>
        :(plan.meals||[]).map((meal,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<plan.meals.length-1?"1px solid #1a1200":"none",gap:10,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0}}>
              <span style={{fontFamily:"sans-serif",fontSize:13,color:"#e8d5a3",fontWeight:600}}>{meal.day}</span>
              <span style={{color:"#4a3a1a",margin:"0 6px"}}>·</span>
              <span style={{fontFamily:"sans-serif",fontSize:13,color:C.sc(meal.status),textDecoration:meal.status==="skipped"?"line-through":"none"}}>{meal.name}</span>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              {meal.status!=="cooked"&&<button onClick={()=>updateMeal(plan.id,i,"cooked")} style={{padding:"4px 12px",borderRadius:99,border:"1px solid #1a4a1a",background:"#0a1f0a",color:"#4caf50",fontFamily:"sans-serif",fontSize:12,cursor:"pointer"}}>{t.markCooked}</button>}
              {meal.status!=="skipped"&&<button onClick={()=>updateMeal(plan.id,i,"skipped")} style={{padding:"4px 12px",borderRadius:99,border:"1px solid #333",background:"#1a1a1a",color:"#666",fontFamily:"sans-serif",fontSize:12,cursor:"pointer"}}>{t.markSkipped}</button>}
              {meal.status!=="pending"&&<button onClick={()=>updateMeal(plan.id,i,"pending")} style={{padding:"4px 12px",borderRadius:99,border:"1px solid #2a1f0a",background:"transparent",color:"#4a3a1a",fontFamily:"sans-serif",fontSize:11,cursor:"pointer"}}>↩</button>}
            </div>
          </div>
        ))
      }
    </div>
  );

  if(dbLoading) return(
    <div style={{minHeight:"100vh",background:"#0c0a06",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:48,animation:"spin 2s linear infinite",display:"inline-block"}}>🍳</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{color:"#6a5a3a",fontFamily:"sans-serif",fontSize:15}}>{t.dbLoading}</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#0c0a06",position:"relative",overflow:"hidden"}}>
      <Grain/>
      <div style={{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",width:700,height:400,background:"radial-gradient(ellipse,rgba(200,120,30,0.12) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <div style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"0 20px 80px"}}>

        {/* Top nav */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:24,marginBottom:4}}>
          <div style={{display:"flex",gap:8}}>
            {["en","zh"].map(l=>(
              <button key={l} onClick={()=>{setLang(l);setError("");}}
                style={{padding:"5px 14px",borderRadius:99,border:`2px solid ${lang===l?"#c87020":"#2a1f0a"}`,background:lang===l?"#1f0f00":"transparent",color:lang===l?"#c87020":"#4a3a1a",fontFamily:"sans-serif",fontSize:12,cursor:"pointer"}}>
                {l==="en"?"🇺🇸 EN":"🇨🇳 中文"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {dbError&&<span title={dbError} style={{fontSize:11,color:"#8a4a20",fontFamily:"sans-serif",cursor:"help"}}>⚠ local</span>}
            {dbReady&&<span style={{fontSize:11,color:"#2a6a2a",fontFamily:"sans-serif"}}>● cloud</span>}
            <button onClick={()=>setStage(stage==="history"?"setup":"history")}
              style={{...C.ghost,fontSize:12,padding:"5px 14px",color:stage==="history"?"#c87020":"#6a5a3a",borderColor:stage==="history"?"#3d2800":"#2a1f0a"}}>
              {t.historyTab}{history.length>0&&<span style={{background:"#3d2800",borderRadius:99,padding:"1px 7px",fontSize:11,marginLeft:4}}>{history.length}</span>}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{textAlign:"center",padding:"24px 0 20px"}}>
          <div style={{display:"inline-block",background:"#1a1200",border:"1px solid #3d2800",borderRadius:99,padding:"4px 14px",fontSize:12,color:"#c87020",fontFamily:"sans-serif",letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>{t.badge}</div>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(28px,6vw,48px)",color:"#f5e6c8",margin:0,lineHeight:1.15,fontWeight:900}}>{t.h1[0]}<br/>{t.h1[1]}</h1>
          <p style={{color:"#6a5a3a",fontFamily:"sans-serif",fontSize:14,marginTop:8}}>{t.sub}</p>
        </div>

        {/* ── SETUP ── */}
        {stage==="setup"&&(
          <>
            {/* API Key */}
            <div style={C.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{...C.label,margin:0}}>{t.apiLabel}</span>
                {apiKeySaved
                  ?<span style={{background:"#0a1f0a",border:"1px solid #1a4a1a",borderRadius:99,padding:"3px 12px",fontSize:12,color:"#4caf50",fontFamily:"sans-serif"}}>{t.apiSaved}</span>
                  :<button style={{...C.ghost,fontSize:12,padding:"4px 10px",color:"#c87020",borderColor:"#3d2800"}} onClick={()=>setShowKeySetup(s=>!s)}>{showKeySetup?t.apiHide:t.apiSetup}</button>
                }
              </div>
              {!apiKeySaved&&showKeySetup&&(
                <><p style={{color:"#6a5a3a",fontFamily:"sans-serif",fontSize:13,lineHeight:1.6,margin:"0 0 10px"}}>{t.apiDesc}</p>
                <div style={{display:"flex",gap:10}}>
                  <input style={{...C.input,flex:1}} type="password" placeholder={t.apiPlaceholder} value={apiKey} onChange={e=>setApiKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveKey()}/>
                  <button style={C.btn} onClick={saveKey}>{t.apiSaveBtn}</button>
                </div></>
              )}
              {apiKeySaved&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:"monospace",fontSize:13,color:"#3d2800"}}>sk-ant-••••••••••••••••••••</span>
                  <button style={{...C.ghost,fontSize:12,padding:"4px 10px"}} onClick={()=>{setApiKeySaved(false);setShowKeySetup(true);}}>{t.apiChange}</button>
                </div>
              )}
            </div>

            {/* YouTube panel */}
            <div style={{...C.card,border:"1px solid #3a1a1a"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:18}}>▶️</span>
                <span style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:"#ff5555",textTransform:"uppercase",letterSpacing:1}}>{t.ytSection}</span>
                {ytList.length>0&&<span style={{marginLeft:"auto",background:"#1f0505",border:"1px solid #5a1a1a",borderRadius:99,padding:"2px 10px",fontSize:12,color:"#ff7777",fontFamily:"sans-serif"}}>{ytList.length}</span>}
              </div>
              <div style={C.qLabel("#5a3a2a")}>{t.ytQuickAdd}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
                {POPULAR_YOUTUBE.map(c=>{const added=!!ytList.find(x=>x.d===c.name);return<button key={c.id} onClick={()=>!added&&addYt(c.name)} style={C.qBtn(added)}>{added?"✓ ":"+ "}{c.name}</button>;})}
              </div>
              <PlatformInput placeholder={t.ytPlaceholder} addLabel={t.addBtn} accentColor="#cc3333" onAdd={addYt}/>
              <ChipList items={ytList} onRemove={raw=>setYt(p=>p.filter(c=>c.raw!==raw))} chipColor="#ff7777" chipBg="#1a0505" chipBorder="#5a1a1a" noLabel={t.noCreators}/>
            </div>

            {/* Bilibili panel */}
            {lang==="zh"&&(
              <div style={{...C.card,border:"1px solid #0a2a3a"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <span style={{fontSize:18}}>📺</span>
                  <span style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:"#00b4d8",textTransform:"uppercase",letterSpacing:1}}>{t.biliSection}</span>
                  {biliList.length>0&&<span style={{marginLeft:"auto",background:"#05151f",border:"1px solid #1a4a5a",borderRadius:99,padding:"2px 10px",fontSize:12,color:"#66ccee",fontFamily:"sans-serif"}}>{biliList.length}</span>}
                </div>
                <div style={C.qLabel("#1a3a4a")}>{t.biliQuickAdd}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
                  {POPULAR_BILIBILI.map(c=>{const added=!!biliList.find(x=>x.d===c.name);return(<button key={c.id} onClick={()=>!added&&addBili(c.name)} style={{background:added?"#051a0a":"#05101a",border:`1px solid ${added?"#1a4a2a":"#0a2a3a"}`,borderRadius:99,padding:"5px 12px",fontFamily:"sans-serif",fontSize:12,color:added?"#4caf50":"#3a7a9a",cursor:added?"default":"pointer"}}>{added?"✓ ":"+ "}{c.name}</button>);})}
                </div>
                <PlatformInput placeholder={t.biliPlaceholder} addLabel={t.addBtn} accentColor="#0088aa" onAdd={addBili}/>
                <ChipList items={biliList} onRemove={raw=>setBili(p=>p.filter(c=>c.raw!==raw))} chipColor="#66ccee" chipBg="#05151f" chipBorder="#1a4a5a" noLabel={t.noCreators}/>
              </div>
            )}

            {recentlyCooked.length>0&&(
              <div style={{background:"#0a1200",border:"1px solid #1a2a0a",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                <span style={{fontFamily:"sans-serif",fontSize:11,color:"#4a6a2a",textTransform:"uppercase",letterSpacing:1}}>🌿 Avoiding repeats: </span>
                <span style={{fontFamily:"sans-serif",fontSize:12,color:"#6a8a4a"}}>{recentlyCooked.slice(0,5).join(" · ")}</span>
              </div>
            )}

            {error&&<div style={{background:"#1a0800",border:"1px solid #5a1a00",borderRadius:10,padding:"10px 14px",color:"#ff6b35",fontFamily:"sans-serif",fontSize:13,marginBottom:12}}>⚠ {error}</div>}

            <button style={{...C.bigBtn,opacity:totalCreators>0&&apiKeySaved?1:0.4,marginBottom:10}} onClick={generate} disabled={!totalCreators||!apiKeySaved}>{t.generateBtn}</button>
            <div style={{textAlign:"center"}}>
              <button style={{...C.ghost,fontSize:13}} onClick={()=>{const meals=extractMeals(SAMPLE);const plan={id:Date.now(),created_at:new Date().toISOString(),text:SAMPLE,meals};setCurrentPlan(plan);setStage("result");}}>{t.previewBtn}</button>
            </div>
          </>
        )}

        {/* ── GENERATING ── */}
        {stage==="generating"&&(
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{fontSize:52,marginBottom:22,animation:"spin 2s linear infinite",display:"inline-block"}}>🍳</div>
            <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,color:"#f5e6c8",marginBottom:8}}>{t.loadingTitle}</div>
            <div style={{fontFamily:"sans-serif",fontSize:14,color:"#6a5a3a"}}>{loadingMsg}</div>
          </div>
        )}

        {/* ── RESULT ── */}
        {stage==="result"&&currentPlan&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",color:"#f5e6c8",margin:0,fontSize:21}}>{t.resultTitle}</h2>
              <div style={{display:"flex",gap:8}}>
                <button style={C.ghost} onClick={()=>{setStage("setup");setCurrentPlan(null);}}>{t.newPlan}</button>
                <button style={C.btn} onClick={()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([currentPlan.text],{type:"text/markdown"}));a.download="meal_plan.md";a.click();}}>{t.save}</button>
              </div>
            </div>
            <MealTracker plan={currentPlan}/>
            <div style={{...C.card,padding:"26px",marginTop:4}}>{parseMd(currentPlan.text)}</div>
            <button style={{...C.bigBtn,marginTop:8}} onClick={()=>{setStage("setup");setCurrentPlan(null);}}>{t.regenerate}</button>
          </>
        )}

        {/* ── HISTORY ── */}
        {stage==="history"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",color:"#f5e6c8",margin:0,fontSize:21}}>{t.historyTitle}</h2>
              <div style={{display:"flex",gap:8}}>
                {history.length>0&&<button style={{...C.ghost,fontSize:12,color:"#8a2020",borderColor:"#3a1010"}} onClick={async()=>{if(window.confirm("Clear all history?")){if(dbReady)await api.clearHistory();setHistory([]);if(!dbReady)localStorage.removeItem("planHistory");}}}>🗑 Clear</button>}
                <button style={C.ghost} onClick={()=>setStage("setup")}>{t.plannerTab}</button>
              </div>
            </div>
            {history.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:"#4a3a1a",fontFamily:"sans-serif",fontSize:15}}>{t.historyEmpty}</div>
              :history.map(plan=>(
                <div key={plan.id} style={{...C.card,marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <span style={{fontFamily:"sans-serif",fontSize:12,color:"#6a5a3a"}}>{t.weekLabel} {new Date(plan.created_at).toLocaleDateString()}</span>
                    <div style={{display:"flex",gap:8}}>
                      <span style={{fontFamily:"sans-serif",fontSize:12,color:"#4caf50"}}>{(plan.meals||[]).filter(m=>m.status==="cooked").length} ✓</span>
                      <span style={{fontFamily:"sans-serif",fontSize:12,color:"#666"}}>{(plan.meals||[]).filter(m=>m.status==="skipped").length} ✗</span>
                    </div>
                  </div>
                  {(plan.meals||[]).map((meal,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:i<plan.meals.length-1?"1px solid #1a1200":"none",gap:8,flexWrap:"wrap"}}>
                      <div>
                        <span style={{fontFamily:"sans-serif",fontSize:12,color:"#6a5a3a"}}>{meal.day} · </span>
                        <span style={{fontFamily:"sans-serif",fontSize:13,color:C.sc(meal.status),textDecoration:meal.status==="skipped"?"line-through":"none"}}>{meal.name}</span>
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        {meal.status!=="cooked"&&<button onClick={()=>updateMeal(plan.id,i,"cooked")} style={{padding:"3px 10px",borderRadius:99,border:"1px solid #1a4a1a",background:"#0a1f0a",color:"#4caf50",fontFamily:"sans-serif",fontSize:11,cursor:"pointer"}}>{t.markCooked}</button>}
                        {meal.status!=="skipped"&&<button onClick={()=>updateMeal(plan.id,i,"skipped")} style={{padding:"3px 10px",borderRadius:99,border:"1px solid #333",background:"#1a1a1a",color:"#666",fontFamily:"sans-serif",fontSize:11,cursor:"pointer"}}>{t.markSkipped}</button>}
                        {meal.status!=="pending"&&<button onClick={()=>updateMeal(plan.id,i,"pending")} style={{padding:"3px 10px",borderRadius:99,border:"1px solid #2a1f0a",background:"transparent",color:"#4a3a1a",fontFamily:"sans-serif",fontSize:11,cursor:"pointer"}}>↩</button>}
                      </div>
                    </div>
                  ))}
                  <button style={{...C.ghost,fontSize:12,marginTop:10,width:"100%",textAlign:"center"}} onClick={()=>{setCurrentPlan(plan);setStage("result");}}>View full plan →</button>
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
}
