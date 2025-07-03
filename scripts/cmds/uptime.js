const os = require("os");
const { createCanvas, loadImage } = require("canvas");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const moment = require("moment-timezone");
const fs = require("fs");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "1.5.2",
    author: "Fahad",
    role: 0,
    noPrefix: true,
    shortDescription: {
      en: "Check bot uptime with image."
    },
    longDescription: {
      en: "Generates an image with uptime info and sends system stats as text."
    },
    category: "system",
    guide: {
      en: "Just type 'uptime', 'upt', or 'up'"
    }
  },

  onStart: async function () {},

  onChat: async function ({ message, event, usersData, threadsData }) {
    const prefix = global.GoatBot.config.prefix;
    const body = (event.body || "").toLowerCase().trim();
    const triggers = [`uptime`, `upt`, `up`, `${prefix}uptime`, `${prefix}upt`, `${prefix}up`];
    if (!triggers.includes(body)) return;

    try {
      const uptimeSec = process.uptime();
      const days = Math.floor(uptimeSec / 86400);
      const hours = Math.floor((uptimeSec % 86400) / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = Math.floor(uptimeSec % 60);
      const formattedUptime = `${days}/${hours}/${minutes}/${seconds}`;

      const osType = os.type();
      const osRelease = os.release();
      const arch = os.arch();
      const cpu = os.cpus()[0].model;
      const totalMemMB = os.totalmem() / 1024 / 1024;
      const freeMemMB = os.freemem() / 1024 / 1024;
      const usedMemMB = totalMemMB - freeMemMB;
      const loadAvg = os.loadavg()[0].toFixed(2);
      const disk = await getDiskUsage();
      const totalUsers = (await usersData.getAll()).length;
      const totalThreads = (await threadsData.getAll()).length;
      const currentTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");

      // Create image
      const background = await loadImage("https://i.imgur.com/0vNO7Fz.jpeg");
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, 1000, 500);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 5;

      // Custom uptime text
      ctx.fillText("SYSTEM UPTIME", 500, 390);
      ctx.fillText("──────────────", 500, 430);
      ctx.fillText(`BOT UPTIME: ${days}D ${hours}H ${minutes}M ${seconds}S`, 500, 470);

      const imagePath = `${__dirname}/uptime_img.png`;
      fs.writeFileSync(imagePath, canvas.toBuffer());

      await message.reply({
        body: ``,
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath);
    } catch (e) {
      console.error(e);
      message.reply("❌ An error occurred while generating uptime.");
    }
  }
};

async function getDiskUsage() {
  const { stdout } = await exec("df -k /");
  const lines = stdout.split("\n");
  const diskLine = lines[1].split(/\s+/);
  const total = parseInt(diskLine[1]) * 1024;
  const used = parseInt(diskLine[2]) * 1024;
  return { total, used };
}
