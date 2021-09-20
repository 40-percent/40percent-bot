import config from '../../config';
import {
  Message,
  Client,
  TextChannel,
  Guild,
  MessageAttachment,
  MessageActionRow,
  MessageButton,
  ButtonInteraction,
  MessageReaction,
  User,
  PartialMessageReaction,
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
      const approveRejectRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('approveProjectReview')
          .setLabel('Approve')
          .setStyle('SUCCESS'),
        new MessageButton()
          .setCustomId('rejectProjectReview')
          .setLabel('Reject')
          .setStyle('DANGER')
      );
      await reviewChannel.send({
        content: reviewMessage,
        files: [
          new MessageAttachment(requestParams.imageUrl),
          serializedParams,
        ],
        components: [approveRejectRow],
      });
      await msg.reply('your request was successfully submitted for review.');
    } catch (error) {
      return;
    }
  }
}

async function handleIcGbReviewInteraction(
  interaction: ButtonInteraction,
  client: Client
): Promise<void> {
  // Only handle interactions in the IC/GB review channel
  console.log(interaction);
  if (interaction.channelId !== config.IC_GB_REVIEW_CHANNEL) {
    return;
  }
  // Explicit narrowing because we know this will be a normal message
  // sent in the 40s guild
  const typedMessage = interaction.message as Message;
  const guild = typedMessage.guild as Guild;
  const reviewer = interaction.user;

  if (interaction.customId === 'approveProjectReview') {
    const attachmentUrls = [...interaction.message.attachments.values()].map(
      (attachment) => attachment.url
    );
    if (attachmentUrls.length !== 2) {
      await interaction.reply('Must include both an image and metadata.');
      return;
    }
    const response = await axios.get<ProjectReviewParams>(attachmentUrls[1]);
    const reviewParams = response.data;

    const validParams = await ReviewParams.validate(reviewParams, guild);
    if (validParams) {
      await Promise.allSettled([
        CreateProject.boilerplate(reviewParams, guild, reviewer, client),
        interaction.reply({
          content: 'Project approved: generated boilerplate',
        }),
        typedMessage.edit({
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId('approveProjectReviewConfirmation')
                .setLabel('Approved')
                .setStyle('SUCCESS')
                .setDisabled(true)
            ),
          ],
        }),
      ]);
    } else {
      await interaction.reply('Role or channel already exists.');
    }
  }

  if (interaction.customId === 'rejectProjectReview') {
    await Promise.allSettled([
      interaction.reply({
        content: 'Please let the user know why their project was rejected.',
      }),
      typedMessage.edit({
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId('rejectProjectReviewConfirmation')
              .setLabel('Rejected')
              .setStyle('DANGER')
              .setDisabled(true)
          ),
        ],
      }),
    ]);
  }
}

async function handleProjectAnnouncementInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const typedMessage = interaction.message as Message;
  // Only handle interactions in the IC/GB announcement channel
  if (typedMessage.channelId !== config.IC_GB_ANNOUNCE_CHANNEL) {
    return;
  }
  const attachmentUrls = typedMessage.attachments.map(
    (attachment) => attachment.url
  );
  const response = await axios.get<ProjectAnnouncementParams>(
    attachmentUrls[1]
  );
  const projectParams = response.data;
  const guild = interaction.guild as Guild;
  const member = await guild.members.fetch(interaction.user.id);
  if (interaction.customId === 'joinProjectRole') {
    await Promise.allSettled([
      member.roles.add(projectParams.roleId),
      interaction.reply({
        content: `Joined role <@&${projectParams.roleId}>!`,
        ephemeral: true,
      }),
    ]);
  } else if (interaction.customId === 'leaveProjectRole') {
    await Promise.allSettled([
      member.roles.remove(projectParams.roleId),
      interaction.reply({
        content: `Left role <@&${projectParams.roleId}>!`,
        ephemeral: true,
      }),
    ]);
  }
}

// Deprecated, should be removed after a while when there are no more active
// ICs or GBs with the checkmark emoji feature
async function handleProjectAnnouncementReaction(
  reaction: MessageReaction | PartialMessageReaction,
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
  handleProjectAnnouncementInteraction,
  handleProjectAnnouncementReaction,
  handleIcGbReviewInteraction,
};
