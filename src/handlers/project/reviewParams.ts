import slugify from 'slugify';
import { Snowflake, MessageAttachment, Guild } from 'discord.js';
import { ProjectRequestParams } from './requestParams';

type ProjectReviewParams = {
  version: string;
  type: string;
  name: string;
  description: string;
  ownerId: Snowflake;
  slug: string;
  imageUrl: string;
};

function fromRequestParams(
  requestParams: ProjectRequestParams
): ProjectReviewParams {
  return {
    version: '1.0.0', // Use semantic versioning to figure out if we need to keep old parsers around
    type: requestParams.type,
    name: requestParams.name,
    description: requestParams.description,
    ownerId: requestParams.ownerId,
    slug: formatSlug(requestParams.name),
    imageUrl: requestParams.imageUrl,
  };
}

function formatSlug(projectName: string): string {
  return slugify(projectName, {
    lower: true,
    strict: true,
    locale: 'en',
  });
}

function serialize(reviewParams: ProjectReviewParams): MessageAttachment {
  return new MessageAttachment(
    Buffer.from(JSON.stringify(reviewParams)),
    'metadata.json'
  );
}

async function validate(
  reviewParams: ProjectReviewParams,
  guild: Guild
): Promise<boolean> {
  const roles = await guild.roles.fetch();
  const roleExists =
    roles.cache.find((role) => role.name === reviewParams.name) !== undefined;
  const channelExists = guild.channels.cache.find(
    (channel) => channel.name === reviewParams.slug
  );
  return !(roleExists || channelExists);
}

export { ProjectReviewParams };

export default {
  fromRequestParams,
  serialize,
  validate,
};
