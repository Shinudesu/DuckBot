import { AkairoClient, ListenerHandler } from 'discord-akairo';
import { Intents } from 'discord.js';
import { resolve } from 'path';
import logger from '@lib/logger';
import SlashCommandHandler from './handlers/slash_command_handler';
import { ClientConfig } from '../config';

export default class DiscordBot extends AkairoClient {
  // #region Handlers
  public commandHandler = new SlashCommandHandler(this, {
    directory: resolve(__dirname, '..', `commands/slash`),
  });

  public listenerHandler = new ListenerHandler(this, {
    directory: resolve(__dirname, '..', `listeners`),
  });
  // #endregion

  // #region Construcor
  public constructor() {
    super(
      {
        // Akario settings
        ownerID: ClientConfig.owners,
      },
      {
        // Discord settings
        partials: ['CHANNEL', 'MESSAGE', 'GUILD_MEMBER', 'USER', 'REACTION'],
        intents: Intents.ALL,
      }
    );
  }
  // #endregion

  // #region Functions
  async start() {
    try {
      logger.info('Initializing bot...');
      logger.info(`Starting bot in NODE_ENV=${process.env.NODE_ENV as string}`);
      logger.info('Loading commands...');
      this.commandHandler.loadAll();
      logger.info(`${this.commandHandler.modules.size} commands loaded.`);

      logger.info('Loading listeners...');
      this.listenerHandler.setEmitters({
        listenerHandler: this.listenerHandler,
      });
      this.listenerHandler.loadAll();
      logger.info(`${this.listenerHandler.modules.size} listeners loaded.`);

      logger.info('Logging into discord...');
      await this.login(process.env.DISCORD_TOKEN);
      // #endregion
    } catch (error) {
      logger.error(`Unable to login bot.. Reason: ${error as string}`);
      logger.error('Bot shutting down...');
      process.exit(1);
    }
  }
}
