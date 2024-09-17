const express = require("express");
const { sendPushNotification } = require("../controllers/push.controller");
const router = express.Router(); // Adjust the path accordingly

const mid = require("../middlewares/auth.middleware");
const { saveToken, saveId, getToken } = require("../helpers/map.utils");

router.post(
  "/user/send-notification",
  [mid.checkRolesAndLogout(["User"])],
  async (req, res) => {
    const { token, message, id } = req.body;

    if (!token || !message) {
      return res.status(400).json({ error: "Token and message are required" });
    }

    try {
      await saveToken(token);
      const response = await sendPushNotification(token, message);
      res.status(200).json({ success: true, response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
