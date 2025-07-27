const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
require('dotenv').config();
const groq = require('groq-sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// GROQ Setup
const groqClient = new groq.Groq({
  apiKey: process.env.GROQ_API_KEY
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const userMessage = message.content.replace(/<@!?(\d+)>/, '').trim();

  if (!userMessage) {
    return message.reply("Please ask me something.");
  }

  try {
    await message.channel.sendTyping();

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ],
      model: "mixtral-8x7b-32768"
    });

    const botReply = chatCompletion.choices[0]?.message?.content;

    if (!botReply) {
      return message.reply("❌ I couldn't generate a response.");
    }

    await message.reply(botReply);
  } catch (error) {
    console.error("💥 Error generating response:", error);
    await message.reply("Something went wrong while generating my response.");
  }
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log("✅ Discord bot login success!");
  })
  .catch((err) => {
    console.error("❌ Discord login failed:", err);
  });
