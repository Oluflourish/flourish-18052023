import { Op } from "sequelize";
import Activity from "../models/activity.model";

interface IActivityRepository {
  save(activity: Activity): Promise<Activity>;
  retrieveAll(condition: SearchCondition): Promise<Activity[]>;
  retrieveById(activityId: number): Promise<Activity | null>;
  update(activity: Activity): Promise<number>;
  delete(activityId: number): Promise<number>;
  deleteAll(): Promise<number>;
}

interface SearchCondition {
  [key: string]: any;
}

class ActivityRepository implements IActivityRepository {
  async save(activity: Activity): Promise<Activity> {
    try {
      return await Activity.create({
        contract_address: activity.contract_address,
        token_index: activity.token_index,
        listing_price: activity.listing_price,
        maker: activity.maker,
        listing_from: activity.listing_from,
        listing_to: activity.listing_to,
        event_timestamp: activity.event_timestamp
      });
    } catch (err) {
      throw new Error("Failed to create Activity!");
    }
  }


  // insert multiple records of activities
  async saveBulk(activities: Activity[]): Promise<Activity[]> {
    try {
      return await Activity.bulkCreate(activities.map((activity) => ({
        contract_address: activity.contract_address,
        token_index: activity.token_index,
        listing_price: activity.listing_price,
        maker: activity.maker,
        listing_from: activity.listing_from,
        listing_to: activity.listing_to,
        event_timestamp: activity.event_timestamp
      })));
    } catch (err) {
      throw new Error("Failed to create Activity!");
    }
  }

  async retrieveAll(condition: SearchCondition = {}): Promise<Activity[]> {
    try {
      return await Activity.findAll({ where: condition });
    } catch (error) {
      throw new Error("Failed to retrieve Activities!");
    }
  }

  async retrieveById(activityId: number): Promise<Activity | null> {
    try {
      return await Activity.findByPk(activityId);
    } catch (error) {
      throw new Error("Failed to retrieve Activities!");
    }
  }



  async update(activity: Activity): Promise<number> {
    const { id, contract_address, token_index, listing_price, maker, listing_from, listing_to, event_timestamp } = activity;

    try {
      const affectedRows = await Activity.update(
        { contract_address, token_index, listing_price, maker, listing_from, listing_to, event_timestamp },
        { where: { id: id } }
      );

      return affectedRows[0];
    } catch (error) {
      throw new Error("Failed to update Activity!");
    }
  }

  async delete(activityId: number): Promise<number> {
    try {
      const affectedRows = await Activity.destroy({ where: { id: activityId } });

      return affectedRows;
    } catch (error) {
      throw new Error("Failed to delete Activity!");
    }
  }

  async deleteAll(): Promise<number> {
    try {
      return Activity.destroy({
        where: {},
        truncate: false
      });
    } catch (error) {
      throw new Error("Failed to delete Activities!");
    }
  }
}

export default new ActivityRepository();
