import { Op } from "sequelize";
import Token from "../models/token.model";
import { log } from "console";
import logger from "../logger";

interface ITokenRepository {
  save(token: Token): Promise<Token>;
  retrieveAll(condition: { index: number; contract_address: string }[]): Promise<Token[]>;
  retrieveById(tokenId: number): Promise<Token | null>;
  update(token: Token): Promise<number>;
  delete(tokenId: number): Promise<number>;
  deleteAll(): Promise<number>;
}

interface SearchCondition {
  [key: string]: any;
}

class TokenRepository implements ITokenRepository {
  async save(token: Token): Promise<Token> {
    try {
      return await Token.create({
        index: token.index,
        contract_address: token.contract_address,
        current_price: token.current_price,
        listing_to: token.listing_to
      });
    } catch (err) {
      throw new Error("Failed to create Token!");
    }
  }

  // insert multiple records of activities
  async saveBulk(tokens: Token[]): Promise<Token[]> {
    try {
      return await Token.bulkCreate(tokens.map((token) => ({
        index: token.index,
        contract_address: token.contract_address,
        current_price: token.current_price,
        listing_to: token.listing_to
      })));
    } catch (err) {
      throw new Error("Failed to create Token!");
    }
  }

  // bulk update  tokens: Token[] using update() method
  async bulkUpdate(tokens: Token[]): Promise<Token[]> {
    try {
      return await Token.bulkCreate(tokens.map((token) => ({
        index: token.index,
        contract_address: token.contract_address,
        current_price: token.current_price,
        listing_to: token.listing_to
      })), { updateOnDuplicate: ['index', 'contract_address'] });
    } catch (err) {
      throw new Error("Failed to create Token!");
    }
  }



  async retrieveAll(condition: { index: number; contract_address: string }[]): Promise<Token[]> {
    try {
      const res = await Token.findAll({ where: { [Op.or]: condition } });


      return res;
    } catch (error) {
      logger.error('Error retrieving tokens', error);
      throw new Error("Failed to retrieve Tokens!");
    }
  }

  async retrieveById(tokenId: number): Promise<Token | null> {
    try {
      return await Token.findByPk(tokenId);
    } catch (error: any) {
      logger.error('Error retrieving token', error.message);
      throw new Error("Failed to retrieve Token");
    }
  }

  async retrieveOne(condition: any): Promise<Token | null> {
    try {
      return await Token.findOne({ where: condition });
    } catch (error) {
      throw new Error("Failed to retrieve Tokens");
    }
  }

  async update(token: Token): Promise<number> {
    const { id, index, contract_address, current_price, listing_to } = token;

    try {
      const affectedRows = await Token.update(
        { index, contract_address, current_price, listing_to },
        { where: { id: id } }
      );

      return affectedRows[0];
    } catch (error) {
      throw new Error("Failed to update Token!");
    }
  }

  async delete(tokenId: number): Promise<number> {
    try {
      const affectedRows = await Token.destroy({ where: { id: tokenId } });

      return affectedRows;
    } catch (error) {
      throw new Error("Failed to delete Token!");
    }
  }

  async deleteAll(): Promise<number> {
    try {
      return Token.destroy({
        where: {},
        truncate: false
      });
    } catch (error) {
      throw new Error("Failed to delete Tokens!");
    }
  }
}

export default new TokenRepository();
