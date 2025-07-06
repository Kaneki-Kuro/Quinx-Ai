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
  if (message.author.bot || message.channel.id !== '1391264918870692002') return;

  try {
    await message.channel.sendTyping();

    const response = await openai.chat.completions.create({
      model: "llama3-8b-8192",
      max_tokens: 60, // shorter replies
      messages: [
        {
          role: "system",
          content: "You're a chill, friendly Discord user. Always reply in 1-2 short, casual sentences. Use slang or emojis if needed. Never sound like an AI, and don't write long paragraphs.",
        },
        {
          role: "user",
          content: message.content,
        },
      ],
    });

    const reply = response.choices?.[0]?.message?.content?.trim();

    if (!reply) return;

    // Just one short reply, no need for chunk splitting
    await message.reply(reply);

  } catch (err) {
    console.error("❌ AI error:", err);
    if (!message.author.bot) {
      message.reply("Oops, I can't respond right now 😔");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
