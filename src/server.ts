import config from './config.js';
import { Client } from 'discord.js';
import {
  handleMessage,
  handleReaction
} from './handlers';
import fetchPartial from './utils/fetchPartial';

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'] });

client.once('ready', () => {
  console.log('==== READY ====');
});

client.on('message', async (msg) => {
  await fetchPartial(msg)
  await handleMessage(msg, client)
});

client.on('messageReactionAdd', async (messageReaction, user) => {
  await Promise.all([fetchPartial(messageReaction), fetchPartial(user)])
  await handleReaction(messageReaction, user, 'add', client)
});

client.on('messageReactionRemove', async (messageReaction, user) => {
  await Promise.all([fetchPartial(messageReaction), fetchPartial(user)])
  await handleReaction(messageReaction, user, 'remove', client)
});

void client.login(config.BOT_TOKEN);
