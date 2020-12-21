# 40percent-bot

## Setup

To install this bot for local development, run

`npm install`

You should follow the guide to
[setup a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).
The bot will need certain permissions depending on what features you'll use.
If you want to make this easy for dev, you can just give it administrator permissions;
but as a general rule of thumb you should probably go by the
[principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) for
real applications.

Then create a file called `.env` in the project root directory, with the following values defined:

```
BOT_TOKEN=your-bot-token-here
FORTIES_SHOWCASE=your-showcase-channel-id-here
FORTIES_SOUNDTEST=your-soundtest-channel-id-here
FORTIES_GUILD=your-server-id-here
IC_GB_REQUEST_CHANNEL=etc
IC_GB_REVIEW_CHANNEL=etc
IC_GB_ANNOUNCE_CHANNEL=etc
IC_CATEGORY=etc
GB_CATEGORY=etc
WALLET_DESTROYER_ROLE=etc
```

These values will be picked up by the bot application to be able to run correctly.
For the channel IDs, you can find them by following
[this guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
.

## Running

Once you have the bot authorized into your Discord server, you can run

`npm run start`

to compile and execute the bot script.
