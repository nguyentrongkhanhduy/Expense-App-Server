const express = require("express");
const router = express.Router();
const { signIn, signUp, updateFcmToken, updateUserMessagePreference } = require("../controllers/authenticationController");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/update-fcm-token", updateFcmToken);
router.post("/update-message-preference", updateUserMessagePreference);

module.exports = router;