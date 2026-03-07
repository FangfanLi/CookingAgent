// Vercel serverless function: fetch recent videos from YouTube (RSS) and Bilibili
// POST /api/videos
// Body: { youtube: [{ name, channelId? }], bilibili: [{ name, uid? }] }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { youtube = [], bilibili = [] } = req.body;

  const ytPromises = youtube.map(async (creator) => {
    try {
      let channelId = creator.channelId;
      if (!channelId) {
        channelId = await resolveYouTubeChannelId(creator.name);
      }
      if (!channelId) return null;

      const videos = await fetchYouTubeRSS(channelId);
      return { name: creator.name, platform: "youtube", videos: pickVideos(videos) };
    } catch (e) {
      console.error(`YouTube error for ${creator.name}:`, e.message);
      return null;
    }
  });

  const biliPromises = bilibili.map(async (creator) => {
    try {
      let uid = creator.uid;
      if (!uid && creator.name.startsWith("UID:")) {
        uid = creator.name.slice(4);
      }
      if (!uid) {
        uid = await resolveBilibiliUid(creator.name);
      }
      console.log("[Bilibili] creator:", creator.name, "resolved UID:", uid);
      if (!uid) return bilibiliFallback(creator.name);

      const videos = await fetchBilibiliVideos(uid);
      console.log("[Bilibili] creator:", creator.name, "videos found:", videos.length);
      if (!videos.length) return bilibiliFallback(creator.name);
      return { name: creator.name, platform: "bilibili", videos: pickVideos(videos) };
    } catch (e) {
      console.error(`[Bilibili] error for ${creator.name}:`, e.message);
      return bilibiliFallback(creator.name);
    }
  });

  const all = await Promise.all([...ytPromises, ...biliPromises]);
  return res.status(200).json({ creators: all.filter(Boolean) });
}

// ── YouTube ──────────────────────────────────────────────────────────────────

async function resolveYouTubeChannelId(input) {
  // Try fetching the channel page and extracting channelId from HTML
  const handle = input.startsWith("@") ? input : `@${input.replace(/\s+/g, "")}`;
  const res = await fetch(`https://www.youtube.com/${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MealPlanner/1.0)" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/);
  return match ? match[1] : null;
}

async function fetchYouTubeRSS(channelId) {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );
  if (!res.ok) return [];
  const xml = await res.text();

  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const titleMatch = match[1].match(/<media:title>([\s\S]*?)<\/media:title>/);
    const idMatch = match[1].match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/);
    if (titleMatch && idMatch) {
      entries.push({
        title: titleMatch[1].trim(),
        url: `https://www.youtube.com/watch?v=${idMatch[1].trim()}`,
      });
    }
  }
  return entries;
}

// ── Bilibili ─────────────────────────────────────────────────────────────────

async function resolveBilibiliUid(name) {
  const url = `https://api.bilibili.com/x/web-interface/search/type?search_type=bili_user&keyword=${encodeURIComponent(name)}`;
  console.log("[Bilibili] resolving UID for:", name, "url:", url);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MealPlanner/1.0)" },
  });
  const data = await res.json();
  console.log("[Bilibili] search response code:", data?.code, "results:", data?.data?.result?.length ?? 0);
  const first = data?.data?.result?.[0];
  return first ? String(first.mid) : null;
}

async function fetchBilibiliVideos(uid) {
  const url = `https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=30&pn=1&order=pubdate`;
  console.log("[Bilibili] fetching videos for UID:", uid, "url:", url);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MealPlanner/1.0)" },
  });
  const data = await res.json();
  console.log("[Bilibili] videos response code:", data?.code, "message:", data?.message, "vlist length:", data?.data?.list?.vlist?.length ?? 0);
  const vlist = data?.data?.list?.vlist || [];
  return vlist.map((v) => ({
    title: v.title,
    url: `https://www.bilibili.com/video/${v.bvid}`,
  }));
}

// ── Pick 5 recent + 10 random ────────────────────────────────────────────────

function pickVideos(titles) {
  if (!titles.length) return { recent: [], random: [] };

  const recent = titles.slice(0, 5);
  const rest = titles.slice(5);

  // Fisher-Yates shuffle
  const shuffled = [...rest];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return { recent: recent, random: shuffled.slice(0, 10) };
}

// When Bilibili API fails, return the creator with a search-link fallback
// so they still get included in meal selection
function bilibiliFallback(name) {
  return {
    name,
    platform: "bilibili",
    videos: {
      recent: [{ title: name, url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(name)}` }],
      random: [],
    },
  };
}
