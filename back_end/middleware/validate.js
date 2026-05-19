import Joi from "joi";

const fieldLabelMap = {
  username: "Tên đăng nhập",
  email: "Email",
  password: "Mật khẩu",
  newPassword: "Mật khẩu mới",
  full_name: "Họ và tên",
  phone: "Số điện thoại",
  address: "Địa chỉ",
  otp: "Mã OTP",
  title: "Tiêu đề",
  description: "Mô tả",
  price: "Giá",
  images: "Hình ảnh",
  id: "ID",
  status: "Trạng thái",
  reason: "Lý do",
  details: "Chi tiết",
  action: "Hành động",
  amount: "Số tiền",
  quantity: "Số lượng",
  type: "Loại giao dịch",
  postId: "Mã bài đăng",
  charityId: "Mã chiến dịch",
  donorName: "Tên người ủng hộ",
  message: "Nội dung",
  goalAmount: "Mục tiêu quyên góp",
  sellerId: "Mã người bán",
  orderId: "Mã đơn hàng",
  addressId: "Mã địa chỉ",
  fullName: "Họ tên",
  province: "Tỉnh/Thành phố",
  district: "Quận/Huyện",
  ward: "Phường/Xã",
  street: "Địa chỉ cụ thể",
  note: "Ghi chú",
  rating: "Đánh giá",
  comment: "Bình luận",
  paymentMethod: "Phương thức thanh toán",
  paymentStatus: "Trạng thái thanh toán",
  reportType: "Loại báo cáo",
  resolutionAction: "Kết quả xử lý",
  categoryId: "Mã danh mục",
  condition: "Tình trạng sản phẩm",
  brand: "Thương hiệu",
  color: "Màu sắc",
  size: "Kích thước",
  locationCity: "Thành phố",
  locationDistrict: "Quận/Huyện",
  shippingType: "Hình thức giao hàng",
  shippingFee: "Phí vận chuyển",
  isFreeShip: "Miễn phí vận chuyển",
  quantity: "Số lượng tồn",
};

const normalizeMessage = (detail) => {
  const fieldKey = detail.path?.[detail.path.length - 1] || "field";
  const field = fieldLabelMap[fieldKey] || fieldKey;

  switch (detail.type) {
    case "any.required":
      return `${field} là bắt buộc`;
    case "string.empty":
      return `${field} không được để trống`;
    case "string.base":
      return `${field} phải là chuỗi`;
    case "string.email":
      return `${field} không đúng định dạng email`;
    case "string.min":
      return `${field} phải có ít nhất ${detail.context?.limit} ký tự`;
    case "string.max":
      return `${field} không được vượt quá ${detail.context?.limit} ký tự`;
    case "string.pattern.base":
      return `${field} không đúng định dạng`;
    case "number.base":
      return `${field} phải là số`;
    case "number.min":
      return `${field} phải lớn hơn hoặc bằng ${detail.context?.limit}`;
    case "number.max":
      return `${field} phải nhỏ hơn hoặc bằng ${detail.context?.limit}`;
    case "array.base":
      return `${field} phải là mảng`;
    case "array.max":
      return `${field} không được vượt quá ${detail.context?.limit} phần tử`;
    case "any.only":
      return `${field} không hợp lệ`;
    case "object.unknown":
      return `Trường ${field} không được hỗ trợ`;
    default:
      return `${field} không hợp lệ`;
  }
};

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: normalizeMessage(detail),
        })),
      });
    }

    if (source === "body") {
      req.body = value;
    } else {
      for (const key of Object.keys(req[source])) {
        delete req[source][key];
      }
      Object.assign(req[source], value);
    }

    next();
  };
};

export const validateBody = (schema) => validate(schema, "body");
export const validateParams = (schema) => validate(schema, "params");
export const validateQuery = (schema) => validate(schema, "query");

export const objectIdSchema = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).required();
