import { Request, Response } from 'express';
import Call from '../models/Call'; // اتأكدي إن المسار ده صح لموديل المكالمات اللي عملناه

export const getUserCalls = async (req: Request | any, res: Response) => {
  try {
    // بنجيب الـ ID بتاع اليوزر اللي عامل لوجين (من الميدلوير بتاع protect)
    const userId = req.user._id;

    // بنبحث في الداتا بيز عن أي مكالمة هو كان المتصل فيها أو المستلم
    const calls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }]
    })
    // بنجيب بيانات الطرفين (الاسم، الصورة، والوظيفة) عشان الفرونت إند يعرضهم
    .populate('caller', 'fullName avatar role')
    .populate('receiver', 'fullName avatar role')
    .sort({ createdAt: -1 }); // الترتيب تنازلي (الأحدث فوق)

    res.status(200).json({
      status: 'success',
      results: calls.length,
      data: {
        calls
      }
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'An error occurred on the server while fetching the call logs' 
    });
  }
};