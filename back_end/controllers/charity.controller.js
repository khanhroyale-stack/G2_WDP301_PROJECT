import Charity from "../models/charity.model.js";
import Donation from "../models/donation.model.js";

export const createCharity = async (req, res) => {
  try {
    const { title, description, goalAmount } = req.body;

    const charity = new Charity({
      title,
      description,
      goalAmount: goalAmount || 0,
      status: "active",
    });

    await charity.save();
    res.status(201).json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllCharities = async (req, res) => {
  try {
    const charities = await Charity.find().sort({ createdAt: -1 });
    res.status(200).json(charities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCharityStats = async (req, res) => {
  try {
    const charities = await Charity.find();
    const totalDonated = charities.reduce(
      (sum, charity) => sum + (charity.currentAmount || 0),
      0,
    );
    const totalGoal = charities.reduce(
      (sum, charity) => sum + (charity.goalAmount || 0),
      0,
    );
    const activeCampaigns = charities.filter(
      (c) => c.status === "active",
    ).length;

    res.status(200).json({
      totalDonated,
      totalGoal,
      activeCampaigns,
      totalCampaigns: charities.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCharityWithDonations = async (req, res) => {
  try {
    const { id } = req.params;
    const charity = await Charity.findById(id);
    if (!charity) {
      return res.status(404).json({ message: "Không tìm thấy chiến dịch" });
    }

    const donations = await Donation.find({ charityId: id }).sort({
      createdAt: -1,
    });

    const maskedDonations = donations.map((d) => {
      const name = d.donorName || "Anonymous";
      const maskedName =
        name.length <= 3 ? name + "***" : name.substring(0, 3) + "***";
      return {
        _id: d._id,
        amount: d.amount,
        donorName: maskedName,
        message: d.message,
        createdAt: d.createdAt,
      };
    });

    res.status(200).json({ charity, donations: maskedDonations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const donateToCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const { donorName, amount, message } = req.body;

    const charity = await Charity.findById(id);
    if (!charity) {
      return res.status(404).json({ message: "Không tìm thấy chiến dịch" });
    }

    const donation = new Donation({
      charityId: id,
      donorName: donorName || "Anonymous",
      amount: Number(amount),
      message,
    });

    await donation.save();

    charity.currentAmount = (charity.currentAmount || 0) + Number(amount);
    await charity.save();

    res.status(201).json({
      message: "Ủng hộ thành công",
      donation,
      currentAmount: charity.currentAmount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goalAmount, status } = req.body;

    const charity = await Charity.findById(id);
    if (!charity) {
      return res.status(404).json({ message: "Không tìm thấy chiến dịch" });
    }

    if (title) charity.title = title;

    if (description) {
      charity.description = description;
    }

    if (goalAmount !== undefined) charity.goalAmount = goalAmount;
    if (status) charity.status = status;

    await charity.save();
    res.status(200).json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const charity = await Charity.findByIdAndDelete(id);
    if (!charity) {
      return res.status(404).json({ message: "Không tìm thấy chiến dịch" });
    }

    await Donation.deleteMany({ charityId: id });

    res.status(200).json({
      message: "Đã xóa chiến dịch và các khoản ủng hộ liên quan",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
