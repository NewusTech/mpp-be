const Redis = require("ioredis");
const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Simpan token ke Redis
const saveToken = async (token) => {
  try {
    await redisClient.set("token", token);
    console.log("Token saved:", token);
  } catch (err) {
    console.error("Error saving token:", err);
  }
};

// Simpan ID ke Redis
const saveId = async (id) => {
  try {
    await redisClient.set("id", id);
    console.log("ID saved:", id);
  } catch (err) {
    console.error("Error saving id:", err);
  }
};

// Dapatkan token dari Redis
const getToken = async () => {
  try {
    const token = await redisClient.get("token");
    console.log("Token retrieved:", token);
    return token;
  } catch (err) {
    console.error("Error getting token:", err);
    return null;
  }
};

// Dapatkan ID dari Redis
const getId = async () => {
  try {
    const id = await redisClient.get("id");
    console.log("ID retrieved:", id);
    return id;
  } catch (err) {
    console.error("Error getting ID:", err);
    return null;
  }
};

// Export functions for use in other modules
module.exports = { saveToken, saveId, getId, getToken };
