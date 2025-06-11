const admin = require("firebase-admin");
const db = admin.firestore();

const getCategories = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("categories")
      .get();
    const categories = snapshot.docs.map((doc) => ({
      categoryId: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { userId, category } = req.body;
    if (!userId || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { categoryId, type, title, icon, limit, updatedAt } = category;
    if (!categoryId || !type || !title || !icon || !updatedAt) {
      return res
        .status(400)
        .json({ error: "Missing required values" });
    }

    const categoryData = {
      categoryId,
      type,
      title,
      icon,
      limit: limit || null,
      updatedAt: updatedAt || admin.firestore.FieldValue.serverTimestamp(),
    };
    const categoryRef = db
      .collection("users")
      .doc(userId)
      .collection("categories")
      .doc(String(categoryId));
    await categoryRef.set(categoryData);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: error.message });
  }
};

const createInitialCategories = async (req, res) => {
  try {
    const { userId, categories } = req.body;
    if (!userId || !Array.isArray(categories) || categories.length === 0) {
      return res
        .status(400)
        .json({ error: "User ID and categories are required" });
    }
    const batch = db.batch();
    categories.forEach((category) => {
      const { categoryId, type, title, icon, limit, updatedAt } = category;
      const categoryData = {
        categoryId,
        type,
        title,
        icon,
        limit: limit || null,
        updatedAt: updatedAt || admin.firestore.FieldValue.serverTimestamp(),
      };
      const categoryRef = db
        .collection("users")
        .doc(userId)
        .collection("categories")
        .doc(String(categoryId));
      batch.set(categoryRef, categoryData);
    });
    await batch.commit();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error creating initial categories:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { userId, category } = req.body;
    const { categoryId } = req.params;
    if (!userId || !category || !categoryId) {
      return res
        .status(400)
        .json({
          error: "User ID, category data, and Category ID are required",
        });
    }
    const { type, title, icon, limit, updatedAt } = category;
    const categoryData = {
      type,
      title,
      icon,
      limit: limit || null,
      updatedAt: updatedAt || admin.firestore.FieldValue.serverTimestamp(),
    };
    const categoryRef = db
      .collection("users")
      .doc(userId)
      .collection("categories")
      .doc(String(categoryId));
    await categoryRef.update(categoryData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { userId } = req.body;
    const { categoryId } = req.params;
    if (!userId || !categoryId) {
      return res
        .status(400)
        .json({ error: "User ID and Category ID are required" });
    }
    const categoryRef = db
      .collection("users")
      .doc(userId)
      .collection("categories")
      .doc(String(categoryId));
    await categoryRef.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  createInitialCategories,
  updateCategory,
  deleteCategory,
};
