import Token from "../models/token.model";
import tokenRepository from "../repositories/token.repository";
import Activity from "../models/activity.model";
import ActivityController from "./activity.controller";
import logger from "../logger";

export default class TokenController {

  async extractTokens(activites: Activity[]) {
    const activityRepository =
      new ActivityController();

    try {
      // Check if the activity with token_index exists in the tokens table  and if it doesn't, create it.
      const existingTokens: Token[] = [];
      const newTokens: Token[] = [];

      const tokenQuery = activites.map((activity) => {
        return { index: activity.token_index, contract_address: activity.contract_address };
      });

      const tokens = await tokenRepository.retrieveAll(tokenQuery);

      const tokenStore = new Map<string, Token>();
      tokens.forEach(token => {
        const tokenKey = `${token.contract_address}-${token.index}`;
        tokenStore.set(tokenKey, token);
      });

      for (let i = 0; i < activites.length; i++) {
        const activity: Activity = activites[i];
        const tokenKey = `${activity.contract_address}-${activity.token_index}`;
        const token = tokenStore.get(tokenKey);
        const now = Math.floor(new Date().getTime() / 1000);

        if (!token) {

          let current_price = null;
          if (activity.listing_to != null && activity.listing_to > now) {
            current_price = activity.listing_price;
          }
          // If token does not exist, create it
          const newToken: Token = new Token({
            index: activity.token_index,
            contract_address: activity.contract_address,
            current_price,
          });

          newTokens.push(newToken);

        } else {
          // For any token that their listing has expired (order.validTo < now), and there are no other active listings, their current price must be set to null.


          if ((activity.listing_to != null && activity.listing_to < now) || (token.listing_to != null && token.listing_to < now)) {
            // let foundActivities: Activity[] = await activityRepository.findAll({ token_index: activity.token_index}) ?? [];
            const foundActivities: Activity[] = await activityRepository.findAll({
              token_index: activity.token_index,
              contract_adresss: activity.contract_address,
              listing_to: { $gt: now } // Ensure that listing has not expired
            }) ?? [];

            if (foundActivities.length === 0) {
              token.current_price = null;
              
              existingTokens.push(token);
            } else {
              // Check if the listing has a value lower than any other listing for the same NFT (identified by the combination of contract address and token index).
              // The lowest valid listing must be set as the current price for that NFT in the tokens table.

              const lowestPrice: number = Math.min(...foundActivities.map(activity => activity.listing_price));

              if (token.current_price != lowestPrice) {
                token.current_price = lowestPrice;
                existingTokens.push(token);
              }
            }
          } else {
            // If the token exists and the listing is still active, the current price must be updated to the most recent listing price.
            if (!token.current_price || token.current_price > activity.listing_price) {
              token.current_price = activity.listing_price;
              existingTokens.push(token);
            }
          }
        }
      }


      // Batch create new tokens
      this.createBulkToken(newTokens);
      
      // Batch update existing tokens
      this.updateBulkToken(existingTokens);

    } catch (error) {
      console.error(error);
    }
  }

  async createBulkToken(tokens: Token[]) {
    try {
      await tokenRepository.saveBulk(tokens);

      logger.info('New tokens created:', tokens.length);
    } catch (err) {
      logger.error('Error creating token', err);
    }
  }

  async updateBulkToken(tokens: Token[]) {
    try {
      await tokenRepository.bulkUpdate(tokens);

      logger.info('Tokens updated:', tokens.length);
    } catch (err) {
      logger.error('Error updating token', err);
    }
  }

  async create(token: Token) {
    try {
      await tokenRepository.save(token);

      logger.info('Token created successfully');
    } catch (err) {
      logger.error('Error creating token', err);
    }
  }

  async findAll(condition: any) {
    try {
      const tokens = await tokenRepository.retrieveAll(condition);

      return tokens;
    } catch (err) {
      logger.error('Error retrieving tokens', err);
    }
  }

  async findOne(id: number) {

    try {
      const token = await tokenRepository.retrieveById(id);

      if (token) {
        return token;
      } else {
        logger.info(`Cannot find Token with id=${id}.`);
      }
    } catch (err) {
      console.error(`Error retrieving Token with id=${id}.`);
    }
  }

  async update(token: Token) {

    try {
      const num = await tokenRepository.update(token);

      if (num == 1) {
        logger.info('Token updated successfully');

      } else {
        logger.info(`Cannot update Token with id=${token.id}. Maybe Token was not found or req.body is empty!`);
      }
    } catch (err) {
      console.error(`Error updating Token with id=${token.id}.`);
    }
  }

  async delete(id: number) {

    try {
      const num = await tokenRepository.delete(id);

      if (num == 1) {
        logger.info('Token deleted successfully');
      } else {
        logger.info(`Cannot delete Token with id=${id}. Maybe Token was not found!`);
      }
    } catch (err) {
      console.error(`Error deleting Token with id=${id}.`);
    }
  }

  async deleteAll() {
    try {
      const num = await tokenRepository.deleteAll();

      logger.info(`${num} Tokens were deleted successfully!`);
    } catch (err) {
      logger.error('Error deleting Tokens');
    }
  }
}
