const { response } = require('../helpers/response.formatter');

const { Layananforminput, Layananformnum, Layananform, Layanan, Instansi, Userinfo, Surveyformnum, sequelize } = require('../models');
require('dotenv').config()

const Validator = require("fastest-validator");
const v = new Validator();
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    //input form user
    inputform: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const folderPaths = {
                fileinput: "dir_mpp/file_pemohon",
            };

            const idlayanan = req.params.idlayanan;
            const iduser = data.role === "User" ? data.userId : req.body.userId;
            const statusinput = data.role === "User" ? 0 : 1;

            if (!iduser) {
                throw new Error('User ID is required');
            }

            const { datainput } = req.body;
            let { datafile } = req.body;

            let dataLayanan = await Layanan.findOne({
                where: {
                    id: idlayanan
                },
                attributes: ['id', 'code'],
            });

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

            const countToday = await Layananformnum.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(todayStr + 'T00:00:00Z'),
                        [Op.lte]: new Date(todayStr + 'T23:59:59Z')
                    },
                    layanan_id: idlayanan
                }
            });

            const urut = String(countToday + 1).padStart(4, '0'); // Menambah 1 pada count dan pad dengan '0' hingga 4 digit
            const tanggalFormat = today.toISOString().slice(2, 10).replace(/-/g, ''); // Format YYMMDD
            const noRequest = `${dataLayanan.code}-${tanggalFormat}-${urut}`;

            let layananID = {
                userinfo_id: Number(iduser),
                no_request: noRequest,
                layanan_id: Number(idlayanan),
                isonline: true,
                status: Number(statusinput)
            };

            const createdLayananformnum = await Layananformnum.create(layananID, { transaction });

            const updatedDatainput = datainput.map(item => ({
                ...item,
                layananformnum_id: createdLayananformnum.id
            }));

            const files = req.files;
            let fileUploadPromises = files.map(async (file) => {
                const { fieldname, mimetype, buffer, originalname } = file;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${folderPaths.fileinput}/${uniqueFilename}`,
                    Body: buffer,
                    ACL: 'public-read',
                    ContentType: mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);

                const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                // Extract index from fieldname (e.g., 'datafile[0][data]' -> 0)
                const index = parseInt(fieldname.match(/\d+/)[0], 10);
                datafile[index].data = fileUrl;
            });

            await Promise.all(fileUploadPromises);

            // Update datafile with layananformnum_id
            if (datafile) {
                datafile = datafile.map(item => ({
                    ...item,
                    layananformnum_id: createdLayananformnum.id
                }));
            }

            const createdLayananforminput = await Layananforminput.bulkCreate(updatedDatainput, { transaction });
            let createdLayananformfile
            if (datafile) {
                createdLayananformfile = await Layananforminput.bulkCreate(datafile, { transaction });
            }

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
            const idlayanannum = req.params.idlayanannum;

            // Fetch Layananformnum details
            let layananformnumData = await Layananformnum.findOne({
                where: {
                    id: idlayanannum
                },
                include: [
                    {
                        model: Layananforminput,
                        include: [{
                            model: Layananform,
                            attributes: { exclude: ['createdAt', 'updatedAt', "status"] },
                        }]
                    },
                    {
                        model: Userinfo,
                    },
                    {
                        model: Layanan,
                        attributes: ['id', 'name', 'desc'],
                        include: [{
                            model: Instansi,
                            attributes: ['id', 'name', 'desc'],
                        }]
                    }
                ]
            });

            if (!layananformnumData) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            // Format the Layananforminput data
            let formattedInputData = layananformnumData?.Layananforminputs?.map(datafilter => {
                let data_key = null;

                if (datafilter?.Layananform?.tipedata === 'radio' && datafilter?.Layananform?.datajson) {
                    const selectedOption = datafilter?.Layananform?.datajson.find(option => option?.id == datafilter?.data);
                    if (selectedOption) {
                        data_key = selectedOption?.key;
                    }
                }

                if (datafilter?.Layananform?.tipedata === 'checkbox' && datafilter?.Layananform?.datajson) {
                    const selectedOptions = JSON.parse(datafilter?.data);
                    data_key = selectedOptions.map(selectedId => {
                        const option = datafilter?.Layananform?.datajson.find(option => option?.id == selectedId);
                        return option ? option.key : null;
                    }).filter(key => key !== null);
                }

                return {
                    id: datafilter?.id,
                    data: datafilter?.data,
                    layananform_id: datafilter?.layananform_id,
                    layananformnum_id: datafilter?.layananformnum_id,
                    layananform_name: datafilter?.Layananform?.field,
                    layananform_datajson: datafilter?.Layananform?.datajson,
                    layananform_tipedata: datafilter?.Layananform?.tipedata,
                    data_key: data_key ?? null
                };
            });

            // Embed the formatted Layananforminput data into the Layananformnum data
            let result = {
                id: layananformnumData?.id,
                no_request: layananformnumData?.no_request,
                layanan_id: layananformnumData?.layanan_id,
                layanan: layananformnumData?.Layanan,
                tgl_selesai: layananformnumData?.tgl_selesai,
                userinfo_id: layananformnumData?.userinfo_id,
                userinfo: layananformnumData?.Userinfo,
                createdAt: layananformnumData?.createdAt,
                updatedAt: layananformnumData?.updatedAt,
                Layananforminputs: formattedInputData ?? null,
                status: layananformnumData?.status,
                fileoutput: layananformnumData?.fileoutput
            };

            res.status(200).json(response(200, 'success get data', result));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    updatedata: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { datainput, status } = req.body;
            const idlayanannum = req.params.idlayanannum;

            // Update data entries
            let updateDataPromises = [];
            if (datainput && Array.isArray(datainput)) {
                updateDataPromises = datainput.map(item =>
                    Layananforminput.update(
                        { data: item.data, layananform_id: item.layananform_id },
                        { where: { id: item.id, layananformnum_id: idlayanannum }, transaction }
                    ).catch(err => {
                        console.error('Error updating data:', err);
                        return null; // Return null or any other value you prefer in case of an error
                    })
                );
            }

            const files = req.files;
            const folderPath = { fileinput: "dir_mpp/file_pemohon" };

            let fileUpdatePromises = files.map(async (file) => {
                const { fieldname, mimetype, buffer, originalname } = file;
                const base64 = Buffer.from(buffer).toString('base64');
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${folderPath}/${uniqueFilename}`,
                    Body: buffer,
                    ACL: 'public-read',
                    ContentType: mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);

                const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                // Extract index from fieldname (e.g., 'datafile[0][data]' -> 0)
                const index = parseInt(fieldname.match(/\d+/)[0], 10);

                // Assuming datafile[index].id is available in req.body to identify the correct record
                await Layananforminput.update(
                    { data: fileUrl },
                    { where: { id: req.body.datafile[index].id, layananformnum_id: idlayanannum }, transaction }
                );
            });

            Layananformnum.update(
                { status: status },
                { where: { id: idlayanannum }, transaction }
            );

            console.log("asddasdasasd", status)
            await Promise.all([...updateDataPromises, ...fileUpdatePromises]);

            await transaction.commit();
            res.status(200).json(response(200, 'Success update layananforminput'));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    updatestatuspengajuan: async (req, res) => {
        try {

            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Layananformnum.findOne({
                where: {
                    id: req.params.idlayanannum
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                status: {
                    type: "number"
                },
                pesan: {
                    type: "string",
                    optional: true
                }
            }

            //buat object layanan
            let layananUpdateObj = {
                status: Number(req.body.status),
                pesan: req.body.pesan,
            }

            if (layananUpdateObj.status === 3) {
                layananUpdateObj.tgl_selesai = Date.now();
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layanan
            await Layananformnum.update(layananUpdateObj, {
                where: {
                    id: req.params.idlayanannum,
                }
            })

            //mendapatkan data layanan setelah update
            let layananAfterUpdate = await Layananformnum.findOne({
                where: {
                    id: req.params.idlayanannum,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update layanan', layananAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //upload surat hasil permohonan
    uploadfilehasil: async (req, res) => {
        try {

            let dataGet = await Layananformnum.findOne({
                where: {
                    id: req.params.idlayanannum
                }
            })

            if (!dataGet) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                fileoutput: { type: "string", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/fileoutput/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);

                dataKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object instansi
            let fileUpdateObj = {
                fileoutput: req.file ? dataKey : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(fileUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update instansi
            await Layananformnum.update(fileUpdateObj, {
                where: {
                    id: req.params.idlayanannum,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //get history input form user
    gethistoryformuser: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const status = req.query.status ?? null;
            const range = req.query.range;
            const isonline = req.query.isonline ?? null;
            const userinfo_id = data.role === "User" ? data.userId : null;
            const instansi_id = Number(req.query.instansi_id);
            const layanan_id = Number(req.query.layanan_id);
            const start_date = req.query.start_date;
            let end_date = req.query.end_date;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let history;
            let totalCount;

            const WhereClause = {};
            const WhereClause2 = {};
            const WhereClause3 = {};

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                WhereClause2.instansi_id = data.instansi_id;
            }

            if (data.role === 'Admin Layanan') {
                WhereClause.layanan_id = data.layanan_id;
            }

            if (range == 'today') {
                WhereClause.createdAt = {
                    [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()]
                };
            }

            if (isonline) {
                WhereClause.isonline = isonline;
            }
            if (userinfo_id) {
                WhereClause.userinfo_id = userinfo_id;
            }
            if (status) {
                WhereClause.status = status;
            }
            if (layanan_id) {
                WhereClause.layanan_id = layanan_id;
            }

            if (start_date && end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.lte]: new Date(end_date)
                };
            }

            if (instansi_id) {
                WhereClause2.instansi_id = instansi_id;
            }

            if (search) {
                WhereClause3.name = {
                    [Op.iLike]: `%${search}%`
                };
            }

            [history, totalCount] = await Promise.all([
                Layananformnum.findAll({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                            include: [{
                                model: Instansi,
                                attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                            }],
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            attributes: ['name', 'nik'],
                            where: WhereClause3,
                        }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']]
                }),
                Layananformnum.count({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            where: WhereClause3,
                        }
                    ],
                })
            ]);

            let formattedData = history.map(data => {
                return {
                    id: data.id,
                    userinfo_id: data?.userinfo_id,
                    name: data?.Userinfo?.name,
                    nik: data?.Userinfo?.nik,
                    pesan: data?.pesan,
                    status: data?.status,
                    tgl_selesai: data?.tgl_selesai,
                    isonline: data?.isonline,
                    layanan_id: data?.layanan_id,
                    layanan_name: data?.Layanan ? data?.Layanan?.name : null,
                    layanan_image: data?.Layanan ? data?.Layanan?.image : null,
                    instansi_id: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.id : null,
                    instansi_name: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.name : null,
                    instansi_image: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.image : null,
                    createdAt: data?.createdAt,
                    updatedAt: data?.updatedAt,
                    fileoutput: data?.fileoutput,
                    no_request: data?.no_request,
                };
            });

            const pagination = generatePagination(totalCount, page, limit, `/api/user/historyform`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedData,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    gethistorydokumen: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const status = req.query.status ?? null;
            const range = req.query.range;
            const isonline = req.query.isonline ?? null;
            let userinfo_id;
            if(data.role === "User") {
                userinfo_id = data.userId
            } else {
                userinfo_id = req.query.userId
            }
         
            const instansi_id = Number(req.query.instansi_id);
            const layanan_id = Number(req.query.layanan_id);
            const start_date = req.query.start_date;
            let end_date = req.query.end_date;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let history;
            let totalCount;
    
            const WhereClause = {};
            const WhereClause2 = {};
            const WhereClause3 = {};
    
            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                WhereClause2.instansi_id = data.instansi_id;
            }
    
            if (data.role === 'Admin Layanan') {
                WhereClause.layanan_id = data.layanan_id;
            }
    
            WhereClause.status = 3;
    
            if (range == 'today') {
                WhereClause.createdAt = {
                    [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()]
                };
            }
    
            if (isonline) {
                WhereClause.isonline = isonline;
            }
            if (userinfo_id) {
                WhereClause.userinfo_id = userinfo_id;
            }
            if (status) {
                WhereClause.status = status;
            }
            if (layanan_id) {
                WhereClause.layanan_id = layanan_id;
            }
    
            if (start_date && end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.lte]: new Date(end_date)
                };
            }
    
            if (instansi_id) {
                WhereClause2.instansi_id = instansi_id;
            }
    
            if (search) {
                WhereClause3.name = {
                    [Op.iLike]: `%${search}%`
                };
            }
    
            [history, totalCount] = await Promise.all([
                Layananformnum.findAll({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            attributes: ['name', 'image', "id"],
                            include: [{
                                model: Instansi,
                                attributes: ['name', 'image', "id"] ,
                            }],
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            attributes: ['name', 'nik'],
                            where: WhereClause3,
                        }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']]
                }),
                Layananformnum.count({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            where: WhereClause3,
                        }
                    ],
                })
            ]);
    
            // Restructure the data to show Instansi first
            let instansiMap = {};
    
            history.forEach(data => {
                const instansiId = data?.Layanan?.Instansi?.id;
                const instansiName = data?.Layanan?.Instansi?.name;
                const instansiImage = data?.Layanan?.Instansi?.image;
    
                if (!instansiMap[instansiId]) {
                    instansiMap[instansiId] = {
                        instansi_id: instansiId,
                        instansi_name: instansiName,
                        instansi_image: instansiImage,
                        dokumen: []
                    };
                }
    
                instansiMap[instansiId].dokumen.push({
                    id: data.id,
                    userinfo_id: data?.userinfo_id,
                    tgl_selesai: data?.tgl_selesai,
                    layanan_name: data?.Layanan ? data?.Layanan?.name : null,
                    createdAt: data?.createdAt,
                    updatedAt: data?.updatedAt,
                    fileoutput: data?.fileoutput,
                    no_request: data?.no_request,
                });
            });
    
            const formattedData = Object.values(instansiMap);
    
            const pagination = generatePagination(totalCount, page, limit, `/api/user/historyform`);
    
            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedData,
                pagination: pagination
            });
    
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },
    

    gethistorybyid: async (req, res) => {
        try {

            let Layananformnumget = await Layananformnum.findOne({
                where: {
                    id: req.params.idforminput
                },
                include: [
                    {
                        model: Layanan,
                        attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                        include: [{
                            model: Instansi,
                            attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                        }],
                    },
                    {
                        model: Userinfo,
                        attributes: ['name'],
                    }
                ],
            });

            if (!Layananformnumget) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            let surveyGet = await Surveyformnum.findOne({
                where: {
                    userinfo_id: Layananformnumget.userinfo_id,
                    layanan_id: Layananformnumget.layanan_id
                },
            });

            let formattedData = {
                id: Layananformnumget?.id,
                userinfo_id: Layananformnumget?.userinfo_id,
                name: Layananformnumget?.Userinfo ? Layananformnumget?.Userinfo?.name : null,
                status: Layananformnumget?.status,
                pesan: Layananformnumget?.pesan,
                tgl_selesai: data?.tgl_selesai,
                layanan_id: Layananformnumget?.layanan_id,
                layanan_name: Layananformnumget?.Layanan ? Layananformnumget?.Layanan?.name : null,
                layanan_image: Layananformnumget?.Layanan ? Layananformnumget?.Layanan?.image : null,
                instansi_id: Layananformnumget?.Layanan && Layananformnumget?.Layanan?.Instansi ? Layananformnumget?.Layanan?.Instansi.id : null,
                instansi_name: Layananformnumget?.Layanan && Layananformnumget?.Layanan?.Instansi ? Layananformnumget?.Layanan?.Instansi.name : null,
                instansi_image: Layananformnumget?.Layanan && Layananformnumget?.Layanan?.Instansi ? Layananformnumget?.Layanan?.Instansi.image : null,
                createdAt: Layananformnumget?.createdAt,
                updatedAt: Layananformnumget?.updatedAt,
                fileoutput: Layananformnumget?.fileoutput,
                input_skm: surveyGet ? true : false,
                no_request: Layananformnumget?.no_request,
            };

            res.status(200).json(response(200, 'success get', formattedData));

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

}