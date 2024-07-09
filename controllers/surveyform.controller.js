const { response } = require('../helpers/response.formatter');

const { Surveyform, Instansi, sequelize } = require('../models');
require('dotenv').config()

const { Op } = require('sequelize');
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    // LAYANAN FORM

    //membuat surveyform
    createsurveyform: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                desc: {
                    type: "string",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                instansi_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object surveyform
            let surveyformCreateObj = {
                field: req.body.field,
                desc: req.body.desc ?? undefined,
                status: Number(req.body.status),
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(surveyformCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat surveyform
            let surveyformCreate = await Surveyform.create(surveyformCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create surveyform', surveyformCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    createmultisurveyform: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // Define schema for validation
            const schema = {
                field: { type: "string", min: 1 },
                status: { type: "number", optional: true },
                instansi_id: { type: "number", optional: true },
                desc: { type: "string", optional: true }
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
                // Create the surveyfrom object
                let surveyfromCreateObj = {
                    field: input.field,
                    desc: input.desc,
                    status: input.status ? Number(input.status) : null,
                    instansi_id: input.instansi_id !== undefined ? Number(input.instansi_id) : null
                };

                // Validate the object
                const validate = v.validate(surveyfromCreateObj, schema);
                if (validate.length > 0) {
                    errors.push({ input, errors: validate });
                    continue;
                }

                // Create surveyform in the database
                let surveyformCreate = await Surveyform.create(surveyfromCreateObj, { transaction });
                createdForms.push(surveyformCreate);
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

    //mendapatkan semua form berdasarkan dinas
    getsurveybydinas: async (req, res) => {
        try {
            const { instansiid } = req.params;

            let layananData = await Instansi.findOne({
                where: {
                    id: instansiid
                },
                attributes: ['name', 'slug', 'desc', 'image'],
                include: [
                    {
                        model: Surveyform,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        where: {
                            status: true
                        }
                    }
                ]
            });

            if (!layananData) {
                return res.status(404).json(response(404, 'Survey not found'));
            }

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'Success get survey', layananData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    getsurveybyidsurvey: async (req, res) => {
        try {
            const { idsurvey } = req.params;
    
            let surveyData = await Surveyform.findOne({
                where: {
                    id: idsurvey
                },
            });
    
            if (!surveyData) {
                return res.status(404).json(response(404, 'Survey not found'));
            }
    
            // Response using helper response.formatter
            res.status(200).json(response(200, 'Success get survey', surveyData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },    

    //mengupdate surveyform berdasarkan id
    updatesurveyform: async (req, res) => {
        try {
            //mendapatkan data surveyform untuk pengecekan
            let surveyformGet = await Surveyform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data surveyform ada
            if (!surveyformGet) {
                res.status(404).json(response(404, 'surveyform not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                desc: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
            }

            //buat object surveyform
            let surveyformUpdateObj = {
                desc: req.body.desc ?? undefined,
                field: req.body.field,
                status: Number(req.body.status)
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(surveyformUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update surveyform
            await Surveyform.update(surveyformUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data surveyform setelah update
            let surveyformAfterUpdate = await Surveyform.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update surveyform', surveyformAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    updatemultisurveyform: async (req, res) => {
        try {
            // Define schema for validation
            const schema = {
                field: { type: "string", min: 1 },
                desc: { type: "string", optional: true },
                status: { type: "number", optional: true },
                layanan_id: { type: "number", optional: true }
            };
    
            // Check if the request body is an array
            if (!Array.isArray(req.body)) {
                res.status(400).json(response(400, 'Request body must be an array of objects'));
                return;
            }
    
            // Initialize arrays for validation errors and successfully updated objects
            let errors = [];
            let updatedSurveyforms = [];
    
            // Validate and process each object in the input array
            for (let input of req.body) {
                // Check if the surveyform exists
                let surveyformGet = await Surveyform.findOne({
                    where: {
                        id: input.id
                    }
                });
    
                if (!surveyformGet) {
                    errors.push({ input, errors: ['surveyform not found'] });
                    continue;
                }
    
                // Create the surveyform update object
                let surveyformUpdateObj = {
                    id: input.id,
                    field: input.field,
                    desc: input.desc,
                    status: input.status !== undefined ? Number(input.status) : undefined,
                    layanan_id: input.layanan_id !== undefined ? Number(input.layanan_id) : undefined
                };
    
                // Filter out undefined values to avoid unnecessary updates
                surveyformUpdateObj = Object.fromEntries(Object.entries(surveyformUpdateObj).filter(([_, v]) => v !== undefined));
    
                // Validate the object
                const validate = v.validate(surveyformUpdateObj, schema);
                if (validate.length > 0) {
                    errors.push({ input, errors: validate });
                    continue;
                }
    
                // Update surveyform in the database
                await Surveyform.update(surveyformUpdateObj, {
                    where: {
                        id: input.id,
                    }
                });
    
                // Get the updated surveyform
                let surveyformAfterUpdate = await Surveyform.findOne({
                    where: {
                        id: input.id,
                    }
                });
    
                updatedSurveyforms.push(surveyformAfterUpdate);
            }
    
            // If there are validation errors, respond with them
            if (errors.length > 0) {
                res.status(400).json(response(400, 'Validation failed', errors));
                return;
            }
    
            // Respond with the successfully updated objects
            res.status(200).json(response(200, 'Successfully updated surveyforms', updatedSurveyforms));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.error(err);
        }
    },

    //menghapus surveyform berdasarkan id
    deletesurveyform: async (req, res) => {
        try {

            //mendapatkan data surveyform untuk pengecekan
            let surveyformGet = await Surveyform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data surveyform ada
            if (!surveyformGet) {
                res.status(404).json(response(404, 'surveyform not found'));
                return;
            }

            await Surveyform.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete surveyformGet'));

        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    },

}