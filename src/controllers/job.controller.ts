import { Request, Response, NextFunction } from "express";
import Job from "../models/Job";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import Community from "../models/Community";
import Notification from "../models/Notification";
import { io, userSocketMap } from "../server";
import { User } from "../models/user";

// 1. إنشاء وظيفة
// 1. إنشاء وظيفة (إجباري داخل مجتمع) + إشعارات الأعضاء
export const createJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const publisherId = (req.user as any)._id;
    const { communityId } = req.body;

    // 1. التأكد من إرسال الـ communityId
    if (!communityId) {
      return next(new AppError("Community ID is required to post a job", 400));
    }

    // 2. التحقق من وجود الكوميونتي فعلياً
    const community = await Community.findById(communityId).select("members");
    if (!community) {
      return next(new AppError("Community not found", 404));
    }

    // 3. حفظ الوظيفة
    const newJob = new Job({ ...req.body, publisherId });
    await newJob.save();
    // 🔔 4. لوجيك إشعارات أعضاء الكوميونتي (Trigger)
    if (community.members && community.members.length > 0) {
      // أ. استبعاد صاحب الوظيفة
      const membersIds = community.members.filter(
        (memberId) => memberId.toString() !== publisherId.toString(),
      );

      if (membersIds.length > 0) {
        // ب. التعديل الجراحي: فلترة الأعضاء اللي قافلين إشعارات الوظائف (jobAlerts)
        const targetUsers = await User.find({
          _id: { $in: membersIds },
          "notificationSettings.jobAlerts": { $ne: false }, // هات اللي مش قافلها
        }).select("_id");

        if (targetUsers.length > 0) {
          const notificationsToInsert = targetUsers.map((user) => ({
            recipient: user._id,
            sender: publisherId,
            type: "job_alert",
            title: "New Job in Community 🚀",
            content: `A new job opportunity: "${newJob.title}" has been posted in your group.`,
            linkData: { jobId: newJob._id, chatId: communityId },
          }));

          const savedNotifications = await Notification.insertMany(
            notificationsToInsert,
          );

          savedNotifications.forEach((notification) => {
            const socketId = userSocketMap.get(
              notification.recipient.toString(),
            );
            if (socketId) {
              io.to(socketId).emit("receive-notification", notification);
            }
          });
        }
      }
    }

    res.status(201).json(newJob);
  },
);

// 2. التقديم على وظيفة
export const applyToJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new AppError("Job not found", 404));

    if (!job.applicants) job.applicants = [];

    job.applicants.push({
      userId: (req.user as any)._id,
      proposal: req.body.proposal,
      status: "pending",
      appliedAt: new Date(),
    });
    await job.save();
    res
      .status(200)
      .json({ status: "success", message: "Applied successfully" });
  },
);

// 3. رؤية المتقدمين (لصاحب الوظيفة فقط)
export const getJobApplicants = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const job = await Job.findById(req.params.id).populate(
      "applicants.userId",
      "fullName email skills phoneNumber",
    );
    if (!job) return next(new AppError("Job not found", 404));

    if (job.publisherId.toString() !== (req.user as any)._id.toString()) {
      return next(
        new AppError("You can only view applicants for your own jobs", 403),
      );
    }

    res
      .status(200)
      .json({ status: "success", data: { applicants: job.applicants } });
  },
);

// 4. جلب كل الوظائف
export const getAllJobs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const jobs = await Job.find().populate(
      "publisherId",
      "fullName email status",
    );
    res.status(200).json(jobs);
  },
);

// 5. حذف الوظيفة
export const deleteJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const job = await Job.findById(req.params.id);
    if (!job) return next(new AppError("Job not found", 404));

    if (job.publisherId.toString() !== (req.user as any)._id.toString()) {
      return next(new AppError("You can only delete your own jobs", 403));
    }

    await job.deleteOne();
    res.status(204).json({ status: "success", data: null });
  },
);
