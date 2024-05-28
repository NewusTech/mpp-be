const { response } = require('../helpers/response.formatter');

const { Layananforminput, Layananformnum, Layananform, sequelize } = require('../models');
require('dotenv').config()

const Validator = require("fastest-validator");
const v = new Validator();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = {

    //input form user
    inputform: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const folderPaths = {
                fileinput: "mpp/file_pemohon",
            };

            const idlayanan = req.params.idlayanan;
            const iduser = data.userId;

            if (!iduser) {
                throw new Error('User ID is required');
            }

            const { datainput } = req.body;
            let { datafile } = req.body;

            let layananID = {
                userinfo_id: Number(iduser),
                layanan_id: Number(idlayanan),
                isonline: true,
                status: true
            };

            const createdLayananformnum = await Layananformnum.create(layananID, { transaction });

            const updatedDatainput = datainput.map(item => ({
                ...item,
                layananformnum_id: createdLayananformnum.id
            }));

            // Upload files to Cloudinary and update datafile with URLs
            const files = req.files;
            let fileUploadPromises = files.map(async (file) => {
                const { fieldname, mimetype, buffer, originalname } = file;
                const base64 = Buffer.from(buffer).toString('base64');
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: folderPaths.fileinput,
                    public_id: uniqueFilename,
                });

                // Extract index from fieldname (e.g., 'datafile[0][data]' -> 0)
                const index = parseInt(fieldname.match(/\d+/)[0], 10);
                datafile[index].data = result.secure_url;
            });

            await Promise.all(fileUploadPromises);

            // Update datafile with layananformnum_id
            datafile = datafile.map(item => ({
                ...item,
                layananformnum_id: createdLayananformnum.id
            }));

            const createdLayananforminput = await Layananforminput.bulkCreate(updatedDatainput, { transaction });
            const createdLayananformfile = await Layananforminput.bulkCreate(datafile, { transaction });

            await transaction.commit();
            res.status(201).json(response(201, 'Success create layananforminput', { input: createdLayananforminput, file: createdLayananformfile }));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.error(err);
        }
    },

    //get input form user
    getdetailinputform: async (req, res) => {
        try {
            const idlayanannum = req.params.idlayanannum

            let inputformData = await Layananforminput.findAll({
                where: {
                    layananformnum_id: idlayanannum
                },
                include: [{
                    model: Layananform,
                    attributes: { exclude: ['createdAt', 'updatedAt', "status"] },
                }]
            });

            if (!inputformData || inputformData < 1) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            let formatteddata = inputformData.map(datafilter => {
                return {
                    id: datafilter.id,
                    data: datafilter.data,
                    layananform_id: datafilter.layananform_id,
                    layananformnum_id: datafilter.layananformnum_id,
                    layananform_name: datafilter.Layananform.field,
                    layananform_tipedata: datafilter.Layananform.tipedata
                };
            });

            res.status(200).json(response(200, 'success get data', formatteddata));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    updatedata: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { datainput } = req.body;
            const idlayanannum = req.params.idlayanannum;
    
            // Update data entries
            const updateDataPromises = datainput.map(item =>
                Layananforminput.update(
                    { data: item.data, layananform_id: item.layananform_id },
                    { where: { id: item.id, layananformnum_id: idlayanannum }, transaction }
                )
            );
    
            // Handle file uploads to Cloudinary and update corresponding database entries
            const files = req.files;
            const folderPaths = { fileinput: "mpp/file_pemohon" };
    
            let fileUpdatePromises = files.map(async (file) => {
                const { fieldname, mimetype, buffer, originalname } = file;
                const base64 = Buffer.from(buffer).toString('base64');
                const dataURI = `data:${mimetype};base64,${base64}`;
    
                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;
    
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: folderPaths.fileinput,
                    public_id: uniqueFilename,
                });
    
                // Extract index from fieldname (e.g., 'datafile[0][data]' -> 0)
                const index = parseInt(fieldname.match(/\d+/)[0], 10);
    
                // Assuming datafile[index].id is available in req.body to identify the correct record
                await Layananforminput.update(
                    { data: result.secure_url },
                    { where: { id: req.body.datafile[index].id, layananformnum_id: idlayanannum }, transaction }
                );
            });
    
            await Promise.all([...updateDataPromises, ...fileUpdatePromises]);
    
            await transaction.commit();
            res.status(200).json(response(200, 'Success update layananforminput'));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

}