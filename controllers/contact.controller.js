const { response } = require('../helpers/response.formatter');

const { Contact } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan data contact berdasarkan id
    getcontact: async (req, res) => {
        try {
            //mendapatkan data contact berdasarkan id
            let contactGet = await Contact.findOne();

            //cek jika contact tidak ada
            if (!contactGet) {
                res.status(404).json(response(404, 'contact not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get contact by id', contactGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate contact berdasarkan id
    updatecontact: async (req, res) => {
        try {
            //mendapatkan data contact untuk pengecekan
            let contactGet = await Contact.findOne()

            //cek apakah data contact ada
            if (!contactGet) {
                res.status(404).json(response(404, 'contact not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                alamat: { type: "string", min: 3, optional: true },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
                telp: { type: "string", min: 7, max: 15, optional: true },
                latitude: { type: "string", min: 3, optional: true },
                longitude: { type: "string", min: 3, optional: true },
            }

            //buat object contact
            let contactUpdateObj = {
                alamat: req.body.alamat,
                telp: req.body.telp,
                email: req.body.email,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(contactUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update contact
            await Contact.update(contactUpdateObj, {
                where: {
                  id: contactGet.id,
                },
              });

            //mendapatkan data contact setelah update
            let contactAfterUpdate = await Contact.findOne()

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update contact', contactAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}