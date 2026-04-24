import { Router } from 'express';
import { getUserCalls } from '../controllers/call.Controller';
// استوردي ميدلوير الحماية بتاعك (عشان محدش يشوف مكالمات حد غيره)
import { protect } from '../middlewares/auth.middleware'; 

const router = Router();

// بنحمي المسار الأول
router.use(protect);

// مسار جلب سجل المكالمات
router.get('/', getUserCalls);

export default router;