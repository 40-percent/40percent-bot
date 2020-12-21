import config from '../config';
import {
  Message,
  Client,
  MessageReaction,
  User,
  PartialUser,
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
  if (msg.author.bot) {
    return;
  }

  if (msg.guild?.id === config.FORTIES_GUILD) {
    await handleShowcaseMessage(msg, client);
    await handleSoundtestMessage(msg, client);
    await handleIcGbRequestMessage(msg, client);
  }
}

async function handleReaction(
  reaction: MessageReaction,
  user: User | PartialUser,
  client: Client
): Promise<void> {
  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.log('Something went wrong fetching the reaction:', error);
      return;
    }
  }

  // Ignore reactions from bots.
  if (user.bot) {
    return;
  }

  // When we receive a reaction we check if the reaction is partial or not
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.log('Something went wrong fetching the reaction:', error);
      return;
    }
  }

  // Assume the user is no longer partial since we handled that above
  if (reaction.message.guild?.id === config.FORTIES_GUILD) {
    await handleIcGbReviewReaction(reaction, client);
    await handleProjectAnnouncementReaction(reaction, user as User);
  }
}

export { handleMessage, handleReaction };
