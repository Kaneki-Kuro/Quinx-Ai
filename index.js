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
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Only respond in the specified channel
  if (message.channel.id !== '1391264918870692002') return;

  try {
    // Simulate typing for realism
    await message.channel.sendTyping();

    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content: "You are a helpful and friendly Discord assistant. Keep responses short, casual, and talk like a real user, not a robot.",
        },
        {
          role: "user",
          content: message.content,
        },
      ],
    });

    const reply = response.choices[0].message.content.trim();

    // If under 2000 characters, reply directly to user
    if (reply.length <= 2000) {
      await message.reply(reply); // ✅ mentions the user
    } else {
      // If too long, split it up (just in case)
      const chunks = reply.match(/[\s\S]{1,2000}/g) || [];
      await message.reply(chunks[0]); // ✅ first reply with mention
      for (let i = 1; i < chunks.length; i++) {
        await message.channel.send(chunks[i]);
      }
    }
  } catch (err) {
    console.error("❌ AI error:", err);
    message.reply("Sorry, I couldn't respond right now.");
  }
});

client.login(process.env.DISCORD_TOKEN);
