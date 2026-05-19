import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const run = async () => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log("Không tìm thấy GEMINI_API_KEY.");
      return;
    }
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
    
    if (!res.ok) {
      console.error(`Lỗi HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      console.error("Chi tiết:", text);
      return;
    }
    const data = await res.json();
    const models = data.models || [];
    const supported = models
      .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
      
    if (supported.length > 0) {
      fs.writeFileSync("models_list.txt", supported.join(", "));
    } else {
      fs.writeFileSync("models_list.txt", "EMPTY");
    }
  } catch(e) {
    console.error("Lỗi thực thi:", e.message);
  }
};
run();
