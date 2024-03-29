import config from '../../config';
import { ProjectReviewParams } from './reviewParams';
import {
  Client,
  TextChannel,
  Guild,
  Role,
  OverwriteResolvable,
  Snowflake,
  MessageAttachment,
  User,
  MessageActionRow,
  MessageButton,
  CategoryChannel,
} from 'discord.js';
import AnnouncementParams from './announcementParams';
import { ProjectAnnouncementParams } from './announcementParams';

async function generateProjectBoilerplate(
  reviewParams: ProjectReviewParams,
  guild: Guild,
  reviewer: User,
  client: Client
): Promise<void> {
  const role = await createProjectRole(
    reviewParams.name,
    guild,
    reviewer.id,
    client
  );
  const channel = await createProjectChannel(reviewParams, guild, role);
  const projectAnnouncementParams = AnnouncementParams.generate(
    reviewParams.ownerId,
    role.id
  );
  await announceProject(
    reviewParams,
    projectAnnouncementParams,
    channel,
    client
  );
}

async function createProjectRole(
  roleName: string,
  guild: Guild,
  reviewerId: string,
  client: Client
): Promise<Role> {
  // First create the role
  const role = await guild.roles.create({
    name: roleName,
    mentionable: true,
  });
  // Then create the rank for manual add/removal
  const botCommandsChannel = (await client.channels.fetch(
    config.BOT_COMMANDS_CHANNEL
  )) as TextChannel;
  await botCommandsChannel.send(
    `<@${reviewerId}> please enter \`?addrank ${roleName}\` to create the project rank.`
  );
  return role;
}

async function sortCategoryChannels(
  guild: Guild,
  categoryId: Snowflake
): Promise<void> {
  const category = await guild.channels.fetch(categoryId);
  if (category instanceof CategoryChannel) {
    const categoryChannels = [...category.children.values()];
    categoryChannels.sort((a, b) => (a.name < b.name ? -1 : 1));
    for await (const [index, channel] of categoryChannels.entries()) {
      await channel.setPosition(index);
    }
  }
}

async function createProjectChannel(
  reviewParams: ProjectReviewParams,
  guild: Guild,
  role: Role
): Promise<TextChannel> {
  const categoryId =
    reviewParams.type === 'IC' ? config.IC_CATEGORY : config.GB_CATEGORY;
  const newChannel = await guild.channels.create(reviewParams.slug, {
    parent: categoryId,
    permissionOverwrites: getProjectChannelPermissions(
      guild,
      role.id,
      reviewParams.ownerId,
      reviewParams.type
    ),
  });
  await sortCategoryChannels(guild, categoryId);
  return newChannel;
}

function getProjectChannelPermissions(
  guild: Guild,
  roleId: Snowflake,
  ownerId: Snowflake,
  projectType: string
): OverwriteResolvable[] {
  if (projectType === 'IC') {
    return [
      // disallow everyone from seeing the channel by default
      {
        id: guild.roles.everyone.id,
        deny: ['VIEW_CHANNEL'],
      },
      // allow role members to read and send messages
      {
        id: roleId,
        allow: ['VIEW_CHANNEL'],
      },
      // allow wallet destroyer members to read and send messages
      {
        id: config.WALLET_DESTROYER_ROLE,
        allow: ['VIEW_CHANNEL'],
      },
      // make the owner a project-channel level mod
      {
        id: ownerId,
        allow: [
          'MANAGE_CHANNELS',
          'SEND_MESSAGES',
          'VIEW_CHANNEL',
          'MANAGE_MESSAGES',
        ],
      },
    ];
  } else {
    //if (projectType === 'GB')
    return [
      // make the owner a project-channel level mod
      {
        id: ownerId,
        allow: [
          'MANAGE_CHANNELS',
          'SEND_MESSAGES',
          'VIEW_CHANNEL',
          'MANAGE_MESSAGES',
        ],
      },
    ];
  }
}

async function announceProject(
  reviewParams: ProjectReviewParams,
  projectAnnouncementParams: ProjectAnnouncementParams,
  channel: TextChannel,
  client: Client
): Promise<void> {
  const announceChannel = (await client.channels.fetch(
    config.IC_GB_ANNOUNCE_CHANNEL
  )) as TextChannel;
  const serializedParams = AnnouncementParams.serialize(
    projectAnnouncementParams
  );
  const joinLeaveRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('joinProjectRole')
      .setLabel('Join')
      .setStyle('SUCCESS'),
    new MessageButton()
      .setCustomId('leaveProjectRole')
      .setLabel('Leave')
      .setStyle('DANGER')
  );
  await announceChannel.send({
    content: `Announcing the ${reviewParams.type} for ${reviewParams.name} by <@${reviewParams.ownerId}>!
    ${reviewParams.description}
    To gain access to the project channel <#${channel.id}>, join the role <@&${projectAnnouncementParams.roleId}> with the button below!`,
    files: [new MessageAttachment(reviewParams.imageUrl), serializedParams],
    components: [joinLeaveRow],
  });
}

export default {
  boilerplate: generateProjectBoilerplate,
};
