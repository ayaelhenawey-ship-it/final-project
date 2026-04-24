import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(
      userId,
      page,
      limit,
    );

    res.status(200).json({
      status: "success",
      ...result,
    });
  },
);

export const readNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)._id;
    const notification = await notificationService.markAsRead(
      req.params.id as string,
      userId,
    );

    if (!notification) return next(new AppError("Notification not found", 404));

    res.status(200).json({ status: "success", data: { notification } });
  },
);

export const readAllNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)._id;
    await notificationService.markAllAsRead(userId);
    res
      .status(200)
      .json({ status: "success", message: "All notifications marked as read" });
  },
);
