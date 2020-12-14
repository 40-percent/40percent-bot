import { Message } from 'discord.js';
import config from '../config';

export default async function handleVerificationMessage(
  msg: Message,
): Promise<void> {
    if (
      msg.channel.id === config.FORTIES_VERIFICATION &&
      msg.content?.trim() === "!verify"
    ) {
      const userRoles = msg.member?.roles;
      const verificationChannel = msg.channel;
      if (!userRoles) {
        await verificationChannel.send(
          `Roles of ${msg.author.username} could not be retrieved`
        );
        return;
      }
      if (
        userRoles.cache.has(config.FORTIES_NEW_ROLE) &&
        !userRoles.cache.has(config.FORTIES_MEMBER_ROLE)
      ) {
        await userRoles.remove(config.FORTIES_NEW_ROLE);
        await userRoles.add(config.FORTIES_MEMBER_ROLE);
        await msg.delete();
      } else {
        await verificationChannel.send(
          `User ${msg.author.username} is already a member or does not have initial role`
        );
      }
    }
}
