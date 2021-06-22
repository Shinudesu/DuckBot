/* eslint import/prefer-default-export: 0 */
import { PresenceData, Snowflake } from 'discord.js';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

export const ClientConfig = {
  owners: process.env.OWNER_IDS?.split(',') as Snowflake[],
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.PREFIX,
};

export const DuckPresence: PresenceData = {
  activities: [
    {
      name: 'Leading ducklings 🦆',
      type: 'PLAYING',
    },
  ],
  status: 'online',
};

export const DatabaseConfig = {
  uri: process.env.DATABASE_URL,
};
