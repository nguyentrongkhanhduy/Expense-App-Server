const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccountKey.json");

require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  db,
  auth,
  bucket,
};
