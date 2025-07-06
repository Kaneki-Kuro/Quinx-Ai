const { Client, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
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

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ✅ Only reply in this specific channel
  if (message.channel.id !== '1391264918870692002') return;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful Discord assistant." },
        { role: "user", content: message.content }
      ],
    });

    const reply = response.data.choices[0].message.content;
    message.reply(reply);
  } catch (err) {
    console.error("❌ OpenAI error:", err);
    message.reply("Sorry, I couldn't generate a reply.");
  }
});

client.login(process.env.DISCORD_TOKEN);
