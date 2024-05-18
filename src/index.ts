import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import Database from "./db";
import ActivityController from "./controllers/activity.controller";

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

    // TOOD:: Change to CRON job
    setInterval(() => {

      const controller = new ActivityController();
      controller.fetchEvents();

    }, 1000 * 3);
  }

  private syncDatabase(): void {
    const db = new Database();
    db.sequelize?.sync();
  }
}
