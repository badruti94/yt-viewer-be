const YT_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Fetch videos terbaru dari sebuah channel (YouTube Data API v3 Search endpoint)
 * @param {object} args
 * @param {string} args.apiKey
 * @param {string} args.channelId
 * @param {number} args.maxResults
 * @returns {Promise<Array<{title:string, videoId:string, thumbnailUrl:string}>>}
 */
export async function fetchLatestVideos({ apiKey, channelId, maxResults = 10 }) {
    if (!apiKey) throw new Error("Missing apiKey (set YT_API_KEY in env)");
    if (!channelId) throw new Error("Missing channelId");

    const url = new URL(`${YT_BASE_URL}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channelId);
    url.searchParams.set("order", "date");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("key", apiKey);

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`YouTube API error ${res.status}: ${errText}`);
    }

    const data = await res.json();

    const items = Array.isArray(data.items) ? data.items : [];
    return items
        .map((it) => {
            const videoId = it?.id?.videoId;
            const title = it?.snippet?.title;
            const thumbs = it?.snippet?.thumbnails;

            // pilih thumbnail terbaik yang ada
            const thumbnailUrl =
                thumbs?.high?.url ?? thumbs?.medium?.url ?? thumbs?.default?.url ?? null;

            if (!videoId || !title || !thumbnailUrl) return null;

            return { title, videoId, thumbnailUrl };
        })
        .filter(Boolean);
}