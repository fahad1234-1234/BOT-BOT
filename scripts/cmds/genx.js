const axios = require("axios");

module.exports = {
  config: {
    name: "genx",
    aliases: ["gen+", "imaginex"],
    version: "1.3",
    author: "Mueid Mursalin Rifat",
    role: 2,
    shortDescription: "🎨 Turn words into AI-powered art",
    longDescription: "Just describe anything in words, and watch it transform into a stunning AI-generated image. ✨Api: CatX-GenX 🖋️",
    category: "ai",
    guide: {
      en: "{pn} [your prompt]\n\n💡 Example:\n{pn} a floating castle in the sky\n{pn} neon samurai riding a tiger"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply(
        "⚠️ Oops! You forgot to include a prompt.\n\nTry something like:\n📌 {pn} galaxy fox in a dreamscape"
      );
    }

    const apiURL = `https://mmr-cat-x-api.onrender.com/api/genx?q=${encodeURIComponent(prompt)}`;

    let loadingMessage;
    try {
      // Send "Creating..." message and store the messageID
      loadingMessage = await message.reply("🎬 Creating your masterpiece... Hang tight! 🧠💫");

      // Get image stream
      const response = await axios.get(apiURL, { responseType: "stream" });

      // Send image with caption
      await message.reply({
        body: `✅ Your AI image is ready!\n\n📝 API: CatX-GenX\n🔖 Dev: Mueid Mursalin Rifat\n📷 Powered by your imagination.`,
        attachment: response.data
      });

    } catch (err) {
      console.error("❌ GenX API Error:", err.message);
      message.reply("🚫 Something went wrong while generating the image.\nPlease try again shortly. 🛠️");
    }

    // Auto remove the loading message
    if (loadingMessage?.messageID) {
      message.unsend(loadingMessage.messageID);
    }
  }
};
