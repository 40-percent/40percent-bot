import config from './config.js';
import { Client, User } from 'discord.js';
import handleShowcaseMessage from './handlers/showcase';
import handleSoundtestMessage from './handlers/soundtest';
import {
  handleIcGbRequestMessage,
  handleIcGbReviewReaction,
  handleProjectAnnouncementReaction,
} from './handlers/project';
import fetchPartial from './utils/fetchPartial';

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'] });

client.once('ready', () => {
  console.log('==== READY ====');
});

client.on('message', async (msg) => {
  await fetchPartial(msg)

  // Ignore messages from bots
  // Ignore messages from DMs
  if (msg.author.bot || msg.guild?.id !== config.FORTIES_GUILD) return;

  await Promise.allSettled([
    handleShowcaseMessage(msg, client),
    handleSoundtestMessage(msg, client),
    handleIcGbRequestMessage(msg, client)
  ]);
});

client.on('messageReactionAdd', async (reaction, user) => {
  await Promise.all([fetchPartial(reaction), fetchPartial(user)])

  // Ignore reactions from bots
  // Ignore reactions from DMs
  if (user.bot || reaction.message.guild?.id !== config.FORTIES_GUILD) return;

  await Promise.allSettled([
    handleIcGbReviewReaction(reaction, client, user as User),
    handleProjectAnnouncementReaction(reaction, user as User, 'add')
  ]);
});

client.on('messageReactionRemove', async (reaction, user) => {
  await Promise.all([fetchPartial(reaction), fetchPartial(user)])

  // Ignore reactions from bots
  // Ignore reactions from DMs
  if (user.bot || reaction.message.guild?.id !== config.FORTIES_GUILD) return;

  await Promise.allSettled([
    handleProjectAnnouncementReaction(reaction, user as User, 'remove')
  ]);
});

void client.login(config.BOT_TOKEN);
