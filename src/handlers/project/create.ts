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
    data: {
      name: roleName,
      mentionable: true,
    },
  });
  // Then create the rank for manual add/removal
  const botCommandsChannel = (await client.channels.fetch(
    config.BOT_COMMANDS_CHANNEL
  )) as TextChannel;
  await botCommandsChannel.send(
    `<@${reviewerId}> please enter \`?addrank ${roleName}\` to create the project rank`
  );
  return role;
}

async function createProjectChannel(
  reviewParams: ProjectReviewParams,
  guild: Guild,
  role: Role
): Promise<TextChannel> {
  return guild.channels.create(reviewParams.slug, {
    parent:
      reviewParams.type === 'IC' ? config.IC_CATEGORY : config.GB_CATEGORY,
    permissionOverwrites: getProjectChannelPermissions(
      guild,
      role.id,
      reviewParams.ownerId,
      reviewParams.type
    ),
  });
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
  await announceChannel.send(
    `Announcing the ${reviewParams.type} for ${reviewParams.name} by <@${reviewParams.ownerId}>!
${reviewParams.description}
To gain access to the project channel <#${channel.id}>, join the role <@&${projectAnnouncementParams.roleId}> by reacting to this announcement with :white_check_mark:!`,
    [new MessageAttachment(reviewParams.imageUrl), serializedParams]
  );
  // TODO: when a user reacts to the announcement, give them the role
  // :white_check_mark: for accept :eyes: for gb role
}

export default {
  boilerplate: generateProjectBoilerplate,
};
