import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  getMessageHistory,
  accessChat,
  getMyChats,
  createGroup,
  addToGroup,
  removeFromGroup,
  leaveGroupChat,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  addCommunityMember,
  removeCommunityMember,
  updateCommunity,
  getAllCommunities,
  getCommunity
} from '../controllers/chat.controller';

const router = Router();

// ==========================================
// 🔒 كل المسارات محمية - لازم اليوزر يكون عامل لوجين
// ==========================================
router.use(protect);

// ==========================================
// 💬 مسارات الشات (Chat Routes)
// ==========================================
// جلب كل محادثات اليوزر
router.get('/', getMyChats);

// إنشاء أو فتح محادثة فردية مع يوزر تاني
router.post('/', accessChat);

// ==========================================
// 📜 مسار تاريخ الرسائل (History)
// ==========================================
// جلب رسائل شات معين (مع limit و cursor pagination)
// مثال: GET /api/v1/chats/abc123/messages?limit=30&before=xyz789
router.get('/:chatId/messages', getMessageHistory);

// ==========================================
// 👥 مسارات الجروبات (Group Routes)
// ==========================================
// إنشاء جروب جديد
router.post('/group', createGroup);

// إضافة عضو للجروب (Admin Only)
router.put('/group/add', addToGroup);

// إزالة عضو من الجروب (Admin Only)
router.put('/group/remove', removeFromGroup);

// مغادرة جروب
router.put('/group/:chatId/leave', leaveGroupChat);

// ==========================================
// 🏘️ مسارات المجتمعات (Community Routes)
// ==========================================
// جلب كل المجتمعات العامة (مع pagination)
router.get('/communities', getAllCommunities);

// إنشاء مجتمع جديد
router.post('/communities', createCommunity);

// جلب تفاصيل مجتمع معين
router.get('/communities/:communityId', getCommunity);

// تحديث بيانات المجتمع (Admin Only)
router.patch('/communities/:communityId', updateCommunity);

// الانضمام لمجتمع عام
router.post('/communities/:communityId/join', joinCommunity);

// مغادرة مجتمع
router.post('/communities/:communityId/leave', leaveCommunity);

// إضافة عضو للمجتمع (Admin Only)
router.post('/communities/:communityId/members', addCommunityMember);

// إزالة عضو من المجتمع (Admin Only)
router.delete('/communities/:communityId/members', removeCommunityMember);

export default router;
