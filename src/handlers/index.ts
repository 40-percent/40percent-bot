import config from '../config';
import {
  Message,
  Client,
  MessageReaction,
  User,
  PartialUser
} from 'discord.js';
import handleShowcaseMessage from './showcase';
import handleSoundtestMessage from './soundtest';
import {
  handleIcGbRequestMessage,
  handleIcGbReviewReaction,
  handleProjectAnnouncementReaction,
} from './project';

async function handleMessage(msg: Message, client: Client): Promise<void> {
  // Ignore messages from bots.
  if (msg.author.bot || msg.guild?.id !== config.FORTIES_GUILD) return;

  await Promise.all([
    handleShowcaseMessage(msg, client),
    handleSoundtestMessage(msg, client),
    handleIcGbRequestMessage(msg, client)
  ]);
}

async function handleReaction(
  reaction: MessageReaction,
  user: User | PartialUser,
  action: 'add' | 'remove',
  client: Client
): Promise<void> {
  // Ignore reactions from bots.
  if (user.bot || reaction.message.guild?.id !== config.FORTIES_GUILD) return;

  await Promise.all([
    handleIcGbReviewReaction(reaction, client, user as User),
    handleProjectAnnouncementReaction(reaction, user as User, action)
  ]);
}

export { handleMessage, handleReaction };
