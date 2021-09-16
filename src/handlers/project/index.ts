import config from '../../config';
import {
  Message,
  Client,
  TextChannel,
  MessageReaction,
  User,
  Guild,
  MessageAttachment,
} from 'discord.js';
import { ProjectAnnouncementParams } from './announcementParams';
import { ProjectReviewParams } from './reviewParams';
import ReviewParams from './reviewParams';
import RequestParams from './requestParams';
import CreateProject from './create';

import axios from 'axios';

function formatIcGbReviewMessage({
  name,
  type,
  description,
  slug,
  ownerId,
}: ProjectReviewParams): string {
  return `Creator - <@${ownerId}>
${type} - ${name} - #${slug}
${description}`;
}

async function handleIcGbRequestMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (msg.channel.id == config.IC_GB_REQUEST_CHANNEL) {
    try {
      const requestParams = await RequestParams.parse(msg);
      const reviewParams = ReviewParams.fromRequestParams(requestParams);
      const reviewMessage = formatIcGbReviewMessage(reviewParams);
      const serializedParams = ReviewParams.serialize(reviewParams);
      const reviewChannel = (await client.channels.fetch(
        config.IC_GB_REVIEW_CHANNEL
      )) as TextChannel;
      const message = await reviewChannel.send(reviewMessage, [
        new MessageAttachment(requestParams.imageUrl),
        serializedParams,
      ]);
      await message.react('✅');
      await msg.reply('your request was successfully submitted for review.');
    } catch (error) {
      return;
    }
  }
}

async function handleIcGbReviewReaction(
  reaction: MessageReaction,
  client: Client,
  reviewer: User
): Promise<void> {
  // Only handle reactions in the IC/GB review channel
  if (
    reaction.message.channel.id !== config.IC_GB_REVIEW_CHANNEL ||
    reaction.emoji.name !== '✅' // The :white_check_mark: emoji is to accept review
  ) {
    return;
  }
  const reviewChannel = (await client.channels.fetch(
    config.IC_GB_REVIEW_CHANNEL
  )) as TextChannel;
  const attachmentUrls = reaction.message.attachments.map(
    (attachment) => attachment.url
  );
  if (attachmentUrls.length !== 2) {
    await reviewChannel.send('Must include both an image and metadata.');
    return;
  }
  const response = await axios.get<ProjectReviewParams>(attachmentUrls[1]);
  const reviewParams = response.data;
  const guild = reaction.message.guild as Guild;
  const validParams = await ReviewParams.validate(reviewParams, guild);
  if (validParams) {
    await CreateProject.boilerplate(reviewParams, guild, reviewer, client);
  } else {
    await reviewChannel.send('Role or channel already exists.');
  }
  // console.log(attachmentUrls);
  // await Promise.all(
  //   attachmentUrls.map(async (url) => {
  //     const response = await axios.get<ProjectParams>(url);
  //     const responseData = response.data;
  //     console.log(responseData);
  //     await announceChannel.send(
  //       `message had attachment`,
  //       new MessageAttachment(url)
  //     );
  //   })
  // );
}

async function handleProjectAnnouncementReaction(
  reaction: MessageReaction,
  user: User,
  action: 'add' | 'remove'
): Promise<void> {
  // Only handle reactions in the IC/GB review channel
  if (reaction.message.channel.id !== config.IC_GB_ANNOUNCE_CHANNEL) {
    return;
  }
  // The :white_check_mark: emoji is to subscribe
  if (reaction.emoji.name === '✅') {
    const attachmentUrls = reaction.message.attachments.map(
      (attachment) => attachment.url
    );
    const response = await axios.get<ProjectAnnouncementParams>(
      attachmentUrls[1]
    );
    const projectParams = response.data;
    const guild = reaction.message.guild as Guild;
    const member = await guild.members.fetch(user.id);

    switch (action) {
      case 'add': {
        await member.roles.add(projectParams.roleId);
        break;
      }
      case 'remove': {
        await member.roles.remove(projectParams.roleId);
        break;
      }
    }
  }
}

export {
  handleIcGbRequestMessage,
  handleIcGbReviewReaction,
  handleProjectAnnouncementReaction,
};
