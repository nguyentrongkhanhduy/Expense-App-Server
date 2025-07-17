const e = require("express");
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

const reassignCategory = async (req, res) => {
  try {
    const { userId, oldCategoryId, newCategoryId } = req.body;
    if (!userId || !oldCategoryId || !newCategoryId) {
      return res
        .status(400)
        .json({ error: "User ID and category IDs are required" });
    }

    const transactionsRef = db
      .collection("users")
      .doc(userId)
      .collection("transactions");
    const snapshot = await transactionsRef
      .where("categoryId", "==", oldCategoryId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No transactions found" });
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { categoryId: newCategoryId });
    });

    await batch.commit();
    res.status(200).json({ success: true, message: "Category reassigned" });
  } catch (error) {
    console.error("Error reassigning category:", error);
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
    const file = bucket.file(`users/${userId}/${imageName}`);
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
    const file = bucket.file(`users/${userId}/${imageName}`);
    const stream = file.createWriteStream({
      metadata: {
        contentType,
        cacheControl: "no-cache",
      },
      resumable: false,
    });
    stream.on("error", (error) => {
      console.error("Error updating image:", error);
      res.status(500).json({ success: false, error: error.message });
    });
    stream.on("finish", async () => {
      await file.makePublic();
      const timestamp = Date.now();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}?t=${timestamp}`;
      console.log("Image updated successfully:", publicUrl);

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
    const file = bucket.file(`users/${userId}/${imageName}`);
    await file.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.fcmToken) {
      return res
        .status(404)
        .json({ error: "User not found or FCM token missing" });
    }

    const transactionRef = db
      .collection("users")
      .doc(userId)
      .collection("transactions");

    const startOfJune = new Date(new Date().getFullYear(), 5, 1).getTime();
    const endOfJune = new Date(
      new Date().getFullYear(),
      5,
      30,
      23,
      59,
      59
    ).getTime();

    const juneSnapshot = await transactionRef
      .where("date", ">=", startOfJune)
      .where("date", "<=", endOfJune)
      .get();

    let totalSpent = 0;
    let totalEarned = 0;
    juneSnapshot.forEach((doc) => {
      const transaction = doc.data();
      if (transaction.type === "expense") {
        totalSpent += transaction.amount || 0;
      } else if (transaction.type === "income") {
        totalEarned += transaction.amount || 0;
      }
    });

    const bodyText = `You spent $${totalSpent.toFixed(
      2
    )} and earned $${totalEarned.toFixed(2)} in June.`;

    const message = {
      data: {
        title: "June Summary",
        body: bodyText,
      },
      token: userData.fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    res
      .status(200)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const sendWeeklySummaries = async () => {
  try {
    const userSnapshot = await db.collection("users").get();
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    const diffToLastMonday = (day === 0 ? -13 : -6) - day;
    startOfWeek.setDate(currentDate.getDate() + diffToLastMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const startMillis = startOfWeek.getTime();
    const endMillis = endOfWeek.getTime();

    for (const userDoc of userSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      if (!userData.fcmToken) {
        console.warn(`No FCM token for user ${userId}`);
        continue;
      }
      if (userData.messagePreference !== "Weekly") {
        continue;
      }

      const transactionRef = db
        .collection("users")
        .doc(userId)
        .collection("transactions");

      const weeklySnapshot = await transactionRef
        .where("date", ">=", startMillis)
        .where("date", "<=", endMillis)
        .get();

      let totalSpent = 0;
      let totalEarned = 0;

      weeklySnapshot.forEach((doc) => {
        const transaction = doc.data();
        if (transaction.type === "expense") {
          totalSpent += transaction.amount || 0;
        } else if (transaction.type === "income") {
          totalEarned += transaction.amount || 0;
        }
      });

      const bodyText = `You spent $${totalSpent.toFixed(
        2
      )} and earned $${totalEarned.toFixed(2)} last week.`;

      const message = {
        data: {
          title: "Weekly Summary",
          body: bodyText,
        },
        token: userData.fcmToken,
      };

      await admin
        .messaging()
        .send(message)
        .then(() => {
          console.log(`Weekly summary sent to user ${userId}`);
        })
        .catch(async (error) => {
          if (error.code === "messaging/registration-token-not-registered") {
            console.warn(
              `Invalid FCM token for user ${userId}: ${error.message}`
            );
            await db
              .collection("users")
              .doc(userId)
              .update({ fcmToken: admin.firestore.FieldValue.delete() });
          } else {
            console.error(
              `Error sending weekly summary to user ${userId}:`,
              error
            );
          }
        });
    }
  } catch (error) {
    console.error("Error sending weekly summaries:", error);
  }
};

const sendMonthlySummaries = async () => {
  try {
    const userSnapshot = await db.collection("users").get();
    const currentDate = new Date();
    const lastMonth = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1)
    );

    const startOfMonth = new Date(
      Date.UTC(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth(), 1, 0, 0, 0)
    );

    const endOfMonth = new Date(
      Date.UTC(
        lastMonth.getUTCFullYear(),
        lastMonth.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999
      )
    );
    const startMillis = startOfMonth.getTime();
    const endMillis = endOfMonth.getTime();

    for (const userDoc of userSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      if (!userData.fcmToken) {
        console.warn(`No FCM token for user ${userId}`);
        continue;
      }
      if (userData.messagePreference !== "Monthly") {
        continue;
      }

      const transactionRef = db
        .collection("users")
        .doc(userId)
        .collection("transactions");

      const monthlySnapshot = await transactionRef
        .where("date", ">=", startMillis)
        .where("date", "<=", endMillis)
        .get();

      let totalSpent = 0;
      let totalEarned = 0;

      monthlySnapshot.forEach((doc) => {
        const transaction = doc.data();
        if (transaction.type === "expense") {
          totalSpent += transaction.amount || 0;
        } else if (transaction.type === "income") {
          totalEarned += transaction.amount || 0;
        }
      });

      const bodyText = `You spent $${totalSpent.toFixed(
        2
      )} and earned $${totalEarned.toFixed(2)} last month.`;

      const message = {
        data: {
          title: "Monthly Summary",
          body: bodyText,
        },
        token: userData.fcmToken,
      };

      await admin
        .messaging()
        .send(message)
        .then(() => {
          console.log(`Monthly summary sent to user ${userId}`);
        })
        .catch(async (error) => {
          if (error.code === "messaging/registration-token-not-registered") {
            console.warn(
              `Invalid FCM token for user ${userId}: ${error.message}`
            );
            await db
              .collection("users")
              .doc(userId)
              .update({ fcmToken: admin.firestore.FieldValue.delete() });
          } else {
            console.error(
              `Error sending monthly summary to user ${userId}:`,
              error
            );
          }
        });
    }
  } catch (error) {
    console.error("Error sending monthly summaries:", error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  reassignCategory,
  deleteTransaction,
  uploadImageToStorage,
  updateImageInStorage,
  removeImageFromStorage,
  sendTestNotification,
  sendWeeklySummaries,
  sendMonthlySummaries,
};
