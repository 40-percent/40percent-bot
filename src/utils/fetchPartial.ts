import {
  ClientUser,
  DMChannel,
  GuildMember,
  Message,
  MessageReaction,
  PartialDMChannel,
  PartialGuildMember,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

export type PartialResources =
  | ClientUser
  | DMChannel
  | GuildMember
  | Message
  | MessageReaction
  | PartialDMChannel
  | PartialGuildMember
  | PartialMessage
  | PartialMessageReaction
  | PartialUser
  | User;

export default async function fetchPartial(
  resource: PartialResources
): Promise<void> {
  if (!resource.partial) return;

  try {
    await resource.fetch();
  } catch (err) {
    console.log(
      `Something went wrong when fetching the ${typeof resource}:`,
      err
    );
  }
}
