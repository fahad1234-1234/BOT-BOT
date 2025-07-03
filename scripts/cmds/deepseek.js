const axios = require("axios");

const config = {
  name: "deepseek",
  aliases: ["deepai", "ds"],
  description: "Ask anything to Cat-X DeepSeek AI",
  category: "ai",
  usage: "<your question>",
  cooldown: 3,
  author: "Mueid Mursalin Rifat",
  permissions: []
};

async function onStart({ api, event, args }) {
  const query = args.join(" ");
  if (!query) {
    return api.sendMessage("❌ Please provide a message.\n\nExample: deepseek What is a black hole?", event.threadID, event.messageID);
  }

  const thinking = await api.sendMessage("💬 Thinking...", event.threadID);

  try {
    const res = await axios.get(`https://mmr-cat-x-api.onrender.com/api/deepseek?query=${encodeURIComponent(query)}`);
    const reply = res?.data?.response;

    if (!reply) {
      api.sendMessage("⚠️ No response received from DeepSeek AI.", event.threadID, event.messageID);
    } else {
      api.sendMessage(`🤖 ${reply.trim()}`, event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("🚫 Error: Could not reach Cat-X DeepSeek server.", event.threadID, event.messageID);
  }

  api.unsendMessage(thinking.messageID);
}

module.exports = {
  config,
  onStart
};
