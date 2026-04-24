import { Request, Response, NextFunction } from "express";
import Job from "../models/Job";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiFeatures } from "../utils/ApiFeatures"; // تم إضافة الاستيراد هنا

// 1. إنشاء وظيفة
export const createJob = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newJob = new Job({ ...req.body, publisherId: (req.user as any)._id });
    res.status(201).json(await newJob.save());
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

// 4. جلب كل الوظائف (تم دمج الفلترة الذكية هنا فقط)
export const getAllJobs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // تمرير الـ Query الأساسي مع الـ Query Params اللي جاية من الفرونت إند للكلاس الذكي
    const features = new ApiFeatures(
      Job.find().populate("publisherId", "fullName email status"),
      req.query
    )
      .filter()
      .search(["title", "companyName", "description", "trackName", "type"]) // الحقول المتاح البحث فيها بكلمة مفتاحية
      .sort()
      .paginate();

    // تنفيذ الاستعلام بعد تطبيق كل الفلاتر
    const jobs = await features.mongooseQuery;

    // إرجاع النتيجة للفرونت إند بشكل منظم
    res.status(200).json({
      status: "success",
      results: jobs.length,
      data: jobs
    });
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