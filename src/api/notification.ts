import express from "express";
import { verifyToken } from "../util/verify";
import { getAllNotifications, updateNotificationStatus } from "../controller/notificationController";


const notificatioAPI = express.Router();

notificatioAPI.get("/", verifyToken, getAllNotifications);
notificatioAPI.put("/:id", verifyToken, updateNotificationStatus);

export default notificatioAPI;
