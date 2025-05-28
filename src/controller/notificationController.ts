
import { Request, Response } from "express";
import { emitNotification } from "../service/customSocket";
import Notification from "../models/notificationModel";

// Create a new notification
export const createContriNotification = async (to: string, description: string, title: string, from: string, path: string) => {
  try {
    const newNotification = new Notification({ to, description, title, from, path });
    const savedNotification = await newNotification.save();
    if(savedNotification){
        const notificationId = savedNotification._id;
        emitNotification({ _id:notificationId, to, description, title, from, path })
    }
    
  } catch (error) {
    console.log(error)
  }
};

// Get all notifications
export const getAllNotifications = async (req: any, res: any) => {
  try {
    const contributor_id = req.user.id;
    const notifications = await Notification.find({user: contributor_id}).populate("admin user", "name email");
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching notifications", error });
  }
};


// Update notification `isRead` status
export const updateNotificationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const updatedNotification = await Notification.findByIdAndUpdate(
      {_id:id},
      { isRead },
      { new: true }
    );

    if (!updatedNotification) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json(updatedNotification);
  } catch (error) {
    return res.status(500).json({ message: "Error updating notification status", error });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting notification", error });
  }
};
