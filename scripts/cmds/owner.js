const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
	config: {
		name: "info",
   aliases: ["owner", "botinfo" ],
		version: "1.0",
		author: "NTKhang",
		countDown: 20,
		role: 0,
		shortDescription: { vi: "", en: "" },
		longDescription: { vi: "", en: "" },
		category: "owner",
		guide: { en: "" },
		envConfig: {}
	},
	onStart: async function ({ message }) {
		const authorName = " ⩸_ 𝙵𝙰 𝙷 𝙰𝙳 _⩸ ";
		const ownAge = "『 ⩸_ 17 _⩸ 』";
		const messenger = " //m.me/bd.fahad.12321";
		const authorFB = " //www.facebook.com/bd.fahad.12321";
		const authorNumber = "01813999051";
		const Status = "⩸____⩸";
		const urls = [
"https://drive.google.com/uc?export=download&id=1DgG0l3a1-Vv577jThpOV585nI3Oi_Sz-",
"https://drive.google.com/uc?export=download&id=1tnVHUwPgyAnxuRKEs_X9YZUkaVen9mzs"
];
		const link = urls[Math.floor(Math.random() * urls.length)];
		const now = moment().tz('Asia/Jakarta');
		const date = now.format('MMMM Do YYYY');
		const time = now.format('h:mm:ss A');
		const uptime = process.uptime();
		const seconds = Math.floor(uptime % 60);
		const minutes = Math.floor((uptime / 60) % 60);
		const hours = Math.floor((uptime / (60 * 60)) % 24);
		const days = Math.floor(uptime / (60 * 60 * 24));
		const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

		message.reply({
			body: `🦆《 𝐁𝐨𝐭 𝐀𝐧𝐝 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 》🦆
\🤖彡𝐁𝐨𝐭 𝐍𝐚𝐦𝐞 :  ${global.GoatBot.config.nickNameBot}
\👾彡𝐁𝐨𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐏𝐫𝐞𝐟𝐢𝐱 : ${global.GoatBot.config.prefix}
\💙彡𝐎𝐰𝐧𝐞𝐫 𝐍𝐚𝐦𝐞 : ${authorName}
\📝彡𝐀𝐠𝐞  : ${ownAge}
\💕彡𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐒𝐡𝐢𝐩 : ${Status}
\🌐彡𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 : ${authorNumber}
\🌍彡𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 :  ${authorFB}
\🗓彡𝐃𝐚𝐭𝐞 : ${date}
\⏰彡𝐍𝐨𝐰 𝐓𝐢𝐦𝐞 : ${time}
\🔰彡𝐀𝐧𝐲 𝐇𝐞𝐥𝐩 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 : ${messenger}__⩸
\📛彡𝐁𝐨𝐭 𝐈𝐬 𝐑𝐮𝐧𝐧𝐢𝐧𝐠 𝐅𝐨𝐫 : ${uptimeString}
\===============`,
			attachment: await global.utils.getStreamFromURL(link)
		});
	},
	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "info") {
			this.onStart({ message });
		}
	}
};
