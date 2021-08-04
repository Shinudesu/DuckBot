import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { logger, User } from '@duckbot/common';
import {
  Profile,
  Strategy,
  VerifyCallback,
} from '@oauth-everything/passport-discord';

import UserService from '../../graphql/user/user.service';

@Injectable()
export default class DiscordStrategy extends PassportStrategy(
  Strategy,
  'discord'
) {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService
  ) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      callbackUrl: process.env.DISCORD_CLIENT_CALLBACK_URL as string,
      scope: ['identify', 'guilds'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback<User>
  ) {
    const { id, displayName, _json } = profile;
    const findUser = await this.userService.findUser(id);

    // If user is not found, add one to the database
    if (findUser === undefined) {
      logger.debug('User does not exist! Creating new user');
      const newUser = await this.userService.createUser({
        id,
        tag: displayName as string,
        avatar: _json.avatar as string,
        accessToken,
        refreshToken,
      });

      return cb(undefined, newUser);
    }

    // Update the user if it is found
    logger.debug('User exists updating user!');
    const updateUser = await this.userService.updateUser(id, {
      tag: displayName as string,
      avatar: _json.avatar as string,
      accessToken,
      refreshToken,
    });

    return cb(undefined, updateUser);
  }
}