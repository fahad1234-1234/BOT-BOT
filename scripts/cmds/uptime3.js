module.exports = {
	config: {
		name: "uptime3",
		aliases: ["up3", "upt3"],
		version: "1.0",
		author: "Fahad",
		role: 0,
		shortDescription: {
			en: "Displays the uptime of the bot."
		},
		longDescription: {
			en: "Displays the amount of time that the bot has been running for."
		},
		category: "System",
		guide: {
			en: "Use {p}uptime to display the uptime of the bot."
		}
	},
	onStart: async function ({ api, event, args }) {
		const uptime = process.uptime();
		const seconds = Math.floor(uptime % 60);
		const minutes = Math.floor((uptime / 60) % 60);
		const hours = Math.floor((uptime / (60 * 60)) % 24);
		const days = Math.floor(uptime / (60 * 60 * 24));
		const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} second`;
		api.sendMessage(` 
┍━━━━━━━━┑
   𝙃𝙚𝙡𝙡𝙤 𝙈𝙖𝙨𝙩𝙚𝙧 🦆
┕━━━━━━━━┙
╔══════════════════════════╗
  𝙔𝙤𝙪𝙧 𝘽𝙤𝙩 𝙃𝙖𝙨 𝘽𝙚𝙚𝙣 𝙍𝙪𝙣𝙣𝙞𝙣𝙜 𝙁𝙤𝙧 𝙧𝙚𝙣𝙙𝙚𝙧 ╚══════════════════════════╝
   ${uptimeString}.`, event.threadID);
	}
};
