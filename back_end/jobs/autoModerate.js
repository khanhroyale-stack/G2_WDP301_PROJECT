import Post from "../models/post.models.js";
import { moderatePostWithGemini } from "../services/ai.service.js";

export const startAutoModeration = () => {
  // Chạy tự động mỗi 1 phút (60000ms)
  const INTERVAL_MS = 60000; 

  console.log("⏳ Background Job: Tự động duyệt bài bằng AI định kỳ đã được bật (1 phút/lần).");

  setInterval(async () => {
    try {
      const pendingPosts = await Post.find({ status: "pending" });
      if (pendingPosts.length === 0) return;

      console.log(`\n🤖 [Auto-Job] Bắt đầu duyệt tự động ${pendingPosts.length} bài đăng (pending)...`);

      let processedCount = 0;
      for (const post of pendingPosts) {
        try {
          const aiMod = await moderatePostWithGemini(
            post.title, 
            post.description, 
            post.price, 
            post.tags, 
            post.category
          );
          
          // Nếu xử lý thành công không bị trả lại trạng thái pending
          if (aiMod.status !== "pending") {
            post.status = aiMod.status;
            post.rejectReason = aiMod.rejectReason;
            if (aiMod.category && aiMod.category !== "Khác") post.category = aiMod.category;
            if (aiMod.tags && aiMod.tags.length > 0) post.tags = aiMod.tags;
    
            await post.save();
            console.log(`   ✅ Đã xử lý bài: "${post.title}" -> ${aiMod.status.toUpperCase()}`);
            processedCount++;
          }
          
          // Nghỉ 2s giữa mỗi API call để tránh rate limit của Google
          await new Promise(r => setTimeout(r, 2000)); 
        } catch (err) {
          console.error(`   ❌ [Auto-Job] Lỗi duyệt bài ${post._id}:`, err.message);
        }
      }

      if (processedCount > 0) {
        console.log(`🏁 [Auto-Job] Hoàn tất đợt duyệt. Đã xử lý ${processedCount} bài.`);
      }
    } catch (error) {
      console.error("Lỗi Job Auto Moderation:", error);
    }
  }, INTERVAL_MS);
};
