/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApplicationCommandOptionData,
  CommandInteraction,
  MessageEmbed,
} from 'discord.js';
import { AkairoModule, AkairoModuleOptions } from 'discord-akairo';
import logger from '@lib/logger';
import { EmbedColorCoding } from '@constants';

export interface SlashCommandOptions extends AkairoModuleOptions {
  description: string;
  options?: ApplicationCommandOptionData[];
  disabled?: boolean;
  ownerOnly?: boolean;
  cooldown?: number;
}

export class SlashCommand extends AkairoModule {
  options: SlashCommandOptions;

  logger = logger;

  public constructor(id: string, options: SlashCommandOptions) {
    super(id, options);

    this.options = options;
  }

  async emitError(
    message: string,
    stack: string,
    interaction: CommandInteraction
  ) {
    try {
      this.logger.error(stack);
      const embed = new MessageEmbed()
        .setColor(EmbedColorCoding.error)
        .setFooter('Error handling command')
        .setDescription(`${this.constructor.name}: ${message}`);

      if (interaction.deferred)
        await interaction.editReply({ embeds: [embed] });
      else await interaction.reply({ embeds: [embed] });
    } catch ({ errMsg, errStack }) {
      this.logger.error(`Failed to ${errStack as string}`);
    }
  }

  async init() {
    throw new Error(
      `Command ${this.constructor.name} execute function not yet implemented.`
    );
  }

  async exec(_interaction: CommandInteraction) {
    throw new Error(
      `Command ${this.constructor.name} execute function not yet implemented.`
    );
  }
}
