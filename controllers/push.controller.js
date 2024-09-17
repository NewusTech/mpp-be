const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
const expo = new Expo();

const sendPushNotification = async (token, message) => {
  const pushMessage = {
    to: token,
    sound: "default",
    title: message.title || "Notification",
    body: message.body || "You have a new message!",
    data: message.data || {},
  };

  // Construct an array of messages to send
  const messages = [pushMessage];

  console.log("Sending Push Notification:", messages);

  try {
    // Send notifications
    const ticketChunks = await expo.sendPushNotificationsAsync(messages);
    console.log("Ticket Chunks:", ticketChunks);
    return ticketChunks;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw new Error("Failed to send push notification");
  }
};

module.exports = { sendPushNotification };
