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

// ✅ Fixed OpenAI usage
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== '1391264918870692002') return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful Discord assistant." },
        { role: "user", content: message.content }
      ],
    });

    const reply = response.choices[0].message.content;
    message.reply(reply);
  } catch (err) {
    console.error("❌ OpenAI error:", err);
    message.reply("Sorry, I couldn't generate a reply.");
  }
});

client.login(process.env.DISCORD_TOKEN);
