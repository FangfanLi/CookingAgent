// Debug endpoint: test Bilibili API directly
// GET /api/debug-bili?uid=502299736
// Returns raw API response so we can see what's happening

export default async function handler(req, res) {
  const uid = req.query.uid || "502299736"; // 锅铲居士 as default
  const name = req.query.name;

  const results = {};

  // Test 1: If name provided, try resolving UID
  if (name) {
    try {
      const searchUrl = `https://api.bilibili.com/x/web-interface/search/type?search_type=bili_user&keyword=${encodeURIComponent(name)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MealPlanner/1.0)" },
      });
      const searchData = await searchRes.json();
      results.search = {
        url: searchUrl,
        status: searchRes.status,
        code: searchData?.code,
        message: searchData?.message,
        resultCount: searchData?.data?.result?.length ?? 0,
        firstResult: searchData?.data?.result?.[0] ? {
          mid: searchData.data.result[0].mid,
          uname: searchData.data.result[0].uname,
        } : null,
      };
    } catch (e) {
      results.search = { error: e.message };
    }
  }

  // Test 2: Fetch videos by UID
  try {
    const videoUrl = `https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=5&pn=1&order=pubdate`;
    const videoRes = await fetch(videoUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MealPlanner/1.0)" },
    });
    const videoData = await videoRes.json();
    results.videos = {
      url: videoUrl,
      status: videoRes.status,
      code: videoData?.code,
      message: videoData?.message,
      videoCount: videoData?.data?.list?.vlist?.length ?? 0,
      sampleVideos: (videoData?.data?.list?.vlist || []).slice(0, 3).map(v => ({
        title: v.title,
        bvid: v.bvid,
        url: `https://www.bilibili.com/video/${v.bvid}`,
      })),
    };
  } catch (e) {
    results.videos = { error: e.message };
  }

  return res.status(200).json(results);
}
