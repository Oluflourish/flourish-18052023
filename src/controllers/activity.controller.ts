import { Request, Response } from "express";
import Activity from "../models/activity.model";
import activityRepository from "../repositories/activity.repository";
import axios from "axios";

export default class ActivityController {

  async fetchEvents() {
    try {
      // const response = await axios.get("https://api.reservoir.tools/events/asks/v3?limit=1000");
      const response = await axios.get("https://api.reservoir.tools/events/asks/v3?limit=3");

      console.log(response.data);

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

      // console.log('number of activities', activities.length);
      const savedActivities = await activityRepository.saveBulk(activities);

      console.log('New activity created!');
    } catch (err) {
      console.error('Error creating activity', err);
    }
  }

  async create(req: Request, res: Response) {
    if (!req.body.title) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    try {
      const activity: Activity = req.body;
      const savedActivity = await activityRepository.save(activity);

      res.status(201).send(savedActivity);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving activities."
      });
    }
  }

  async findAll(req: Request, res: Response) {
    const title = typeof req.query.title === "string" ? req.query.title : "";

    try {
      const activities = await activityRepository.retrieveAll({ title });

      res.status(200).send(activities);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving activities."
      });
    }
  }

  async findOne(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const activity = await activityRepository.retrieveById(id);

      if (activity) res.status(200).send(activity);
      else
        res.status(404).send({
          message: `Cannot find Activity with id=${id}.`
        });
    } catch (err) {
      res.status(500).send({
        message: `Error retrieving Activity with id=${id}.`
      });
    }
  }

  async update(req: Request, res: Response) {
    let activity: Activity = req.body;
    activity.id = parseInt(req.params.id);

    try {
      const num = await activityRepository.update(activity);

      if (num == 1) {
        res.send({
          message: "Activity was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Activity with id=${activity.id}. Maybe Activity was not found or req.body is empty!`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Error updating Activity with id=${activity.id}.`
      });
    }
  }

  async delete(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const num = await activityRepository.delete(id);

      if (num == 1) {
        res.send({
          message: "Activity was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Activity with id=${id}. Maybe Activity was not found!`,
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Could not delete Activity with id==${id}.`
      });
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      const num = await activityRepository.deleteAll();

      res.send({ message: `${num} Activitys were deleted successfully!` });
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while removing all activities."
      });
    }
  }

  async findAllPublished(req: Request, res: Response) {
    try {
      const activities = await activityRepository.retrieveAll({ published: true });

      res.status(200).send(activities);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving activities."
      });
    }
  }
}
