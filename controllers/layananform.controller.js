const { response } = require('../helpers/response.formatter');

const { Layanan, Layananform, sequelize } = require('../models');
require('dotenv').config()

const { Op } = require('sequelize');
const Validator = require("fastest-validator");
const v = new Validator();
const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

module.exports = {

    // LAYANAN FORM

    //membuat layananform
    createlayananform: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                tipedata: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                maxinput: {
                    type: "number",
                    optional: true
                },
                mininput: {
                    type: "number",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                isrequired: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
                datajson: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            key: { type: "string" }
                        },
                        required: ["id", "key"]
                    },
                    optional: true
                }
            }

            //buat object layananform
            let layananformCreateObj = {
                field: req.body.field,
                tipedata: req.body.tipedata,
                maxinput: req.body.maxinput ? Number(req.body.maxinput) : null,
                mininput: req.body.mininput ? Number(req.body.mininput) : null,
                isrequired: req.body.isrequired ? Number(req.body.isrequired) : null,
                status: req.body.status ? Number(req.body.status) : null,
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
                datajson: req.body.datajson || null
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananformCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat layananform
            let layananformCreate = await Layananform.create(layananformCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create layananform', layananformCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    createmultilayananform: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // Define schema for validation
            const schema = {
                field: { type: "string", min: 1 },
                tipedata: { type: "string", min: 1 },
                maxinput: { type: "number", optional: true },
                mininput: { type: "number", optional: true },
                status: { type: "number", optional: true },
                isrequired: { type: "number", optional: true },
                layanan_id: { type: "number", optional: true },
                datajson: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            key: { type: "string" }
                        },
                        required: ["id", "key"]
                    },
                    optional: true
                }
            };

            // Check if the request body is an array
            if (!Array.isArray(req.body)) {
                res.status(400).json(response(400, 'Request body must be an array of objects'));
                return;
            }

            // Initialize arrays for validation errors and successfully created objects
            let errors = [];
            let createdForms = [];

            // Validate and process each object in the input array
            for (let input of req.body) {
                // Create the layananform object
                let layananformCreateObj = {
                    field: input.field,
                    tipedata: input.tipedata,
                    maxinput: input.maxinput ? Number(input.maxinput) : null,
                    mininput: input.mininput ? Number(input.mininput) : null,
                    isrequired: input.isrequired ? Number(input.isrequired) : null,
                    status: input.status ? Number(input.status) : null,
                    layanan_id: input.layanan_id !== undefined ? Number(input.layanan_id) : null,
                    datajson: input.datajson || null
                };

                // Validate the object
                const validate = v.validate(layananformCreateObj, schema);
                if (validate.length > 0) {
                    errors.push({ input, errors: validate });
                    continue;
                }

                // Create layananform in the database
                let layananformCreate = await Layananform.create(layananformCreateObj, { transaction });
                createdForms.push(layananformCreate);
            }

            // If there are validation errors, respond with them
            if (errors.length > 0) {
                res.status(400).json(response(400, 'Validation failed', errors));
                return;
            }

            // Respond with the successfully created objects
            await transaction.commit();
            res.status(201).json(response(201, 'Successfully created layananform(s)', createdForms));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua form berdasarkan layanan
    getformbylayanan: async (req, res) => {
        try {
            const { layananid } = req.params;
    
            let formWhereCondition = {
                tipedata: {
                    [Op.ne]: "file"
                }
            };
    
            if (data.role === 'User') {
                formWhereCondition.status = true;
            }
    
            let layananData = await Layanan.findOne({
                where: {
                    id: layananid
                },
                attributes: ['name', 'slug', 'desc', 'image'],
                include: [{
                    model: Layananform,
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    where: formWhereCondition,
                    required: false,
                }],
                order: [[{ model: Layananform }, 'id', 'ASC']]
            });
    
            if (!layananData) {
                return res.status(404).json(response(404, 'Layanan not found'));
            }
    
            res.status(200).json(response(200, 'Success get layanan with forms', layananData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data layananform
    getlayananform: async (req, res) => {
        try {
            //mendapatkan data semua layananform
            let layananformGets = await Layananform.findAll({});

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get layananform', layananformGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data layananform berdasarkan id
    getlayananformById: async (req, res) => {
        try {
            //mendapatkan data layananform berdasarkan id
            let layananformGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika layananform tidak ada
            if (!layananformGet) {
                res.status(404).json(response(404, 'layananform not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get layananform by id', layananformGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate layananform berdasarkan id
    updatelayananform: async (req, res) => {
        try {
            //mendapatkan data layananform untuk pengecekan
            let layananformGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layananform ada
            if (!layananformGet) {
                res.status(404).json(response(404, 'layananform not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                tipedata: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                maxinput: {
                    type: "number",
                    optional: true
                },
                mininput: {
                    type: "number",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                isrequired: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
                datajson: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            key: { type: "string" }
                        },
                        required: ["id", "key"]
                    },
                    optional: true
                }
            }

            //buat object layananform
            let layananformUpdateObj = {
                field: req.body.field,
                tipedata: req.body.tipedata,
                maxinput: req.body.maxinput ? Number(req.body.maxinput) : null,
                mininput: req.body.mininput ? Number(req.body.mininput) : null,
                isrequired: req.body.isrequired ? Number(req.body.isrequired) : null,
                status: req.body.status ? Number(req.body.status) : null,
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
                datajson: req.body.datajson || null
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananformUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layananform
            await Layananform.update(layananformUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data layananform setelah update
            let layananformAfterUpdate = await Layananform.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update layananform', layananformAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus layananform berdasarkan id
    deletelayananform: async (req, res) => {
        try {

            //mendapatkan data layananform untuk pengecekan
            let layananformGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layananform ada
            if (!layananformGet) {
                res.status(404).json(response(404, 'layananform not found'));
                return;
            }

            await Layananform.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete layananformGet'));

        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    },

    // LAYANAN DOCS

    //membuat layanandocs
    createlayanandocs: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                tipedata: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                isrequired: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object layanandocs
            let layanandocsCreateObj = {
                field: req.body.field,
                tipedata: req.body.tipedata,
                isrequired: Number(req.body.isrequired),
                status: Number(req.body.status),
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layanandocsCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat layanandocs
            let layanandocsCreate = await Layananform.create(layanandocsCreateObj);

            //response menggunakan helper response.docsatter
            res.status(201).json(response(201, 'success create layanandocs', layanandocsCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    createmultilayanandocs: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // Define schema for validation
            const schema = {
                field: { type: "string", min: 1 },
                tipedata: { type: "string", min: 1 },
                maxinput: { type: "number", optional: true },
                mininput: { type: "number", optional: true },
                status: { type: "number", optional: true },
                isrequired: { type: "number", optional: true },
                layanan_id: { type: "number", optional: true }
            };

            // Check if the request body is an array
            if (!Array.isArray(req.body)) {
                res.status(400).json(response(400, 'Request body must be an array of objects'));
                return;
            }

            // Initialize arrays for validation errors and successfully created objects
            let errors = [];
            let createdForms = [];

            // Validate and process each object in the input array
            for (let input of req.body) {
                // Create the layananform object
                let layananformCreateObj = {
                    field: input.field,
                    tipedata: input.tipedata,
                    maxinput: input.maxinput ? Number(input.maxinput) : null,
                    mininput: input.mininput ? Number(input.mininput) : null,
                    isrequired: input.isrequired ? Number(input.isrequired) : null,
                    status: input.status ? Number(input.status) : null,
                    layanan_id: input.layanan_id !== undefined ? Number(input.layanan_id) : null
                };

                // Validate the object
                const validate = v.validate(layananformCreateObj, schema);
                if (validate.length > 0) {
                    errors.push({ input, errors: validate });
                    continue;
                }

                // Create layananform in the database
                let layananformCreate = await Layananform.create(layananformCreateObj, { transaction });
                createdForms.push(layananformCreate);
            }

            // If there are validation errors, respond with them
            if (errors.length > 0) {
                res.status(400).json(response(400, 'Validation failed', errors));
                return;
            }

            // Respond with the successfully created objects
            await transaction.commit();
            res.status(201).json(response(201, 'Successfully created layananform(s)', createdForms));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua form docs berdasarkan layanan
    getdocsbylayanan: async (req, res) => {
        try {
            const { layananid } = req.params;

            let formWhereCondition = {
                tipedata: "file"
            };
    
            if (data.role === 'User') {
                formWhereCondition.status = true;
            }

            let layananData = await Layanan.findOne({
                where: {
                    id: layananid
                },
                attributes: ['name', 'slug', 'desc', 'image'],
                include: [{
                    model: Layananform,
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                    where: formWhereCondition,
                    required: false,
                }],
                order: [[{ model: Layananform }, 'id', 'ASC']]
            });

            if (!layananData) {
                return res.status(404).json(response(404, 'Layanan not found'));
            }

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'Success get layanan with forms', layananData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //mengupdate layanandocs berdasarkan id
    updatelayanandocs: async (req, res) => {
        try {
            //mendapatkan data layanandocs untuk pengecekan
            let layanandocsGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layanandocs ada
            if (!layanandocsGet) {
                res.status(404).json(response(404, 'layanandocs not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                tipedata: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                isrequired: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object layanandocs
            let layanandocsUpdateObj = {
                field: req.body.field,
                tipedata: req.body.tipedata,
                isrequired: Number(req.body.isrequired),
                status: Number(req.body.status),
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layanandocsUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layanandocs
            await Layananform.update(layanandocsUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data layanandocs setelah update
            let layanandocsAfterUpdate = await Layananform.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update layanandocs', layanandocsAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}