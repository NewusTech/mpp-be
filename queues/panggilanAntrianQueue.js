const Queue = require('bull');
const { panggilAntrianProcess } = require('../controllers/antrianProcess.js'); // Sesuaikan dengan lokasi function
const axios = require('axios');

const panggilanAntrianQueue = new Queue('panggilanAntrianQueue', {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
    limiter: {
        max: 1,
        duration: 20000
    }
});

panggilanAntrianQueue.process(1, async (job, done) => {
    try {
        const { antrianId, audio, status } = job.data;

        console.log(`Processing job ID: ${job.id}`);

        let retryCount = 0;
        const maxRetries = 10;
        let jobDone = false;

        while (retryCount < maxRetries && !jobDone) {
            const playAudioUrl = `${process.env.SERVER_URL}/api/antrian/${job.id}`;

            const response = await axios.get(playAudioUrl);

            console.log(`Retry attempt ${retryCount + 1} for job ID: ${job.id}`);

            if (status === 'done' || response?.data?.data?.status === 'done') {
                console.log(`Audio for antrianId ${antrianId} is now playing.`);

                await job.update({ antrianId, audio, status: 'done' });
                jobDone = true;
                done();
            } else {
                retryCount++;

                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        if (!jobDone) {
            // Jika setelah 10 kali pengecekan tetap tidak berhasil, lanjutkan ke job berikutnya
            console.log(`Max retries reached for job ID: ${job.id}, moving to the next job.`);
            done(new Error('Failed to play audio after 10 attempts, moving to next queue.'));
        }

    } catch (error) {
        console.error('Error processing job:', error);
        done(error);
    }
});

module.exports = panggilanAntrianQueue;
