import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import { protect } from "../middlewares/auth.middleware";
import { restrictTo } from "../middlewares/authorize.middleware";

const router = Router();

// مسارات عامة (رؤية الوظائف)
router.get("/", jobController.getAllJobs);

// مسارات محمية (لازم تسجيل دخول)
router.use(protect);

router.post("/", restrictTo("employer"), jobController.createJob);
router.post("/:id/apply", jobController.applyToJob);
router.get("/:id/applicants", jobController.getJobApplicants);
router.delete("/:id", restrictTo("employer"), jobController.deleteJob);
export default router;
