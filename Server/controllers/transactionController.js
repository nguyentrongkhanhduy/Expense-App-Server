const { db, admin, bucket } = require("../firebaseServices");

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
    console.log(req.body);
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
      return res
        .status(400)
        .json({ error: "User ID and Transaction ID are required" });
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

const uploadImageToStorage = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, requestedImage } = req.body;
    if (!userId || !requestedImage) {
      return res
        .status(400)
        .json({ error: "User ID and requested image are required" });
    }
    const { imageName, imageData, contentType } = requestedImage;
    if (!imageName || !imageData) {
      return res
        .status(400)
        .json({ error: "Image name and data are required" });
    }

    const buffer = Buffer.from(imageData, "base64");
    const file = bucket.file(`users/${userId}/transactions/${imageName}`);
    const stream = file.createWriteStream({
      metadata: { contentType },
    });
    stream.on("error", (error) => {
      console.error("Error uploading image:", error);
      res.status(500).json({ success: false, error: error.message });
    });
    stream.on("finish", async () => {
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      console.log("Image uploaded successfully:", publicUrl);
      res.status(200).json({ success: true, imageUrl: publicUrl });
    });
    stream.end(buffer);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateImageInStorage = async (req, res) => {
  try {
    const { userId, requestedImage } = req.body;
    if (!userId || !requestedImage) {
      return res
        .status(400)
        .json({ error: "User ID and requested image are required" });
    }
    const { imageName, imageData, contentType } = requestedImage;
    if (!imageName || !imageData) {
      return res
        .status(400)
        .json({ error: "Image name and data are required" });
    }

    const buffer = Buffer.from(imageData, "base64");
    const file = bucket.file(`users/${userId}/transactions/${imageName}`);
    const stream = file.createWriteStream({
      metadata: { contentType },
    });
    stream.on("error", (error) => {
      console.error("Error updating image:", error);
      res.status(500).json({ success: false, error: error.message });
    });
    stream.on("finish", async () => {
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      res.status(200).json({ success: true, imageUrl: publicUrl });
    });
    stream.end(buffer);
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeImageFromStorage = async (req, res) => {
  try {
    const { userId, imageName } = req.body;
    if (!userId || !imageName) {
      return res
        .status(400)
        .json({ error: "User ID and image name are required" });
    }
    const file = bucket.file(`users/${userId}/transactions/${imageName}`);
    await file.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadImageToStorage,
  updateImageInStorage,
  removeImageFromStorage,
};
