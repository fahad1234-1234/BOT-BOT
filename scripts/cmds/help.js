const { GoatWrapper } = require("fca-liane-utils");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ F A H A D ]"; // changing this wont change the goatbot V2 of list cmd it is just a decoyy 

module.exports = {
  config: {
    name: "help",
    version: "1.0",
    author: "NTKhang",
    usePrefix: false,
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName ",
    },
    priority: 1,
  }, 

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID); 

    if (args.length === 0) {
      const categories = {};
      let msg = ""; 

      msg += ``; // replace with your name 

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue; 

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      } 

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n┍━━━━━━[${category.toUpperCase()}]`; 

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 2).map((item) => `⭓⠀${item}`);
            msg += `\n┋${cmds.join(" ".repeat(Math.max(1, 5 - cmds.join("").length)))}`;
          } 

          msg += `\n┕━━━━━━━━━━━━━━━━━◊`;
        }
      }); 

      const totalCommands = commands.size;
      msg += `\n\n┍━━━[𝙵𝚁𝙾𝙼]━━━◊\n┋𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳𝚂: [${totalCommands}].\n┋𝙾𝚆𝙽𝙴𝚁 : 𝙵𝚊𝚑𝚊𝚍 𝙸𝚜𝚕𝚊𝚖 \n┋𝙿𝚁𝙴𝙵𝙸𝚇 : )\n┕━━━━━━━━━━━◊`;
      msg += ``; 

      const attachment = await axios.get("https://drive.google.com/uc?export=view&id=1McdGcTG42Z0guUuQ-2miJy6iEJanaSWB", { responseType: "stream" }); 

      await message.reply({
        body: msg,
        attachment: attachment.data,
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName)); 

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const otherName=(configCommand.aliases);
        const author = configCommand.author || "Unknown"; 

        const longDescription = (configCommand.longDescription) ? (configCommand.longDescription.en) || "No description" : "No description"; 

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name); 

        const response = `┍━━ ⚠️𝙉𝘼𝙈𝙀⚠️━━━━━◊
┋ ${configCommand.name}
┋━━ 🦆𝙄𝙣𝙛𝙤🦆
┋ 🔰 𝙊𝙏𝙃𝙀𝙍 𝙉𝘼𝙈𝙀𝙎: ${otherName}
┋ 🦆𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣: ${longDescription}
┋ 🔰𝙊𝙏𝙃𝙀𝙍 𝙉𝘼𝙈𝙀𝙎 𝙄𝙉 𝙔𝙊𝙐𝙍 𝙂𝙍𝙊𝙐𝙋: ${configCommand.aliases ? configCommand.aliases.join(", ") : "𝙳𝙾 𝙽𝙾𝚃 𝙷𝙰𝚅𝙴"}
┋ 🦆𝙑𝙚𝙧𝙨𝙞𝙤𝙣: ${configCommand.version || "1.0"}
┋ 🔰𝙍𝙤𝙡𝙚: ${roleText}
┋ 🦆𝙏𝙞𝙢𝙚 𝙥𝙚𝙧 𝙘𝙤𝙢𝙢𝙖𝙣𝙙: ${configCommand.countDown || 1}s
┋ 🔰𝘼𝙪𝙩𝙝𝙤𝙧: ${author}
┋━━ 🔰𝙐𝙨𝙖𝙜𝙚🔰
┋ ${usage}
┋━━ ⚠️𝙉𝙤𝙩𝙚𝙨⚠️
┋ 🔳𝙏𝙝𝙚 𝙘𝙤𝙣𝙩𝙚𝙣𝙩 𝙞𝙣𝙨𝙞𝙙𝙚 <𝙁𝘼𝙃𝘼𝘿> 𝙘𝙖𝙣 𝙗𝙚 𝙘𝙝𝙖𝙣𝙜𝙚𝙙
┋ 🔳𝙏𝙝𝙚 𝙘𝙤𝙣𝙩𝙚𝙣𝙩 𝙞𝙣𝙨𝙞𝙙𝙨 [𝘼|𝘽|𝘾] 𝙞𝙨 𝙖 𝙤𝙧 𝙗 𝙤𝙧 𝙘
┕━━━━━━━━━━━━━━━━━◊`; 

        await message.reply(response);
      }
    }
  },
}; 

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return ("0 (All users)");
    case 1:
      return ("1 (Group administrators)");
    case 2:
      return ("2 (Admin bot)");
    default:
      return ("Unknown role");
  }
  const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
}
