import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fetchLatestVideos } from "./youtube.service.js";
import { channels } from "./channels.data.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const YT_API_KEY = process.env.YT_API_KEY;

app.use(cors());

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * GET /api/channels
 * return: { channels: [{name, id}] }
 */
app.get("/api/channels", (_req, res) => {
    return res.json({ channels });
});

/**
 * GET /api/youtube/videos?channelId=...&limit=10
 * return: { channelId, videos: [{title, videoId, thumbnailUrl}] }
 */
app.get("/api/youtube/videos", async (req, res) => {
    try {
        const channelId = String(req.query.channelId || "").trim();
        const limitRaw = req.query.limit;
        const limit = Math.min(Math.max(Number(limitRaw || 10), 1), 50); // 1..50

        if (!channelId) {
            return res.status(400).json({
                error: "channelId is required",
                example: "/api/youtube/videos?channelId=UCCMJRdfvGz95Awe86FPsf3w&limit=10",
            });
        }

        const videos = await fetchLatestVideos({
            apiKey: YT_API_KEY,
            channelId,
            maxResults: limit,
        });

        return res.json({ channelId, videos });
    } catch (err) {
        return res.status(500).json({
            error: err?.message || "Internal Server Error",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});