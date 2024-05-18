import { Sequelize } from "sequelize-typescript";
import { config, dialect } from "../config/db.config";
import Activity from "../models/activity.model";
import Token from "../models/token.model";
import logger from "../logger";

class Database {
  public sequelize: Sequelize | undefined;

  constructor() {
    this.connectToDatabase();
  }

  private async connectToDatabase() {
    this.sequelize = new Sequelize({
      database: config.DB,
      username: config.USER,
      password: config.PASSWORD,
      host: config.HOST,
      dialect: dialect,
      logging: config.logging,
      pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
      },
      models: [Activity, Token]
    });

    await this.sequelize
      .authenticate()
      .then(() => {
        logger.info("Connection has been established successfully.");
      })
      .catch((err) => {
        console.error("Unable to connect to the Database:", err);
      });
  }
}

export default Database;