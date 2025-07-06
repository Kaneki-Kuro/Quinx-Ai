const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL']
});

// ✅ Groq-compatible OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1', // Groq's base URL
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== '1391264918870692002') return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // also supports mixtral-8x7b
      messages: [
        { role: "system", content: "You are a helpful Discord assistant." },
        { role: "user", content: message.content }
      ],
    });

    const reply = response.choices[0].message.content;
    message.reply(reply);
  } catch (err) {
    console.error("❌ AI error:", err);
    message.reply("Sorry, I couldn't generate a reply.");
  }
});

client.login(process.env.DISCORD_TOKEN);
