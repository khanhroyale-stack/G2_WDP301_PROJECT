import Address from "../models/address.model.js";

export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, updatedAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };

    if (payload.isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const address = await Address.create(payload);
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, userId: req.user.id });
    if (!address) {
      return res.status(404).json({ message: "Khong tim thay dia chi" });
    }

    Object.keys(req.body).forEach((key) => {
      address[key] = req.body[key];
    });

    if (req.body.isDefault === true) {
      await Address.updateMany({ userId: req.user.id, _id: { $ne: id } }, { isDefault: false });
    }

    await address.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!address) {
      return res.status(404).json({ message: "Khong tim thay dia chi" });
    }

    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ message: "Da xoa dia chi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
