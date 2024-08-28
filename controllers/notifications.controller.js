const { response } = require('../helpers/response.formatter');
const logger = require('../errorHandler/logger');

module.exports = {

    //membuat instansi
    postnotifications : async (req, res) => {
        const newNotification = {
            id: Date.now(), // ID unik menggunakan timestamp
            title: req.body.title, // Judul notifikasi
            description: req.body.description, // Deskripsi notifikasi
            date: new Date().toISOString().split('T')[0] // Tanggal saat notifikasi dibuat
        };
    
        // Simpan notifikasi ke dalam session
        req.session.notifications = req.session.notifications || [];
        req.session.notifications.push(newNotification);
    
        // Kembalikan notifikasi yang baru saja ditambahkan sebagai respons
        res.status(200).json(response(200, 'success post notifications', newNotification));
    },

    //mendapatkan semua data instansi
    getnotifications : async (req, res) => {
        try{ 
            const notifications = req.session;
            res.status(200).json(response(200, 'success get notif', notifications));
        } catch (err) {
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
        
    },

    deletenotifications: async (req, res) => {
        const { id, deleteall } = req.query;

        if (deleteall) {
            req.session.notifications = [];
            res.status(200).json(response(200, 'Notifikasi berhasil dihapus semua'));
            return
        }

        req.session.notifications = req.session.notifications || [];

        // Cari index notifikasi berdasarkan ID
        const index = req.session.notifications.findIndex(notification => notification.id == id);

        if (index !== -1) {
            // Hapus notifikasi dari array
            req.session.notifications.splice(index, 1);
            res.status(200).json(response(200, 'Notifikasi berhasil dihapus'));
        } else {
            res.status(200).json(response(200, 'Notifikasi tidak ditemukan'));
        }
    },

}