const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const express = require("express");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("Quinx Status Bot is alive!");
});

app.listen(PORT, () => {
  console.log(`✅ Express running on port ${PORT}`);
});

const monitorKeys = {
  "Quinx | Support": "m800892506-092936812863f4592e776d48",
  "Quinx | Chat": "m800892507-51fa7725dc114882c222c9f7",
  "Quinx | Role": "m800892508-5c36c18f3f3c9cbe04e199f0"
};

const channelId = process.env.CHANNEL_ID;
let messageId;

async function getStatus(apiKey) {
  try {
    const response = await axios.post("https://api.uptimerobot.com/v2/getMonitors", {
      api_key: apiKey,
      format: "json"
    });
    const status = response.data.monitors[0].status;
    return status === 2 ? "🟢 Online" : "🔴 Offline";
  } catch (error) {
    console.error("Failed to fetch status:", error.message);
    return "⚠️ Error";
  }
}

async function updateStatusMessage(channel) {
  const lines = await Promise.all(
    Object.entries(monitorKeys).map(async ([name, key]) => {
      const status = await getStatus(key);
      return `**${name}**\n${status}`;
    })
  );

  const embed = new EmbedBuilder()
    .setTitle("🔧 Quinx Bot Status")
    .setDescription(lines.join("\n\n") + `\n\n🕒 Active status changes every 5 minutes`)
    .setColor("Purple");

  try {
    const msg = await channel.messages.fetch(messageId);
    await msg.edit({ embeds: [embed] });
  } catch (err) {
    const msg = await channel.send({ embeds: [embed] });
    messageId = msg.id;
  }
}

client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(channelId);
  await updateStatusMessage(channel);

  setInterval(() => updateStatusMessage(channel), 5 * 60 * 1000); // every 5 mins
});

client.login(process.env.DISCORD_TOKEN);
