const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1501757822323396668/3JpGpBG1DzWv2P0QThVja5yGddLS5bPRexv4dhi4ZlJQ4lEmjm_RTgrPPq1yUHX52sMn";
const PORT = process.env.PORT || 3000;

function getTimestamp() {
    return new Date().toISOString();
}

function formatDate(accountAge) {
    const ms = Date.now() - accountAge * 86400 * 1000;
    return new Date(ms).toISOString().split("T")[0];
}

async function getRobloxLocale(userId) {
    try {
        const res = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        const data = res.data;

        let country = "Unknown";
        let city = "Unknown";

        if (data.locale) {
            const localeParts = data.locale.split("_");
            const countryCode = localeParts[1] || localeParts[0];

            const countryMap = {
                "ID": "Indonesia", "US": "United States", "GB": "United Kingdom",
                "MY": "Malaysia", "SG": "Singapore", "PH": "Philippines",
                "TH": "Thailand", "VN": "Vietnam", "AU": "Australia",
                "CA": "Canada", "DE": "Germany", "FR": "France",
                "JP": "Japan", "KR": "South Korea", "BR": "Brazil",
                "IN": "India", "MX": "Mexico", "NL": "Netherlands",
                "RU": "Russia", "TR": "Turkey", "SA": "Saudi Arabia",
                "AE": "United Arab Emirates", "PK": "Pakistan", "NG": "Nigeria"
            };

            country = countryMap[countryCode] || countryCode;
        }

        if (data.created) {
            city = new Date(data.created).toISOString().split("T")[0];
        }

        return { country, accountCreatedAt: city };
    } catch {
        return { country: "Unknown", accountCreatedAt: "Unknown" };
    }
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

    if (serverKey !== "060405") {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const localeInfo = await getRobloxLocale(userId);
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
                            `Username       : ${username}`,
                            `Display Name   : ${displayName}`,
                            `User ID        : ${userId}`,
                            `Account Age    : ${accountAge} Days`,
                            `Account Created: ${createdDate}`,
                            `Device Type    : ${deviceType}`,
                            "```"
                        ].join("\n"),
                        inline: false
                    },
                    {
                        name: "🌐 ACCOUNT INFORMATION",
                        value: [
                            "```",
                            `Country        : ${localeInfo.country}`,
                            `Created At     : ${localeInfo.accountCreatedAt}`,
                            `Source         : Roblox Account Data`,
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
