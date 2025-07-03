const { google } = require("googleapis");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const stream = require("stream");
const { Buffer } = require('buffer');
const fs = require('fs');

dotenv.config({ override: true });

const API_KEY = "AIzaSyCjHC9xWZQ_SrNjRCuCRAbhdUQfaFwqGec";
const model = "gemini-1.5-flash-latest";
const GENAI_DISCOVERY_URL = `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta&key=${API_KEY}`;

let uid;
let prompt;
let fileUrls = [];
let totalTimeInSeconds;
let wordCount;

async function imageUrlToBase64(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}

async function uploadImageAndGetFileData(genaiService, auth, imageUrl) {
    if (!imageUrl.startsWith("http")) return null;
    const imageBase64 = await imageUrlToBase64(imageUrl);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(imageBase64, "base64"));
    const media = { mimeType: "image/png", body: bufferStream };
    const body = { file: { displayName: "Uploaded Image" } };
    const createFileResponse = await genaiService.media.upload({ media, auth, requestBody: body });
    const file = createFileResponse.data.file;
    return { file_uri: file.uri, mime_type: file.mimeType };
}

function saveUrls(uid, urls) {
    const urlsFile = `uids/${uid}_urls_gemini_1.5_flash.json`;
    try {
        if (urls && urls.length > 0) {
            const absoluteUrls = urls.filter(url => url.startsWith("http"));
            if (fs.existsSync(urlsFile)) fs.unlinkSync(urlsFile);
            fs.writeFileSync(urlsFile, JSON.stringify(absoluteUrls, null, 2));
        } else {
            const existingUrls = loadUrls(uid);
            fs.writeFileSync(urlsFile, JSON.stringify(existingUrls, null, 2));
        }
    } catch (error) {
        console.error(`Error saving URLs for UID ${uid}:`, error);
    }
}

function loadUrls(uid) {
    const urlsFile = `uids/${uid}_urls_gemini_1.5_flash.json`;
    try {
        if (fs.existsSync(urlsFile)) {
            const fileData = fs.readFileSync(urlsFile, 'utf8');
            return JSON.parse(fileData);
        } else return [];
    } catch (error) {
        console.error(`Error loading URLs for UID ${uid}:`, error);
        return [];
    }
}

function loadChatHistory(uid) {
    const chatHistoryFile = `uids/${uid}_gemini_1.5_flash.json`;
    try {
        if (fs.existsSync(chatHistoryFile)) {
            const fileData = fs.readFileSync(chatHistoryFile, 'utf8');
            return JSON.parse(fileData);
        } else return [];
    } catch (error) {
        console.error(`Error loading chat history for UID ${uid}:`, error);
        return [];
    }
}

function appendToChatHistory(uid, chatHistory) {
    const chatHistoryFile = `uids/${uid}_gemini_1.5_flash.json`;
    try {
        if (!fs.existsSync('uids')) fs.mkdirSync('uids');
        fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (error) {
        console.error(`Error saving chat history for UID ${uid}:`, error);
    }
}

async function getTextGemini(uid, prompt = "", fileUrls, reply) {
    const genaiService = await google.discoverAPI({ url: GENAI_DISCOVERY_URL });
    const auth = new google.auth.GoogleAuth().fromAPIKey(API_KEY);
    const startTime = Date.now();
    let savedUrls = [];
    let chatHistory = loadChatHistory(uid);

    const updatedPrompt = chatHistory
        .flatMap(message => message.parts.map(part => part.text))
        .join('\n')
        .trim() + '\n' + prompt;

    if (reply) {
        if (fileUrls?.length) {
            saveUrls(uid, [], false);
            saveUrls(uid, fileUrls, true);
            savedUrls = fileUrls;
        } else {
            savedUrls = loadUrls(uid);
            saveUrls(uid, savedUrls, false);
        }
    } else {
        if (fileUrls?.length) {
            saveUrls(uid, fileUrls, true);
            savedUrls = fileUrls;
        } else {
            savedUrls = [];
            saveUrls(uid, [], false);
        }
    }

    const fileDataParts = [];
    if (savedUrls.length > 0) {
        for (const fileUrl of savedUrls) {
            const fileData = await uploadImageAndGetFileData(genaiService, auth, fileUrl);
            if (fileData) fileDataParts.push({ file_data: fileData });
        }
    }

    const contents = {
        contents: [
            {
                role: "user",
                parts: [{ text: updatedPrompt }, ...fileDataParts],
            },
        ],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generation_config: {
            maxOutputTokens: 8192,
            temperature: 0.7,
            topP: 0.8,
        },
    };

    const response = await genaiService.models.generateContent({
        model: `models/${model}`,
        requestBody: contents,
        auth,
        tools: [{ codeExecution: {} }],
    });

    const endTime = Date.now();
    totalTimeInSeconds = (endTime - startTime) / 1000;
    wordCount = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.split(/\s+/).length || 0;

    const modelMessage = {
        role: "model",
        parts: [{ text: response?.data?.candidates?.[0]?.content?.parts?.[0]?.text }],
    };

    chatHistory.push({ role: "user", parts: [{ text: prompt, file_url: fileUrls.join(",") }] });
    chatHistory.push(modelMessage);

    appendToChatHistory(uid, chatHistory);

    return modelMessage.parts[0].text;
}

function clearChatHistory(uid) {
    const chatHistoryFile = `uids/${uid}_gemini_1.5_flash.json`;
    const urlsFile = `uids/${uid}_urls_gemini_1.5_flash.json`;

    try {
        if (fs.existsSync(chatHistoryFile)) {
            fs.unlinkSync(chatHistoryFile);
            console.log(`Chat history for UID ${uid} cleared.`);
        }
        if (fs.existsSync(urlsFile)) {
            fs.unlinkSync(urlsFile);
            console.log(`URLs for UID ${uid} cleared.`);
        }
    } catch (error) {
        console.error(`Error clearing history for UID ${uid}:`, error);
    }
}

module.exports = {
    config: {
        name: "gemini",
        aliases: ["g"],
        version: "1.3-fixed",
        author: "Mueid Mursalin Rifat",
        countDown: 5,
        role: 0,
        description: {
            en: "Google Gemini 1.5 Flash: Text + Image chat. Up to 1M token context."
        },
        guide: {
            en: "{pn} <your prompt> (reply to text/image for context)"
        },
        category: "ai",
    },
    onStart: async function ({ api, message, event, args, commandName }) {
        prompt = args.join(" ");
        uid = event.senderID;

        if (prompt.toLowerCase() === "clear") {
            clearChatHistory(uid);
            return message.reply(`✅ Chat history cleared for UID: ${uid}`);
        }

        const isReply = event.type === "message_reply";
        const replyAttachments = isReply ? event.messageReply.attachments : [];
        const replyText = isReply ? event.messageReply.body : "";

        if (fs.existsSync(`uids/${uid}_urls_gemini_1.5_flash.json`)) {
            fs.unlinkSync(`uids/${uid}_urls_gemini_1.5_flash.json`);
            fileUrls = [];
        }

        if (isReply && replyAttachments.length > 0) {
            for (let img of replyAttachments) {
                if (img?.url?.startsWith("http")) fileUrls.push(img.url);
            }
        }

        const fullPrompt = isReply ? `${prompt} ${replyText}` : prompt;

        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        try {
            const response = await getTextGemini(uid, fullPrompt, fileUrls, false);
            message.reply(response, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                        replyToMessageID: isReply ? event.messageReply.messageID : event.messageID
                    });
                }
            });
            api.setMessageReaction("✅", event.messageID, () => { }, true);
        } catch (e) {
            message.reply(`❌ ${e.message}`);
            api.setMessageReaction("❌", event.messageID, () => { }, true);
        }
    },
    onReply: async function ({ api, message, event, Reply, args }) {
        if (event.senderID !== Reply.author) return;
        prompt = args.join(" ");
        uid = event.senderID;

        if (event.attachments?.length) {
            fileUrls = event.attachments
                .map(a => a.url)
                .filter(url => url?.startsWith("http"));
        }

        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        try {
            const response = await getTextGemini(uid, prompt, fileUrls, false);
            message.reply(response, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: Reply.commandName,
                        messageID: info.messageID,
                        author: uid,
                    });
                }
            });
            api.setMessageReaction("✅", event.messageID, () => { }, true);
        } catch (err) {
            message.reply(`❌ ${err.message}`);
            api.setMessageReaction("❌", event.messageID, () => { }, true);
        }
    }
}
