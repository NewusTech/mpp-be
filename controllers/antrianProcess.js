const { Antrian, Instansi, Layanan, sequelize } = require('../models');
const { Op } = require('sequelize');
const tts = require('google-tts-api');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const axios = require('axios');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

const generateAndUploadAudio = async (text, language) => {
    try {
        const url = await tts.getAudioUrl(text, {
            lang: language || 'id',
            slow: false,
            host: 'https://translate.google.com',
        });

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
        });

        const now = new Date();
        const datetime = now.toISOString().replace(/[-:.]/g, '');
        const audioFileName = `antrian_audio_${uuidv4()}_${datetime}.mp3`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `audio/${audioFileName}`,
            Body: response.data,
            ContentType: 'audio/mpeg',
            ACL: 'public-read',
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        return fileUrl;
    } catch (error) {
        console.error('Error converting text to speech or uploading to S3:', error);
        throw error;
    }
};

module.exports = {
    panggilAntrianProcess: async (sluglayanan) => {
        // const transaction = await sequelize.transaction();
        // try {
        //     const today = new Date();
        //     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        //     const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        //     // Cari antrian berikutnya yang belum dipanggil
        //     const antrianBerikutnya = await Antrian.findOne({
        //         where: {
        //             status: false,
        //             createdAt: {
        //                 [Op.between]: [startOfDay, endOfDay]
        //             },
        //         },
        //         include: [
        //             {
        //                 model: Instansi,
        //                 attributes: ['id', 'name', 'code'],
        //             }, {
        //                 model: Layanan,
        //                 attributes: ['id', 'name', 'code'],
        //                 where: {
        //                     slug: sluglayanan,
        //                 },
        //             }
        //         ],
        //         order: [
        //             ['createdAt', 'ASC']
        //         ],
        //         transaction
        //     });

        //     if (!antrianBerikutnya) {
        //         await transaction.rollback();
        //         return;
        //     }

        //     // Update status antrian menjadi true
        //     antrianBerikutnya.status = true;
        //     antrianBerikutnya.updatedAt = Date.now();
        //     await antrianBerikutnya.save({ transaction });

        //     // Generate suara panggilan antrian
        //     const panggilanAntrian = `Antrian ${antrianBerikutnya?.code}, silahkan ke loket ${antrianBerikutnya?.Layanan?.code}`;
        //     const languageCode = 'id';
        //     const audioUrl = await generateAndUploadAudio(panggilanAntrian, languageCode);

        //     antrianBerikutnya.audio = audioUrl;
        //     await antrianBerikutnya.save({ transaction });

        //     global.io.emit('updateAntrian', antrianBerikutnya?.instansi_id);

        //     await transaction.commit();
        // } catch (err) {
        //     await transaction.rollback();
        //     console.error(err);
        //     throw err;
        // }
    }
};
