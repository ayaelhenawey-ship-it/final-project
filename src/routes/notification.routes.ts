import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect); // لازم يكون مسجل دخول

router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.readAllNotifications);
router.patch("/:id/read", notificationController.readNotification);

export default router;
