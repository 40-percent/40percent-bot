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
BOT_COMMANDS_CHANNEL=etc
```

These values will be picked up by the bot application to be able to run correctly.
For the channel IDs, you can find them by following
[this guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
.

## Running

Once you have the bot authorized into your Discord server, you can run

`npm run start`

to compile and execute the bot script.

## Contributing

We absolultely love getting new contributors to this project.
Following a few guidelines will make it much easier to review and merge your PR.

1. Before committing please ensure that your code passes all type, linting, and style checks (in addition to compiling of course).
2. Make sure you've at least run through the Setup process tested all the related functionality on a server you moderate.
3. We use [commitlint](https://github.com/conventional-changelog/commitlint) to enforce a standard commit message format.
   It's also recommended that you follow some [best practices](https://chris.beams.io/posts/git-commit/) for writing a multi-line commit message to explain the changes you made in detail.
   Be sure to add a [reference to the issue](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue) you're addressing on the last line of your commit message.
   If there's no issue created, please create one first so the changes can be tracked in the repo.
   If you're adding a new feature, make sure you add a new `scope` in the file `.commitlintrc.json`.
