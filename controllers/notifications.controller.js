const { response } = require('../helpers/response.formatter');
const logger = require('../errorHandler/logger');
const { generatePagination } = require('../pagination/pagination');

const Redis = require("ioredis");
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

module.exports = {

    //membuat instansi
    postnotifications : async (req, res) => {
        const newNotification = {
            id: Date.now(), // ID unik menggunakan timestamp
            title: req.body.title, // Judul notifikasi
            description: req.body.description, // Deskripsi notifikasi
            date: new Date().toISOString().split('T')[0] // Tanggal saat notifikasi dibuat
        };

        await redisClient.set(`notification:${newNotification.id}`, JSON.stringify(newNotification));
    
        // Kembalikan notifikasi yang baru saja ditambahkan sebagai respons
        res.status(200).json(response(200, 'success post notifications', newNotification));
    },

    //mendapatkan semua data instansi
    getnotifications : async (req, res) => {
        const userinfo = data?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        try {
            const keys = await redisClient.keys('notification:*');
            const notifications = [];

            for (const key of keys) {
                const notification = await redisClient.get(key);
                const parsedNotification = JSON.parse(notification);
    
                // Filter notifikasi berdasarkan userinfo
                if (parsedNotification.userinfo === userinfo) {
                    notifications.push(parsedNotification);
                }
            }

            notifications.sort((a, b) => b.id - a.id);

            const totalCount = notifications.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedNotifications = notifications.slice(startIndex, endIndex);

            const pagination = generatePagination(totalCount, page, limit, '/api/notifications');

            res.status(200).json({
                status: 200,
                message: 'success get notifications',
                data: paginatedNotifications ,
                pagination: pagination
            });
        } catch (error) {
            logger.error(error.message);
            res.status(500).json(response(500, 'Failed to get notifications', error.message));
        }
    },

    updatenotifications: async (req, res) => {
        const { id, isopen } = req.body; 
    
        try {
            const key = `notification:${id}`;
            const notification = await redisClient.get(key);
    
            if (!notification) {
                return res.status(404).json(response(404, 'Notification not found'));
            }
    
            const parsedNotification = JSON.parse(notification);
            parsedNotification.isopen = Number(isopen); // Update nilai isopen
    
            await redisClient.set(key, JSON.stringify(parsedNotification)); // Simpan kembali ke Redis

            global.io.emit('UpdateStatus', { iduser : parsedNotification.userinfo });
    
            res.status(200).json(response(200, 'Success update notification isopen', parsedNotification));
        } catch (error) {
            logger.error(error.message);
            res.status(500).json(response(500, 'Failed to update notification', error.message));
        }
    },
    

    deletenotifications: async (req, res) => {
        try {
            const keys = await redisClient.keys('notification:*');
            
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            
            res.status(200).json(response(200, 'Success delete all notifications'));
        } catch (error) {
            logger.error(error.message);
            res.status(500).json(response(500, 'Failed to delete notifications', error.message));
        }
    }

}