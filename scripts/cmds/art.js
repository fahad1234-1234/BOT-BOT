const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "art",
    aliases: ["artx", "catx-art"],
    version: "1.0",
    author: "Mueid Mursalin Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "🎨 Generate a beautiful AI art from text",
    longDescription: "Transform your imagination into stunning AI-generated artwork using just a few words! 🧠✨",
    category: "ai",
    guide: {
      en: "{pn} <prompt>\n\nExample:\n{pn} A dragon flying over the moon 🌕"
    }
  },

  onStart: async function ({ message, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("⚠️ Please provide a prompt to generate art.\n\nExample:\nart A cyberpunk city at night 🌃");
    }

    const apiUrl = `https://mmr-cat-x-api.onrender.com/api/art?q=${encodeURIComponent(prompt)}`;
    const imgPath = path.join(__dirname, "tmp", `art_${event.senderID}_${Date.now()}.png`);

    let loadingMessage;
    try {
      loadingMessage = await message.reply(
        `✅ Generating your AI art masterpiece for:\n👉 "${prompt}"\nPlease wait a moment... 🖼️`
      );

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, response.data);

      await message.reply({
        body: `✅ Here's your AI-generated artwork! 🎨\nPrompt: "${prompt}"\n\n✨ API: CatX-Art\n👨‍💻 Dev: Mueid Mursalin Rifat`,
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);
    } catch (err) {
      console.error("❌ Art generation failed:", err.message);
      message.reply("⚠️ Failed to generate art. Please try again later.");
    }

    // Clean up loading message
    if (loadingMessage?.messageID) {
      message.unsend(loadingMessage.messageID);
    }
  }
};
