import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // اليوزر اللي هيستلم الإشعار
  sender: mongoose.Types.ObjectId; // اليوزر اللي تسبب في الإشعار (صاحب الوظيفة أو اللي عمل منشن)
  type: "job_alert" | "mention" | "application_update"; // أنواع الإشعارات
  title: string; // عنوان الإشعار (مثلاً: وظيفة جديدة تهمك)
  content: string; // نص الإشعار (مثلاً: قام يوسف بعمل منشن لك في شات Front-end)
  linkData: {
    // بيانات الربط عشان لما يدوس على الإشعار يوديه للمكان الصح
    jobId?: mongoose.Types.ObjectId;
    chatId?: mongoose.Types.ObjectId;
    messageId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["job_alert", "mention", "application_update"],
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  linkData: {
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    messageId: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// إضافة Index على الـ recipient والـ isRead عشان جلب الإشعارات الجديدة يكون سريع جداً
NotificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
