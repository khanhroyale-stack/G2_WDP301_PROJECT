import mongoose from "mongoose";
import dotenv from "dotenv";
import { moderatePostWithGemini } from "../services/ai.service.js";
import connectDB from "../config/db.js";
import Post from "../models/post.models.js";

dotenv.config();

const run = async () => {
  await connectDB();
  
  const pendingPosts = await Post.find({ status: "pending" });
  console.log(`\n🔍 Tìm thấy ${pendingPosts.length} bài đăng đang chờ duyệt (pending).`);

  if (pendingPosts.length === 0) {
    console.log("✅ Không có bài đăng nào cần duyệt.");
    process.exit(0);
  }

  let approvedCount = 0;
  let rejectedCount = 0;

  for (const post of pendingPosts) {
    console.log(`\n===========================================`);
    console.log(`🤖 Đang kiểm duyệt bài: "${post.title}"...`);
    try {
      const aiMod = await moderatePostWithGemini(
        post.title, 
        post.description, 
        post.price, 
        post.tags, 
        post.category
      );
      
      console.log(` -> Kết quả: ${aiMod.status.toUpperCase()}`);
      if (aiMod.status === "rejected") {
        console.log(` -> Lý do: ${aiMod.rejectReason || "Không có"}`);
      }
      
      post.status = aiMod.status;
      post.rejectReason = aiMod.rejectReason;
      if (aiMod.category && aiMod.category !== "Khác") post.category = aiMod.category;
      if (aiMod.tags && aiMod.tags.length > 0) post.tags = aiMod.tags;

      await post.save();

      if (aiMod.status === "approved") approvedCount++;
      else rejectedCount++;

      // Sleep 2s to avoid free-tier rate limits of Gemini API
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(` ❌ Lỗi khi duyệt bài ${post._id}:`, error.message);
    }
  }

  console.log(`\n===========================================`);
  console.log(`✅ Hoàn tất duyệt toàn bộ Database!`);
  console.log(`   - Chấp nhận: ${approvedCount} bài.`);
  console.log(`   - Từ chối:   ${rejectedCount} bài.`);
  process.exit(0);
};

run();
