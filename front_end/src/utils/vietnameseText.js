const replacements = [
  [/\bSan pham do cu\b/gi, "Sản phẩm đồ cũ"],
  [/\bSan pham\b/gi, "Sản phẩm"],
  [/\bcon su dung tot\b/gi, "còn sử dụng tốt"],
  [/\bphu hop cho sinh vien\b/gi, "phù hợp cho sinh viên"],
  [/\bDo gia dung\b/gi, "Đồ gia dụng"],
  [/\bNoi that\b/gi, "Nội thất"],
  [/\bSach\b/gi, "Sách"],
  [/\bVan hoc\b/gi, "Văn học"],
  [/\bThiet bi dien tu\b/gi, "Thiết bị điện tử"],
  [/\bXe dap\b/gi, "Xe đạp"],
  [/\bDo hoc tap\b/gi, "Đồ học tập"],
  [/\bKhac\b/gi, "Khác"],
  [/\bHa Noi\b/gi, "Hà Nội"],
  [/\bHo Chi Minh\b/gi, "Hồ Chí Minh"],
  [/\bBa Dinh\b/gi, "Ba Đình"],
  [/\bDong Da\b/gi, "Đống Đa"],
  [/\bCau Giay\b/gi, "Cầu Giấy"],
  [/\bHai Ba Trung\b/gi, "Hai Bà Trưng"],
  [/\bNam Tu Liem\b/gi, "Nam Từ Liêm"],
  [/\bThanh Xuan\b/gi, "Thanh Xuân"],
  [/\bBinh Thanh\b/gi, "Bình Thạnh"],
  [/\bGo Vap\b/gi, "Gò Vấp"],
  [/\bQuan 7\b/gi, "Quận 7"],
  [/\bThu Duc\b/gi, "Thủ Đức"],
  [/\bDen\b/gi, "Đen"],
  [/\bTrang\b/gi, "Trắng"],
  [/\bXam\b/gi, "Xám"],
  [/\bDo\b/gi, "Đỏ"],
];

export const toVietnameseDisplay = (value) => {
  if (typeof value !== "string") return value;
  let result = value;
  for (const [pattern, output] of replacements) {
    result = result.replace(pattern, output);
  }
  return result;
};
