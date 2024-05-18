import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import Database from "./db";
import ActivityController from "./controllers/activity.controller";
import cron from 'node-cron';
import logger from "./logger";
import TokenController from "./controllers/token.controller";
import { eventEmitter } from "./emitter";

export default class Server {
  constructor(app: Application) {
    this.config(app);
    this.syncDatabase();
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: "http://localhost:8081"
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // cron.schedule('*/30 * * * *', () => {                // Runs every 30 minutes
    cron.schedule('* * * * *', () => {                  // Runs every 1 minute
      logger.info('Cron Job is running');

      const controller = new ActivityController();
      controller.fetchEvents();
    });

    eventEmitter.on('newActivity', (data) => {
      const tokenController = new TokenController();
      tokenController.extractTokens(data);
    });
  }

  private syncDatabase(): void {
    const db = new Database();
    db.sequelize?.sync();
  }
}
