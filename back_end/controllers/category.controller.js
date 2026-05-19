import Category from "../models/category.model.js";

const normalizeSlug = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const getCategories = async (req, res) => {
  try {
    const { activeOnly = "true" } = req.query;
    const query = {};
    if (activeOnly === "true") {
      query.isActive = true;
    }

    const categories = await Category.find(query).sort({ level: 1, sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, parentId, level = 1, isActive = true, sortOrder = 0, icon = "" } = req.body;
    const finalSlug = normalizeSlug(slug || name);

    const exists = await Category.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(400).json({ message: "Slug danh muc da ton tai" });
    }

    const category = await Category.create({
      name,
      slug: finalSlug,
      parentId: parentId || null,
      level,
      isActive,
      sortOrder,
      icon,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parentId, level, isActive, sortOrder, icon } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Khong tim thay danh muc" });
    }

    if (name !== undefined) category.name = name;
    if (slug !== undefined || name !== undefined) {
      const nextSlug = normalizeSlug(slug || category.name);
      const conflict = await Category.findOne({ slug: nextSlug, _id: { $ne: id } });
      if (conflict) {
        return res.status(400).json({ message: "Slug danh muc da ton tai" });
      }
      category.slug = nextSlug;
    }
    if (parentId !== undefined) category.parentId = parentId || null;
    if (level !== undefined) category.level = level;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (icon !== undefined) category.icon = icon;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const child = await Category.findOne({ parentId: id });
    if (child) {
      return res.status(400).json({ message: "Khong the xoa danh muc dang co danh muc con" });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Khong tim thay danh muc" });
    }

    res.json({ message: "Da xoa danh muc" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
