const { response } = require('../helpers/response.formatter');
const { Instansi, Layanan, Layanansurat } = require('../models');
const Validator = require("fastest-validator");
const cloudinary = require("cloudinary").v2;
const PDFDocument = require('pdfkit');
const ejs = require('ejs');
const axios = require('axios');
const stream = require('stream');

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

            const doc = new PDFDocument({ size: 'A4' });
            let filename = `dinas.pdf`;
            filename = encodeURIComponent(filename) + '.pdf';
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');

            // Stream PDF ke respon
            doc.pipe(res);

            // Set margin top dan left untuk teks
            const marginLeft = 50;
            const marginTop = 50;

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
            const textStartY = 0;

            doc.fontSize(20).text(layanan.Instansi.name, marginLeft, textStartY, { align: 'left' });
            doc.fontSize(13).text(layanan.Instansi.alamat, marginLeft, textStartY + 25, { align: 'left' });
            doc.moveDown(2);

            const bodyStartY = textStartY + 50;
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
