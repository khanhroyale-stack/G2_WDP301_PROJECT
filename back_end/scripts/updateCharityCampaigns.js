import mongoose from "mongoose";
import dotenv from "dotenv";
import Charity from "../models/charity.model.js";

dotenv.config({ quiet: true });

const charitySeed = [
  {
    title: "Góp tiền xây web ReUni",
    description: "Kêu gọi đóng góp để nâng cấp hệ thống web ReUni, tối ưu tốc độ, bảo mật và trải nghiệm người dùng cho toàn bộ sinh viên.",
    shortDescription: "Góp quỹ nâng cấp nền tảng web",
    highlightMessage: "Mỗi khoản góp giúp hệ thống chạy mượt và ổn định hơn.",
    goalAmount: 120000000,
    status: "active",
  },
  {
    title: "Trả lương nhân viên hỗ trợ vận hành",
    description: "Chiến dịch gây quỹ để duy trì đội ngũ hỗ trợ, chăm sóc người dùng và xử lý đơn hàng minh bạch mỗi ngày.",
    shortDescription: "Hỗ trợ quỹ lương đội vận hành",
    highlightMessage: "Đảm bảo dịch vụ luôn có người hỗ trợ nhanh.",
    goalAmount: 95000000,
    status: "active",
  },
  {
    title: "Nâng cấp máy chủ và dữ liệu",
    description: "Gây quỹ cho hạ tầng server, sao lưu dữ liệu và giám sát hệ thống để tránh gián đoạn trong mùa cao điểm.",
    shortDescription: "Đầu tư hạ tầng server",
    highlightMessage: "Ổn định hạ tầng, bảo vệ dữ liệu cộng đồng.",
    goalAmount: 80000000,
    status: "active",
  },
  {
    title: "Quỹ bảo trì ứng dụng di động",
    description: "Đóng góp cho bảo trì app ReUni trên iOS/Android, sửa lỗi, tối ưu hiệu năng và cải thiện thông báo giao dịch.",
    shortDescription: "Bảo trì app cho sinh viên",
    highlightMessage: "Giữ ứng dụng luôn mượt, ít lỗi.",
    goalAmount: 70000000,
    status: "active",
  },
  {
    title: "Mở rộng đội kiểm duyệt nội dung",
    description: "Kêu gọi nguồn lực cho đội kiểm duyệt bài đăng nhằm giảm lừa đảo, lọc nội dung không phù hợp và duyệt nhanh hơn.",
    shortDescription: "Tăng chất lượng kiểm duyệt",
    highlightMessage: "Duyệt nhanh hơn, an toàn hơn.",
    goalAmount: 65000000,
    status: "active",
  },
  {
    title: "Quỹ học bổng đồ cũ cho tân sinh viên",
    description: "Gây quỹ hỗ trợ các bạn tân sinh viên khó khăn tiếp cận đồ học tập và đồ dùng thiết yếu với chi phí thấp.",
    shortDescription: "Học bổng đồ cũ cho tân sinh viên",
    highlightMessage: "Giảm gánh nặng chi phí đầu năm học.",
    goalAmount: 110000000,
    status: "active",
  },
  {
    title: "Hỗ trợ vận chuyển liên trường",
    description: "Đóng góp chi phí vận chuyển giữa các trường để sinh viên mua bán đồ cũ thuận tiện hơn, đặc biệt với đồ cồng kềnh.",
    shortDescription: "Quỹ ship liên trường",
    highlightMessage: "Mua bán xa vẫn dễ dàng.",
    goalAmount: 50000000,
    status: "active",
  },
  {
    title: "Trang bị công cụ chăm sóc khách hàng",
    description: "Kêu gọi tài trợ để mua các công cụ CSKH, tổng đài và dashboard phản hồi nhằm giải quyết khiếu nại nhanh chóng.",
    shortDescription: "Nâng cấp công cụ CSKH",
    highlightMessage: "Phản hồi nhanh, xử lý minh bạch.",
    goalAmount: 40000000,
    status: "active",
  },
  {
    title: "Quỹ truyền thông cộng đồng ReUni",
    description: "Tài trợ các hoạt động truyền thông để lan tỏa mô hình tái sử dụng, tiêu dùng bền vững và kết nối cộng đồng sinh viên.",
    shortDescription: "Truyền thông và phát triển cộng đồng",
    highlightMessage: "Lan tỏa thói quen tiêu dùng xanh.",
    goalAmount: 35000000,
    status: "closed",
  },
  {
    title: "Quỹ dự phòng rủi ro giao dịch",
    description: "Xây dựng quỹ dự phòng cho các tình huống rủi ro trong giao dịch để hỗ trợ người dùng khi phát sinh sự cố đặc biệt.",
    shortDescription: "Dự phòng rủi ro giao dịch",
    highlightMessage: "An tâm hơn khi mua bán trực tuyến.",
    goalAmount: 60000000,
    status: "closed",
  },
];

const updateCampaigns = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Charity.find().sort({ createdAt: 1 });

    if (existing.length === 0) {
      await Charity.insertMany(
        charitySeed.map((item, index) => ({
          ...item,
          currentAmount: Math.round(item.goalAmount * (0.1 + (index % 4) * 0.08)),
        }))
      );
      console.log("No campaigns existed. Inserted new campaign set.");
      process.exit(0);
    }

    const max = Math.max(existing.length, charitySeed.length);

    for (let i = 0; i < max; i += 1) {
      const source = charitySeed[i % charitySeed.length];
      const target = existing[i];

      if (target) {
        const nextCurrent = Math.min(
          Number(source.goalAmount || 0),
          Math.max(Number(target.currentAmount || 0), Math.round(Number(source.goalAmount || 0) * 0.15))
        );

        await Charity.findByIdAndUpdate(target._id, {
          title: source.title,
          description: source.description,
          shortDescription: source.shortDescription,
          highlightMessage: source.highlightMessage,
          goalAmount: source.goalAmount,
          currentAmount: nextCurrent,
          status: source.status,
        });
      } else {
        await Charity.create({
          ...source,
          currentAmount: Math.round(source.goalAmount * 0.15),
        });
      }
    }

    console.log("Campaign data updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to update campaigns:", error);
    process.exit(1);
  }
};

updateCampaigns();
