import { connectDB, logger } from '@duckbot/common/dist';

import DiscordBot from './structures/bot';
import { DatabaseConfig } from './config';

connectDB(DatabaseConfig.uri)
  .then((sequelize) => sequelize.sync())
  .then(() => {
    logger.info('Connetion to database successful!');
    const client = new DiscordBot();
    client.start().catch(({ stack }) => {
      logger.error(stack as string);
      logger.error('Bot is exiting...');
      process.exit(0);
    });
  })
  .catch(({ stack }) => {
    logger.error(`Unable to connet to database. ${stack as string}`);
  });
