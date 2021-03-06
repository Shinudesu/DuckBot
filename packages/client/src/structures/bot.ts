import {
  AkairoClient,
  AkairoHandler,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from 'discord-akairo';
import { Collection, Intents, Snowflake } from 'discord.js';
import { resolve } from 'path';
import { logger } from '@duckbot/common/dist';

import { ClientConfig } from '../config';

import SlashCommandHandler from './handlers/slash-command-handler';
import CronJobHandler from './handlers/cronjob-handler';

export default class DiscordBot extends AkairoClient {
  handlers: Collection<string, AkairoHandler>;

  public constructor() {
    super(
      {
        // Akario settings
        ownerID: ClientConfig.owners as Snowflake[],
      },
      {
        // Discord settings
        partials: ['CHANNEL', 'MESSAGE', 'GUILD_MEMBER', 'USER', 'REACTION'],
        intents: Intents.ALL,
      }
    );

    this.handlers = new Collection<string, AkairoHandler>();

    const listenerHandler = new ListenerHandler(this, {
      directory: resolve(__dirname, '..', `listeners`),
    });

    const slashCommandHandler = new SlashCommandHandler(this, {
      directory: resolve(__dirname, '..', `commands/slash`),
    });

    const prefixCommandHandler = new CommandHandler(this, {
      directory: resolve(__dirname, '..', `commands/prefix`),
      commandUtil: true,
      allowMention: false,
      prefix: ClientConfig.prefix,
    });

    const inhibitorHandler = new InhibitorHandler(this, {
      directory: resolve(__dirname, '..', `inhibitors`),
    });

    const cronJobHandler = new CronJobHandler(this, {
      directory: resolve(__dirname, '..', `jobs`),
    });

    prefixCommandHandler.useInhibitorHandler(inhibitorHandler);
    prefixCommandHandler.useListenerHandler(listenerHandler);

    listenerHandler.setEmitters({
      listenerHandler,
      prefixCommandHandler,
      slashCommandHandler,
      cronJobHandler,
    });

    this.handlers.set('listener', listenerHandler);
    this.handlers.set('slash-commands', slashCommandHandler);
    this.handlers.set('prefix-commands', prefixCommandHandler);
    this.handlers.set('cron-job', cronJobHandler);
  }

  async start() {
    logger.info('Initializing bot...');
    logger.info(`Starting bot in ${ClientConfig.environment as string}`);

    for (const [name, handler] of this.handlers) {
      try {
        handler.loadAll();
        logger.info(`Finished loading ${name} modules!`);
      } catch (error) {
        throw new Error(`Error loading module ${name}`);
      }
    }

    await this.login(ClientConfig.token);
  }
}
