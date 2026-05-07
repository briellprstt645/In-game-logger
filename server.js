const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1501757822323396668/3JpGpBG1DzWv2P0QThVja5yGddLS5bPRexv4dhi4ZlJQ4lEmjm_RTgrPPq1yUHX52sMn";
const PORT = process.env.PORT || 3000;

const LOCALE_MAP = {
    "id_id": { country: "Indonesia", city: "Jakarta" },
    "en_us": { country: "United States", city: "N/A" },
    "en_gb": { country: "United Kingdom", city: "London" },
    "ms_my": { country: "Malaysia", city: "Kuala Lumpur" },
    "zh_cn": { country: "China", city: "Beijing" },
    "zh_tw": { country: "Taiwan", city: "Taipei" },
    "th_th": { country: "Thailand", city: "Bangkok" },
    "vi_vn": { country: "Vietnam", city: "Hanoi" },
    "ph_ph": { country: "Philippines", city: "Manila" },
    "ko_kr": { country: "South Korea", city: "Seoul" },
    "ja_jp": { country: "Japan", city: "Tokyo" },
    "de_de": { country: "Germany", city: "Berlin" },
    "fr_fr": { country: "France", city: "Paris" },
    "es_es": { country: "Spain", city: "Madrid" },
    "es_mx": { country: "Mexico", city: "Mexico City" },
    "pt_br": { country: "Brazil", city: "Sao Paulo" },
    "it_it": { country: "Italy", city: "Rome" },
    "ru_ru": { country: "Russia", city: "Moscow" },
    "tr_tr": { country: "Turkey", city: "Istanbul" },
    "ar_001": { country: "Arabic Region", city: "N/A" },
    "nl_nl": { country: "Netherlands", city: "Amsterdam" },
    "pl_pl": { country: "Poland", city: "Warsaw" },
    "sv_se": { country: "Sweden", city: "Stockholm" },
    "nb_no": { country: "Norway", city: "Oslo" },
    "da_dk": { country: "Denmark", city: "Copenhagen" },
    "fi_fi": { country: "Finland", city: "Helsinki" },
    "cs_cz": { country: "Czech Republic", city: "Prague" },
    "hu_hu": { country: "Hungary", city: "Budapest" },
    "ro_ro": { country: "Romania", city: "Bucharest" },
    "uk_ua": { country: "Ukraine", city: "Kyiv" },
    "bg_bg": { country: "Bulgaria", city: "Sofia" },
    "hr_hr": { country: "Croatia", city: "Zagreb" },
    "sk_sk": { country: "Slovakia", city: "Bratislava" },
    "el_gr": { country: "Greece", city: "Athens" },
    "he_il": { country: "Israel", city: "Tel Aviv" },
    "hi_in": { country: "India", city: "New Delhi" },
    "bn_bd": { country: "Bangladesh", city: "Dhaka" },
    "ur_pk": { country: "Pakistan", city: "Karachi" },
    "fa_ir": { country: "Iran", city: "Tehran" },
    "ar_sa": { country: "Saudi Arabia", city: "Riyadh" },
    "ar_ae": { country: "UAE", city: "Dubai" },
    "en_au": { country: "Australia", city: "Sydney" },
    "en_ca": { country: "Canada", city: "Toronto" },
    "en_sg": { country: "Singapore", city: "Singapore" },
    "en_nz": { country: "New Zealand", city: "Auckland" },
    "en_za": { country: "South Africa", city: "Cape Town" },
    "sw_tz": { country: "Tanzania", city: "Dar es Salaam" },
    "yo_ng": { country: "Nigeria", city: "Lagos" }
};

function getTimestamp() {
    return new Date().toISOString();
}

function formatDate(accountAge) {
    const ms = Date.now() - accountAge * 86400 * 1000;
    return new Date(ms).toISOString().split("T")[0];
}

async function getAccountLocation(userId) {
    try {
        const res = await axios.get(`https://users.roblox.com/v1/users/${userId}`, {
            headers: { "Accept": "application/json" }
        });

        const locale = (res.data.locale || "").toLowerCase();
        const info = LOCALE_MAP[locale];

        if (info) {
            return {
                country: info.country,
                city: info.city,
                locale: locale || "Unknown"
            };
        }

        if (locale) {
            const parts = locale.split("_");
            return {
                country: parts[1]?.toUpperCase() || "Unknown",
                city: "Unknown",
                locale: locale
            };
        }

        return { country: "Unknown", city: "Unknown", locale: "Unknown" };
    } catch {
        return { country: "Unknown", city: "Unknown", locale: "Unknown" };
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

    const location = await getAccountLocation(userId);
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
                        name: "🌐 ACCOUNT LOCATION",
                        value: [
                            "```",
                            `Country  : ${location.country}`,
                            `City     : ${location.city}`,
                            `Locale   : ${location.locale}`,
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
