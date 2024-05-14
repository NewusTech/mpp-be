//kode dari file Blog.controller.js

const { response } = require('../helpers/response.formatter');

const { Blog, Kategoriblog, Tagblog, User } = require('../models');

const slugify = require('slugify');
const Validator = require("fastest-validator");
const fs = require('fs');
const path = require('path');
const v = new Validator();

module.exports = {

    //membuat blog
    createblog: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                },
                keyword: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                excerpt: {
                    type: "string",
                    optional: true
                },
                body: {
                    type: "string",
                    min: 3,
                },
                kategoriblog_id: {
                    type: "number",
                    optional: true
                },
                tagblog_id: {
                    type: "number",
                    optional: true
                },
                publishAt: {
                    type: "date",
                    convert: true,
                    optional: true
                },
                image: {
                    type: "string",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                }
            }

            //buat object blog
            let blogCreateObj = {
                title: req.body.title,
                slug: slugify(req.body.title, { lower: true }),
                keyword: req.body.keyword,
                excerpt: req.body.excerpt,
                body: req.body.body,
                kategoriblog_id: Number(req.body.kategoriblog_id),
                tagblog_id: Number(req.body.tagblog_id),
                user_id: data.userId,
                publishAt: req.body.publishAt,
                image: req.file ? 'uploads/blog/' + req.file?.filename : null,
                status: Number(req.body.status),
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(blogCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat blog
            let blogCreate = await Blog.create(blogCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create kategori blog', blogCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data blog
    getblog: async (req, res) => {
        try {
            //mendapatkan data semua blog
            let blogGets = await Blog.findAll({
                include: [
                    {
                        model: Kategoriblog,
                        attributes: ['title', 'id'],
                        as: 'Kategoriblog' 
                    },
                    {
                        model: Tagblog,
                        attributes: ['title', 'id'], 
                        as: 'Tagblog'
                    },
                    {
                        model: User,
                        attributes: ['name', 'id'], 
                        as: 'User'
                    }
                ],
                attributes: { exclude: ['kategoriblog_id', 'tagblog_id', 'user_id'] }
            });

            let formattedBlogs = blogGets.map(blog => {
                return {
                    id: blog.id,
                    title: blog.title,
                    slug: blog.slug,
                    keyword: blog.keyword,
                    excerpt: blog.excerpt,
                    body: blog.body,
                    kategoriblog_id: blog.Kategoriblog?.id, // Menggunakan operator ?. untuk memeriksa keberadaan Kategoriblog
                    kategoriblog_title: blog.Kategoriblog?.title,
                    tagblog_id: blog.Tagblog?.id, // Menggunakan operator ?. untuk memeriksa keberadaan Tagblog
                    tagblog_title: blog.Tagblog?.title,
                    user_id: blog.User?.id, // Menggunakan operator ?. untuk memeriksa keberadaan User
                    user_title: blog.User?.name,
                    image: blog.image,
                    status: blog.status,
                    status_desc: blog.status === false ? "Draft" : "Published",
                    publishAt: blog.publishAt,
                    createdAt: blog.createdAt,
                    updatedAt: blog.updatedAt
                };
            });

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get blog', formattedBlogs));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data blog berdasarkan id
    getblogById: async (req, res) => {
        try {
            //mendapatkan data blog berdasarkan id
            let blogGet = await Blog.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    {
                        model: Kategoriblog,
                        attributes: ['title', 'id'],
                        as: 'Kategoriblog' 
                    },
                    {
                        model: Tagblog,
                        attributes: ['title', 'id'], 
                        as: 'Tagblog'
                    },
                    {
                        model: User,
                        attributes: ['name', 'id'], 
                        as: 'User'
                    }
                ],
                attributes: { exclude: ['kategoriblog_id', 'tagblog_id', 'user_id'] }
            });

            //cek jika blog tidak ada
            if (!blogGet) {
                res.status(404).json(response(404, 'blog not found'));
                return;
            }

            let formattedBlog = {
                id: blogGet.id,
                title: blogGet.title,
                slug: blogGet.slug,
                keyword: blogGet.keyword,
                excerpt: blogGet.excerpt,
                body: blogGet.body,
                kategoriblog_id: blogGet.Kategoriblog?.id, 
                kategoriblog_title: blogGet.Kategoriblog?.title,
                tagblog_id: blogGet.Tagblog?.id, 
                tagblog_title: blogGet.Tagblog?.title,
                user_id: blogGet.User?.id, 
                user_title: blogGet.User?.name,
                image: blogGet.image,
                status: blogGet.status,
                status_desc: blogGet.status === false ? "Draft" : "Published",
                publishAt: blogGet.publishAt,
                createdAt: blogGet.createdAt,
                updatedAt: blogGet.updatedAt
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get blog by id', formattedBlog));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate blog berdasarkan id
    updateblog: async (req, res) => {
        try {
            //mendapatkan data blog untuk pengecekan
            let blogGet = await Blog.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data blog ada
            if (!blogGet) {
                res.status(404).json(response(404, 'blog not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                },
                keyword: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                excerpt: {
                    type: "string",
                    optional: true
                },
                body: {
                    type: "string",
                    min: 3,
                },
                kategoriblog_id: {
                    type: "number",
                    optional: true
                },
                tagblog_id: {
                    type: "number",
                    optional: true
                },
                publishAt: {
                    type: "date",
                    convert: true,
                    optional: true
                },
                image: {
                    type: "string",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                }
            }

            //buat object blog
            let blogUpdateObj = {
                title: req.body.title,
                slug: slugify(req.body.title, { lower: true }),
                keyword: req.body.keyword,
                excerpt: req.body.excerpt,
                body: req.body.body,
                kategoriblog_id: Number(req.body.kategoriblog_id),
                tagblog_id: Number(req.body.tagblog_id),
                publishAt: req.body.publishAt,
                image: req.file ? 'uploads/blog/' + req.file?.filename : null,
                status: Number(req.body.status),
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(blogUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update blog
            await Blog.update(blogUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data blog setelah update
            let blogAfterUpdate = await Blog.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update blog', blogAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus blog berdasarkan id
    deleteblog: async (req, res) => {
        try {

            //mendapatkan data blog untuk pengecekan
            let blogGet = await Blog.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data blog ada
            if (!blogGet) {
                res.status(404).json(response(404, 'blog not found'));
                return;
            }

             // Hapus gambar terkait jika ada
            if (blogGet.image) {
                // Mendapatkan path lengkap ke gambar
                const imagePath = path.join(__dirname, '..', blogGet.image);
                
                // Hapus gambar dari sistem file
                fs.unlinkSync(imagePath);
            }

            await Blog.destroy({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success delete blog'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}