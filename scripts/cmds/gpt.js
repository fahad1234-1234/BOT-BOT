const axios = require("axios");

const config = {
  name: "gpt",
  aliases: ["chatgpt", "ai"],
  description: "Ask GPT-3.5 anything using Cat-X API",
  category: "ai",
  usage: "<your question>",
  cooldown: 3,
  author: "Mueid Mursalin Rifat",
  permissions: []
};

async function onStart({ api, event, args }) {
  const question = args.join(" ");
  if (!question) {
    return api.sendMessage("❌ Please enter a question.\n\nExample: gpt What is quantum computing?", event.threadID, event.messageID);
  }

  const thinking = await api.sendMessage("💬 Thinking...", event.threadID);

  try {
    const res = await axios.get(`https://mmr-cat-x-api.onrender.com/api/gpt3?q=${encodeURIComponent(question)}`);
    const answer = res?.data?.answer;

    if (!answer) {
      api.sendMessage("⚠️ AI did not return an answer.", event.threadID, event.messageID);
    } else {
      api.sendMessage(`🤖 ${answer}`, event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
    api.sendMessage("🚫 Error: Unable to reach Cat-X AI server.", event.threadID, event.messageID);
  }

  // Remove "Thinking..." message
  api.unsendMessage(thinking.messageID);
}

module.exports = {
  config,
  onStart
};
