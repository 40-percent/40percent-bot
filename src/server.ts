import config from './config.js';
import { Client, Message, Intents } from 'discord.js';
import handleShowcaseMessage from './handlers/showcase';
import handleSoundtestMessage from './handlers/soundtest';
import {
  handleIcGbRequestMessage,
  handleProjectAnnouncementInteraction,
  handleIcGbReviewInteraction,
} from './handlers/project';
import fetchPartial from './utils/fetchPartial';
import callHandlers from './utils/callHandlers.js';

function messageShouldBeHandled(msg: Message): boolean {
  // Ignore messages from bots
  // Ignore messages from DMs
  return !msg.author.bot && msg.guild?.id === config.FORTIES_GUILD;
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL', 'USER', 'GUILD_MEMBER'],
});

client.once('ready', () => {
  console.log('==== READY ====');
});

client.on('error', (err) => {
  console.log('Uncaught error:', err);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await callHandlers(
      handleIcGbReviewInteraction(interaction, client),
      handleProjectAnnouncementInteraction(interaction)
    );
  }
});

client.on('messageCreate', async (msg) => {
  await fetchPartial(msg);

  if (!messageShouldBeHandled(msg)) return;

  await callHandlers(
    handleShowcaseMessage(msg, client),
    handleSoundtestMessage(msg, client),
    handleIcGbRequestMessage(msg, client)
  );
});

void client.login(config.BOT_TOKEN);
