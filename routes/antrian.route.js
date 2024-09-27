const antrianController = require('../controllers/antrian.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const panggilanAntrianQueue = require('../queues/panggilanAntrianQueue');

route.get('/antrian', async (req, res) => {
    try {
        // Ambil semua pekerjaan yang sudah selesai
        const completedJobs = await panggilanAntrianQueue.getCompleted();

        // Memilih data yang ingin ditampilkan
        const formattedJobs = completedJobs.map(job => ({
            id: job.id,
            data: {
                antrianId: job.data.antrianId,
                audio: job.data.audio
            }
        }));

        res.status(200).json({
            status: 200,
            message: 'Daftar pekerjaan yang sudah selesai dalam antrian',
            data: formattedJobs
        });
    } catch (error) {
        console.error('Error fetching completed jobs:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Endpoint untuk memperbarui status
route.get('/antrian/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await panggilanAntrianQueue.getJob(jobId);
        if (job) {
            const { antrianId, audio, status } = job.data;
            res.status(200).json({
                status: 200,
                message: 'Success',
                data: {
                    antrianId,
                    audio,
                    status
                }
            });
        } else {
            res.status(404).json({ status: 404, message: 'Job not found' });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ status: 500, message: 'Internal server error', error });
    }
});

route.put('/antrian/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.body; // status yang akan diupdate, misalnya 'done'

    try {
        const job = await panggilanAntrianQueue.getJob(jobId);
        if (job) {
            await job.update({ antrianId: job?.data?.antrianId, audio: job?.data?.audio, status });
            res.status(200).json({ status: 200, message: 'Status updated successfully' });
        } else {
            res.status(404).json({ status: 404, message: 'Job not found' });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ status: 500, message: 'Internal server error', error });
    }
});

route.post('/user/antrian/create', antrianController.createantrian);
route.post('/antrian/createfrombarcode', antrianController.createAntrianFromQRCode);
route.get('/user/antrian/get/instansi/:slugdinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Layanan', 'Super Admin', 'Admin Verifikasi', 'Bupati'])], antrianController.getantrianbyinstansi);
route.get('/user/antrian/get/layanan/:sluglayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Layanan', 'Super Admin', 'Admin Verifikasi', 'Bupati'])], antrianController.getantrianbylayanan);

route.get('/antrian/check/:idlayanan', antrianController.checkantrian);
route.post('/panggilantrian/get/:sluglayanan', antrianController.panggilAntrianBerikutnya);
route.post('/panggilulang/get/:id', antrianController.panggilUlangAntrian);
route.post('/antrianfinish/:idantrian', antrianController.finishAntrian);

route.get('/user/antrian/pdf', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], antrianController.pdfriwayatantrian);

module.exports = route;