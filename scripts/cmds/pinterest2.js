const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest2",
    aliases: ["pin2"],
    version: "1.3",
    author: "Mueid Mursalin Rifat 😺",
    countDown: 5,
    role: 0,
    shortDescription: "📌 Pinterest downloader",
    longDescription: "Search or download pins with optional -count (up to 10).",
    category: "media",
    guide: {
      en: "{pn} <keyword> [-count max 10]\n{pn} <pinterest URL>\n\nExamples:\n{pn} cat\n{pn} cat -5\n{pn} https://www.pinterest.com/pin/123..."
    }
  },

  onStart: async function ({ api, event, args }) {
    const base = "https://catx-unidl.onrender.com";
    const tmpPath = path.join(__dirname, "cache");
    let count = 1;

    if (args.length >= 2 && /^-\d+$/.test(args[args.length - 1])) {
      count = Math.min(parseInt(args.pop().slice(1)), 10); // cap at 10
    }

    const query = args.join(" ");
    if (!query) return api.sendMessage("❗ Please enter a keyword or Pinterest URL.", event.threadID, event.messageID);

    try {
      if (query.startsWith("http")) {
        // 🔗 Direct URL Mode
        const res = await axios.get(`${base}/pinterest?url=${encodeURIComponent(query)}`);
        const pin = res.data?.data?.result;
        if (!pin) return api.sendMessage("❌ Couldn't fetch pin.", event.threadID);

        const imageURL = pin.image || pin.images?.orig?.url;
        const filePath = path.join(tmpPath, `pin-${Date.now()}.jpg`);
        const img = await axios.get(imageURL, { responseType: "stream" });
        const writer = fs.createWriteStream(filePath);
        img.data.pipe(writer);

        writer.on("finish", () => {
          api.sendMessage({
            body: `📌 ${pin.title || "Untitled"}\n👤 ${pin.user?.full_name || "Unknown"}\n🔗 ${pin.pin_url || pin.link}`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));
        });

      } else {
        // 🔍 Keyword Mode
        const res = await axios.get(`${base}/pinterest?q=${encodeURIComponent(query)}`);
        const results = res.data?.data?.result?.result;
        if (!results || results.length === 0)
          return api.sendMessage("❌ No Pinterest results found.", event.threadID);

        const selected = results.slice(0, count);
        const attachments = [];
        const captions = [];

        for (let i = 0; i < selected.length; i++) {
          const pin = selected[i];
          const imageURL = pin.image_url || pin.images?.original;
          const fileName = `pin-${i}-${Date.now()}.jpg`;
          const filePath = path.join(tmpPath, fileName);

          const response = await axios.get(imageURL, { responseType: "stream" });
          const writer = fs.createWriteStream(filePath);
          await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          attachments.push(fs.createReadStream(filePath));
          captions.push(
            `📌 Result ${i + 1}\n` +
            `🖼️ ${pin.title || "Untitled"}\n` +
            `👤 ${pin.uploader?.full_name || pin.uploader?.username || "Unknown"}\n` +
            `🔗 ${pin.pin_url}`
          );
        }

        api.sendMessage({
          body: `🔎 Pinterest Search: *${query}*\nShowing ${selected.length} of ${results.length} results:\n\n${captions.join("\n\n")}`,
          attachment: attachments
        }, event.threadID, async () => {
          // Cleanup
          for (const file of attachments) {
            fs.unlinkSync(file.path);
          }
        });
      }
    } catch (err) {
      console.error("Pinterest error:", err);
      api.sendMessage("⚠️ Failed to fetch or send Pinterest content.", event.threadID);
    }
  }
};
