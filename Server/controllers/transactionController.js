const { db, admin } = require("../firebaseServices");

const getTransactions = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .get();
    const transactions = snapshot.docs.map((doc) => ({
      transactionId: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { userId, transaction } = req.body;
    if (!userId || !transaction) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const {
      transactionId,
      amount,
      name,
      type,
      categoryId,
      note,
      date,
      location,
      imageUrl,
      updatedAt,
    } = transaction;
    if (
      !transactionId ||
      !amount ||
      !name ||
      !type ||
      !categoryId ||
      !date ||
      !updatedAt
    ) {
      return res.status(400).json({ error: "Missing required values" });
    }
    const transactionData = {
      transactionId,
      amount,
      name,
      type,
      categoryId,
      note: note || null,
      date: date || admin.firestore.FieldValue.serverTimestamp(),
      location: location || null,
      imageUrl: imageUrl || null,
      updatedAt: updatedAt || admin.firestore.FieldValue.serverTimestamp(),
    };
    const transactionRef = db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .doc(String(transactionId));
    await transactionRef.set(transactionData);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { userId, transaction } = req.body;
    const { transactionId } = req.params;
    if (!userId || !transaction || !transactionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const {
      amount,
      name,
      type,
      categoryId,
      note,
      date,
      location,
      imageUrl,
      updatedAt,
    } = transaction;
    if (!amount || !name || !type || !categoryId || !date || !updatedAt) {
      return res.status(400).json({ error: "Missing required values" });
    }
    const transactionData = {
      amount,
      name,
      type,
      categoryId,
      note: note || null,
      date: date || admin.firestore.FieldValue.serverTimestamp(),
      location: location || null,
      imageUrl: imageUrl || null,
      updatedAt: updatedAt || admin.firestore.FieldValue.serverTimestamp(),
    };
    const transactionRef = db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .doc(String(transactionId));
    await transactionRef.update(transactionData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { userId } = req.body;
    const { transactionId } = req.params;
    if (!userId || !transactionId) {
      return res.status(400).json({ error: "User ID and Transaction ID are required" });
    }
    const transactionRef = db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .doc(String(transactionId));
    await transactionRef.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
