const axios = require("axios");

module.exports = {
  config: {
    name: "pickupline",
    aliases: ["pickup", "flirt"],
    version: "1.0",
    author: "Mueid Mursalin Rifat",
    role: 0,
    shortDescription: "💘 Get a cheesy or sweet pickup line",
    longDescription: "Fetches a random smooth or funny pickup line from the CatX Pickupline API.",
    category: "fun",
    guide: {
      en: "{pn}\n\nExample:\n{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://mmr-cat-x-api.onrender.com/api/pickupline");
      const line = res?.data?.pickupline;

      if (!line) {
        return message.reply("😅 Couldn't find a pickup line right now. Try again later!");
      }

      message.reply(`💘 ${line}`);
    } catch (err) {
      console.error("❌ Pickupline API Error:", err.message);
      message.reply("🚫 Failed to fetch a pickup line. Try again shortly.");
    }
  }
};
