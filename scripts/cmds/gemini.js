const axios = require("axios");

const config = {
  name: "gemini",
  aliases: ["gemi", "gptgemini"],
  description: "Ask Cat-X Gemini AI anything",
  category: "ai",
  usage: "<your question>",
  cooldown: 3,
  author: "Mueid Mursalin Rifat",
  permissions: []
};

async function onStart({ api, event, args }) {
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("❌ Please provide a message.\n\nExample: gemini How do airplanes fly?", event.threadID, event.messageID);
  }

  const thinking = await api.sendMessage("💬 Thinking...", event.threadID);

  try {
    const res = await axios.get(`https://mmr-cat-x-api.onrender.com/api/gemini?text=${encodeURIComponent(prompt)}`);
    const data = res.data;

    if (!data || !data.response) {
      api.sendMessage("⚠️ No response received from Cat-X Gemini.", event.threadID, event.messageID);
    } else {
      const reply = `🤖 ${data.response.trim()}\n\n🔋 Powered by: ${data.powered_by || "Cat-X Gemini AI"}`;
      api.sendMessage(reply, event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("🚫 Error: Could not reach Cat-X Gemini server.", event.threadID, event.messageID);
  }

  // Remove "Thinking..." loader
  api.unsendMessage(thinking.messageID);
}

module.exports = {
  config,
  onStart
};
