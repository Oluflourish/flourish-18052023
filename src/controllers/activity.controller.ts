import Activity from "../models/activity.model";
import activityRepository from "../repositories/activity.repository";
import axios from "axios";
import TokenController from "./token.controller";
import logger from "../logger";

export default class ActivityController {

  async fetchEvents() {
    try {
      // const response = await axios.get("https://api.reservoir.tools/events/asks/v3?limit=1000");
      const response = await axios.get("https://api.reservoir.tools/events/asks/v3?limit=3"); // [FOR TESTING PURPOSE]

      logger.info(response.data);

      this.createBulkActivity(response.data.events);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async createBulkActivity(data: any) {
    try {
      // Filter event kind to only new-order
      data = data.filter((item: any) => item.event.kind == "new-order");

      // Map data to Activity model
      let activities: Activity[] = data.map((item: any) => {
        return new Activity({
          contract_address: item.order.contract,
          token_index: item.order.criteria.data.token.tokenId,
          listing_price: item.order.price.amount.native,
          maker: item.order.maker,
          listing_from: item.order.validFrom,
          listing_to: item.order.validTo ?? item.order.validUntil,
          event_timestamp: item.event.createdAt
        });
      });

      // logger.info('number of activities', activities.length);
      const savedActivities = await activityRepository.saveBulk(activities);

      // TODO:: Discentralize (un-tie) by emitting as an event
      // Pass savedActivites to token controller

      const tokenController = new TokenController();
      tokenController.extractTokens(savedActivities);

      logger.info('New activity created!');
    } catch (err) {
      logger.error('Error creating activity', err);
    }
  }

  async create(activity: Activity) {

    try {
      const savedActivity = await activityRepository.save(activity);

      logger.info('Activity created successfully');
    } catch (err) {
      logger.error('Error creating activity', err);
    }
  }

  async findAll(condition: any) {
    try {
      const activities = await activityRepository.retrieveAll(condition);

      return activities;
    } catch (err) {
      console.error(err);
    }
  }

  async findOne(id: number) {
    try {
      const activity = await activityRepository.retrieveById(id);

      if (activity) {
        return activity;
      } else {
        logger.info('Cannot find Activity with id=${id}.');
      }
    } catch (err) {
      logger.error('Error retrieving Activity with id=${id}.');
    }
  }

  async update(activity: Activity) {
    try {
      const num = await activityRepository.update(activity);

      if (num == 1) {
        logger.info('Activity updated successfully');
      } else {
        logger.info('Cannot update Activity with id=${activity.id}. Maybe Activity was not found or req.body is empty!');
      }
    } catch (err) {
      logger.error('Error updating Activity with id=${activity.id}.');
    }
  }

  async delete(id: number) {
    try {
      const num = await activityRepository.delete(id);
      if (num == 1) {
        logger.info('Activity was deleted successfully!');
      } else {
        logger.info('Cannot delete Activity with id=${id}. Maybe Activity was not found!');
      }
    } catch (err) {
      logger.error('Error deleting Activity with id=${id}.');
    }
  }

  async deleteAll() {
    try {
      const num = await activityRepository.deleteAll();

      logger.info(`${num} Activitys were deleted successfully!`);
    } catch (err) {
      logger.info('Some error occurred while removing all activities');
    }
  }
}
