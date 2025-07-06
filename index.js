// 🌐 EXPRESS SERVER — For keeping the bot alive 24/7
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Quinx AI Bot is alive!');
});

app.listen(port, () => {
  console.log(`🌐 Keep-alive server running on port ${port}`);
});

// 🤖 DISCORD BOT — Chat AI setup
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ['CHANNEL'],
});

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // use your Groq API key
  baseURL: 'https://api.groq.com/openai/v1',
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== '1391264918870692002') return;

  try {
    await message.channel.sendTyping();

    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      max_tokens: 60, // short replies
      messages: [
        {
          role: "system",
          content: "You're a chill, friendly Discord user. Always reply in 1–2 short, casual sentences. Use slang or emojis if needed. Never sound like an AI, and don't write long paragraphs.",
        },
        {
          role: "user",
          content: message.content,
        },
      ],
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    if (!reply) return;

    await message.reply(reply);

  } catch (err) {
    console.error("❌ AI error:", err);
    if (!message.author.bot) {
      message.reply("Oops, I can't respond right now 😔");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
