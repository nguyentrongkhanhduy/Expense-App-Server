const { auth, db } = require("../firebaseServices");

const signUp = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
    });

    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await auth.getUser(uid);

    console.log(`User signed in: ${userRecord.uid}`);
    res.status(200).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
    console.log("Responding with:", {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired ID token" });
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res
        .status(400)
        .json({ error: "User ID and FCM token are required" });
    }

    await db.collection("users").doc(userId).set({ fcmToken }, { merge: true });

    console.log(`FCM token updated for user: ${userId}`);
    res.status(200).json({ message: "FCM token updated successfully" });
  } catch (error) {
    console.error("Error updating FCM token:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateUserMessagePreference = async (req, res) => {
  try {
    const { userId, messagePreference } = req.body;

    if (!userId || !messagePreference) {
      return res
        .status(400)
        .json({ error: "User ID and preferences are required" });
    }

    await db.collection("users").doc(userId).set(
      {
        messagePreference: messagePreference,
      },
      { merge: true }
    );

    console.log(`User preferences updated for user: ${userId}`);
    res.status(200).json({ message: "User preferences updated successfully" });
  } catch (error) {
    console.error("Error updating user preferences:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signUp,
  signIn,
  updateFcmToken,
  updateUserMessagePreference,
};
