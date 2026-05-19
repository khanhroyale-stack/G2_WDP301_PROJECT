import { GoogleGenerativeAI } from "@google/generative-ai";

export const moderatePostWithGemini = async (title, description, price, tags, categoryName) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("Chưa cấu hình GEMINI_API_KEY. Tạm thời chuyển bài đăng thành pending.");
    return { status: "pending", rejectReason: "", category: categoryName, tags: tags || [] };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Bạn là một kiểm duyệt viên tự động cho nền tảng trao đổi đồ cũ sinh viên GreenLoop.
Hãy đánh giá bài đăng sau xem có hợp lệ hay không.
Tiêu chí TỪ CHỐI (rejected): 
- Chứa nội dung phản cảm, lừa đảo, vi phạm pháp luật, ngôn từ thù ghét.
- Chứa nội dung rác (spam), vô nghĩa.
- Bán các mặt hàng cấm (vũ khí, chất kích thích...).
- Giá tiền quá vô lý và không có giải thích hợp lý (VD: 1 tỷ cho 1 cây bút cũ).

Nếu hợp lệ, hãy trả về status: "approved".
Nếu vi phạm, hãy trả về status: "rejected" và kèm rejectReason giải thích tóm tắt bằng tiếng Việt.
Hệ thống cũng cần bạn chuẩn hóa danh mục (category) và tạo các từ khóa (tags) sao cho chuẩn (nếu nó chưa phù hợp).

Thông tin bài đăng:
- Tiêu đề (Title): ${title}
- Mô tả (Description): ${description || "Không có"}
- Giá tiền (Price): ${price} VND
- Danh mục hiện tại gợi ý (Category): ${categoryName || "Chưa có"}
- Tags hiện tại: ${tags && tags.length > 0 ? tags.join(", ") : "Chưa có"}

Trả về một chuỗi dạng JSON duy nhất, KHÔNG bọc trong markdown (không có \`\`\`json). Phải là 1 object có cấu trúc sau:
{
  "status": "approved" | "rejected",
  "rejectReason": "Lý do nếu bị rejected, ngược lại rỗng",
  "category": "Danh mục đã chuẩn hóa",
  "tags": ["tag1", "tag2", "tag3"]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON safely by finding the first { and last }
    const match = responseText.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("Gemini AI không trả về JSON hợp lệ:", responseText);
      return { status: "pending", rejectReason: "", category: categoryName, tags: tags || [] };
    }
    
    const parsed = JSON.parse(match[0]);
    return {
      status: parsed.status === "rejected" ? "rejected" : "approved",
      rejectReason: parsed.rejectReason || "",
      category: parsed.category || categoryName || "Khác",
      tags: Array.isArray(parsed.tags) ? parsed.tags : tags || []
    };
  } catch (error) {
    console.error("Lỗi khi kết nối Gemini AI:", error);
    return { status: "pending", rejectReason: "", category: categoryName, tags: tags || [] };
  }
};
