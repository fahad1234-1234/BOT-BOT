const axios = require("axios");

module.exports = {
  config: {
    name: "fact",
    aliases: ["funfact", "didyouknow"],
    version: "1.0",
    author: "Mueid Mursalin Rifat",
    role: 0,
    shortDescription: "💡 Get a random fact",
    longDescription: "Fetches a random, interesting fact from CatX Fact API.",
    category: "info",
    guide: {
      en: "{pn}\n\nExample:\n{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://mmr-cat-x-api.onrender.com/api/fact");
      const factMessage = res?.data?.message;

      if (!factMessage) {
        return message.reply("⚠️ Failed to get a fact. Try again later.");
      }

      message.reply(`💡 ${factMessage}`);
    } catch (err) {
      console.error("❌ Fact API error:", err.message);
      message.reply("🚫 Error fetching a fact. Please try again later.");
    }
  }
};
