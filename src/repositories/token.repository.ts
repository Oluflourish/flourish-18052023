import { Op } from "sequelize";
import Token from "../models/token.model";

interface ITokenRepository {
  save(token: Token): Promise<Token>;
  retrieveAll(searchParams: { title: string, published: boolean }): Promise<Token[]>;
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
        current_price: token.current_price
      });
    } catch (err) {
      throw new Error("Failed to create Token!");
    }
  }

  // insert multiple records of activities
  async saveBulk(activities: Token[]): Promise<Token[]> {
    try {
      return await Token.bulkCreate(activities.map((token) => ({
        index: token.index,
        contract_address: token.contract_address,
        current_price: token.current_price
      })));
    } catch (err) {
      throw new Error("Failed to create Token!");
    }
  }

  async retrieveAll(searchParams: { title?: string, published?: boolean }): Promise<Token[]> {
    try {
      let condition: SearchCondition = {};

      if (searchParams?.published) condition.published = true;

      if (searchParams?.title)
        condition.title = { [Op.like]: `%${searchParams.title}%` };

      return await Token.findAll({ where: condition });
    } catch (error) {
      throw new Error("Failed to retrieve Tokens!");
    }
  }

  async retrieveById(tokenId: number): Promise<Token | null> {
    try {
      return await Token.findByPk(tokenId);
    } catch (error) {
      throw new Error("Failed to retrieve Tokens!");
    }
  }

  async update(token: Token): Promise<number> {
    const { id, index, contract_address, current_price } = token;

    try {
      const affectedRows = await Token.update(
        { index, contract_address, current_price },
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
