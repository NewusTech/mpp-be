const { response } = require('../helpers/response.formatter');
const { Instansi, Layanan, Layanansurat } = require('../models');
const cloudinary = require("cloudinary").v2;
const PDFDocument = require('pdfkit');
const axios = require('axios');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = {

    getsurat: async (req, res) => {
        try {
            let layanan = await Layanan.findOne({
                where: {
                    id: req.params.idlayanan
                },
                attributes: ['id', 'name'],
                include: [
                    {
                        model: Instansi,
                        attributes: ['id', 'name', 'alamat', 'image'],
                    },
                    {
                        model: Layanansurat,
                        attributes: ['id', 'body', 'header', 'footer'],
                    }
                ]
            });
            if (!layanan) {
                return res.status(404).send('Data tidak ditemukan');
            }

            const doc = new PDFDocument({ size: 'A4', margin: 72 }); // 1 inch = 72 point
            let filename = `dinas.pdf`;
            filename = encodeURIComponent(filename) + '.pdf';
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');

            // Stream PDF ke respon
            doc.pipe(res);

            // Set margin top dan left untuk teks
            const marginLeft = 72; // 3 cm dari kiri
            const marginTop = 72; // 3 cm dari atas

            // Path logo
            if (layanan.Instansi.image) {
                const response = await axios.get(layanan.Instansi.image, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(response.data, 'binary');
                doc.image(imageBuffer, marginLeft, marginTop, {
                    fit: [65, 65],
                    align: 'left',
                    valign: 'top'
                });
            }

            // Add space for the logo
            const textStartY = 72; // Mulai teks 72 poin di bawah margin atas

            doc.fontSize(16).text("PEMERINTAH KABUPATEN LAMPUNG TIMUR", { align: 'center' });
            doc.fontSize(16).text(layanan.Instansi.name, marginLeft, textStartY + 20, { align: 'center' });
            doc.moveDown();
            doc.fontSize(11).text(layanan.Instansi.alamat, marginLeft, textStartY + 40, { align: 'center' });
            doc.moveDown(2);

            const bodyStartY = textStartY + 140;
            doc.moveDown();

            doc.fontSize(16).text(layanan.Layanansurat.header, marginLeft, bodyStartY, { align: 'left' });

            doc.moveDown();
            doc.fontSize(14).text(layanan.Layanansurat.body, { align: 'left' });

            doc.moveDown();
            doc.fontSize(12).text(layanan.Layanansurat.footer, { align: 'left' });

            // Finalize PDF file
            doc.end();

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
};
