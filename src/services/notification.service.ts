import Notification from "../models/Notification";

export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .populate("sender", "fullName avatar");

  const total = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    notifications,
    unreadCount,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
    },
  };
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true },
  );
};

export const markAllAsRead = async (userId: string) => {
  return await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );
};
