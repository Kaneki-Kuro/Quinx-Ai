const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

// ✅ Setup Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ['CHANNEL'],
});

// ✅ Setup Groq AI (LLaMA 3)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1', // Groq's endpoint
});

// ✅ When bot is ready
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ✅ Handle messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ✅ Only respond in this channel
  if (message.channel.id !== '1391264918870692002') return;

  try {
    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192", // ✅ Groq's free model
      messages: [
        { role: "system", content: "You are a helpful and friendly Discord assistant." },
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

// ✅ Login bot
client.login(process.env.DISCORD_TOKEN);
