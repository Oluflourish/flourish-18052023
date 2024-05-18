import Token from "../models/token.model";
import tokenRepository from "../repositories/token.repository";
import Activity from "../models/activity.model";
import ActivityController from "./activity.controller";

export default class TokenController {

  async extractTokens(activites: Activity[]) {
    const activityRepository = new ActivityController();

    try {
      // Check if the activity with token_index exists in the tokens table  and if it doesn't, create it.
      let newTokens: Token[] = [];

      for (let i = 0; i < activites.length; i++) {
        const activity: Activity = activites[i];
        let token = await tokenRepository.retrieveOne({ index: activity.token_index });

        if (!token) {
          // If token does not exist, create it
          const newToken: Token = new Token({
            index: activity.token_index,
            contract_address: activity.contract_address,
            current_price: activity.listing_price
          });

          newTokens.push(newToken);

        } else {
          // For any token that their listing has expired (order.validTo < now), and there are no other active listings, their current price must be set to null.
          const now = new Date().getTime();

          if (activity.listing_to != null && activity.listing_to < now) {
            // let foundActivities: Activity[] = await activityRepository.findAll({ token_index: activity.token_index}) ?? [];
            let foundActivities: Activity[] = await activityRepository.findAll({ token_index: activity.token_index, contract_adresss: activity.contract_address }) ?? [];

            if (foundActivities.length === 0) {
              token.current_price = undefined;
              await tokenRepository.update(token);
            } else {
              // Check if the listing has a value lower than any other listing for the same NFT (identified by the combination of contract address and token index).
              // The lowest valid listing must be set as the current price for that NFT in the tokens table.

              let lowestPrice: number = activity.listing_price ?? 0;

              for (let j = 0; j < foundActivities.length; j++) {
                let listPrice = foundActivities[j].listing_price ?? 0;
                if (listPrice < lowestPrice) {
                  lowestPrice = listPrice;
                }
              }

              token.current_price = lowestPrice;
              await tokenRepository.update(token);
            }
          } else {
            // If the token exists and the listing is still active, the current price must be updated to the most recent listing price.
            token.current_price = activity.listing_price;
            await tokenRepository.update(token);
          }
        }
      }

      // Batch create new tokens
      this.createBulkToken(newTokens);

    } catch (error) {
      console.error(error);
    }
  }

  async createBulkToken(tokens: Token[]) {
    try {
      const savedToken = await tokenRepository.saveBulk(tokens);

      console.log('New tokens created:', tokens.length);
    } catch (err) {
      console.error('Error creating token', err);
    }
  }

  async create(token: Token) {
    try {
      const savedToken = await tokenRepository.save(token);

      console.log('Token created successfully');
    } catch (err) {
      console.error('Error creating token', err);
    }
  }

  async findAll(condition: any) {
    try {
      const tokens = await tokenRepository.retrieveAll(condition);

      return tokens;
    } catch (err) {
      console.log('Error retrieving tokens', err);
    }
  }

  async findOne(id: number) {

    try {
      const token = await tokenRepository.retrieveById(id);

      if (token) {
        return token;
      } else {
        console.log(`Cannot find Token with id=${id}.`);
      }
    } catch (err) {
      console.error(`Error retrieving Token with id=${id}.`);
    }
  }

  async update(token: Token) {

    try {
      const num = await tokenRepository.update(token);

      if (num == 1) {
        console.log('Token updated successfully');

      } else {
        console.log(`Cannot update Token with id=${token.id}. Maybe Token was not found or req.body is empty!`);
      }
    } catch (err) {
      console.error(`Error updating Token with id=${token.id}.`);
    }
  }

  async delete(id: number) {

    try {
      const num = await tokenRepository.delete(id);

      if (num == 1) {
        console.log('Token deleted successfully');
      } else {
        console.log(`Cannot delete Token with id=${id}. Maybe Token was not found!`);
      }
    } catch (err) {
      console.error(`Error deleting Token with id=${id}.`);
    }
  }

  async deleteAll() {
    try {
      const num = await tokenRepository.deleteAll();

      console.log(`${num} Tokens were deleted successfully!`);
    } catch (err) {
      console.error('Error deleting Tokens');
    }
  }
}
