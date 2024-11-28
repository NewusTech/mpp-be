const { response } = require("../helpers/response.formatter");
const {
  Instansi,
  Layanan,
  Layanansertif,
  Layananformnum,
  Userinfo,
  sequelize,
} = require("../models");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {
  get: async (req, res) => {
    try {
      let layanan = await Layanan.findOne({
        where: {
          id: req.params.idlayanan,
        },
        attributes: ["id", "name"],
        include: [
          {
            model: Instansi,
            attributes: [
              "id",
              "name",
              "alamat",
              "image",
              "pj",
              "nip_pj",
              "gelar",
              "jabatan",
            ],
          },
          {
            model: Layanansertif,
          },
        ],
      });
      if (!layanan) {
        return res.status(404).send("Data tidak ditemukan");
      }

      res.status(200).json(response(200, "success get data", layanan));
    } catch (err) {
      res.status(500).json(response(500, "internal server error", err));
      console.log(err);
    }
  },

  //untuk admin
  getsertif: async (req, res) => {
    try {
      let layanan = await Layanan.findOne({
        where: {
          id: req.params.idlayanan,
        },
        attributes: ["id", "name"],
        include: [
          {
            model: Instansi,
            attributes: [
              "id",
              "name",
              "alamat",
              "image",
              "pj",
              "nip_pj",
              "gelar",
              "jabatan",
            ],
          },
          {
            model: Layanansertif,
          },
        ],
      });

      const idforminput = req.params.idforminput ?? null;

      let getdatauser;

      if (idforminput) {
        getdatauser = await Layananformnum.findOne({
          where: {
            id: idforminput,
          },
          attributes: ["id", "userinfo_id"],
          include: [
            {
              model: Userinfo,
              attributes: [
                "id",
                "name",
                "alamat",
                "nik",
                "telepon",
                "tempat_lahir",
                "tgl_lahir",
              ],
            },
          ],
        });
      }

      if (!layanan) {
        return res.status(404).send("Data tidak ditemukan");
      }

      // Read HTML template
      const templatePath = path.resolve(
        __dirname,
        "../views/templatesertif.html"
      );
      let htmlContent = fs.readFileSync(templatePath, "utf8");

      // Replace placeholders with actual data
      const instansiImage = layanan.Instansi.image || "";
      const tanggalInfo = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      htmlContent = htmlContent.replace("{{instansiImage}}", instansiImage);
      htmlContent = htmlContent.replace(
        "{{instansiName}}",
        layanan.Instansi.name ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{instansiAlamat}}",
        layanan.Instansi.alamat ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{layananHeader}}",
        layanan.Layanansertif?.header ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{layananBody}}",
        layanan.Layanansertif?.body ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{layananFooter}}",
        layanan.Layanansertif?.footer ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{layanannomor}}",
        layanan.Layanansertif?.nomor ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{layanantembusan}}",
        layanan.Layanansertif?.tembusan
          ? `Tembusan =  ${layanan.Layanansertif?.tembusan}`
          : ""
      );
      htmlContent = htmlContent.replace(
        "{{layananperihal}}",
        layanan.Layanansertif?.perihal ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{layanancatatan}}",
        layanan.Layanansertif?.catatan
          ? `Catatan =  ${layanan.Layanansertif?.catatan}`
          : ""
      );
      htmlContent = htmlContent.replace("{{tanggalInfo}}", tanggalInfo);

      htmlContent = htmlContent.replace(
        "{{nama}}",
        getdatauser?.Userinfo?.name ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{nik}}",
        getdatauser?.Userinfo?.nik ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{tempat}}",
        getdatauser?.Userinfo?.tempat_lahir ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{tgl_lahir}}",
        getdatauser?.Userinfo?.tgl_lahir
          ? new Date(getdatauser?.Userinfo?.tgl_lahir).toLocaleDateString(
              "id-ID",
              { day: "2-digit", month: "long", year: "numeric" }
            )
          : ""
      );
      htmlContent = htmlContent.replace(
        "{{alamat}}",
        getdatauser?.Userinfo?.alamat ?? ""
      );
      htmlContent = htmlContent.replace(
        "{{nama_pj}}",
        layanan?.Instansi?.pj ?? "Fullan"
      );
      htmlContent = htmlContent.replace(
        "{{nip_pj}}",
        layanan?.Instansi?.nip_pj ?? "1234567890"
      );
      htmlContent = htmlContent.replace(
        "{{gelar}}",
        layanan?.Instansi?.gelar ?? "S.Kom"
      );
      htmlContent = htmlContent.replace(
        "{{jabatan}}",
        layanan?.Instansi?.jabatan ?? "Kabag"
      );

      // Launch Puppeteer with increased timeout
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        timeout: 60000, // Increase timeout to 60 seconds
      });
      const page = await browser.newPage();

      // Set HTML content and wait until all resources are loaded
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      // If an image URL is provided, wait for it to load
      if (instansiImage) {
        await page.waitForSelector("img.logo", { timeout: 60000 });
      }

      // Generate PDF with 3 cm margins
      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "1.16in", // 3 cm
          right: "1.16in", // 3 cm
          bottom: "1.16in", // 3 cm
          left: "1.16in", // 3 cm
        },
      });

      await browser.close();

      // Generate filename with current date and time
      const currentDate = new Date().toISOString().replace(/:/g, "-");
      const filename = `laporan-${currentDate}.pdf`;

      // Set response headers and send the PDF buffer
      res.setHeader(
        "Content-disposition",
        'attachment; filename="' + filename + '"'
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500).json(response(500, "internal server error", err));
      console.log(err);
    }
  },

  editinfosertif: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      // mendapatkan data layanan untuk pengecekan
      let layananGet = await Layanan.findOne({
        where: {
          id: req.params.idlayanan,
        },
        include: [{ model: Instansi }, { model: Layanansertif }],
        transaction,
      });

      // cek apakah data layanan ada
      if (!layananGet) {
        await transaction.rollback();
        return res.status(404).json(response(404, "layanan not found"));
      }

      // membuat schema untuk validasi
      const schema = {
        instansi_pj: { type: "string", optional: true },
        nip_pj: { type: "string", optional: true },
        gelar: { type: "string", optional: true },
        jabatan: { type: "string", optional: true },
        header: { type: "string", optional: true },
        body: { type: "string", optional: true },
        footer: { type: "string", optional: true },
        nomor: { type: "string", optional: true },
        perihal: { type: "string", optional: true },
        catatan: { type: "string", optional: true },
        tembusan: { type: "string", optional: true },
      };

      // buat object layanan
      let layananUpdateObj = {
        instansi_pj: req.body.instansi_pj,
        nip_pj: req.body.nip_pj,
        gelar: req.body.gelar,
        jabatan: req.body.jabatan,
        header: req.body.header,
        body: req.body.body,
        footer: req.body.footer,
        nomor: req.body.nomor,
        perihal: req.body.perihal,
        catatan: req.body.catatan,
        tembusan: req.body.tembusan,
      };

      // validasi menggunakan module fastest-validator
      const validate = v.validate(layananUpdateObj, schema);
      if (validate.length > 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json(response(400, "validation failed", validate));
      }

      // update instansi
      if (layananUpdateObj.instansi_pj) {
        await Instansi.update(
          {
            pj: layananUpdateObj.instansi_pj,
            nip_pj: layananUpdateObj.nip_pj,
            gelar: layananUpdateObj.gelar,
            jabatan: layananUpdateObj.jabatan,
          },
          {
            where: { id: layananGet.Instansi.id },
            transaction,
          }
        );
      }

      // first or create layanansertif
      if (
        layananUpdateObj.header ||
        layananUpdateObj.body ||
        layananUpdateObj.footer ||
        layananUpdateObj.nomor ||
        layananUpdateObj.catatan ||
        layananUpdateObj.tembusan ||
        layananUpdateObj.perihal ||
        layananUpdateObj.gelar ||
        layananUpdateObj.jabatan
      ) {
        let layanansertifUpdateObj = {};
        if (layananUpdateObj.header)
          layanansertifUpdateObj.header = layananUpdateObj.header;
        if (layananUpdateObj.body)
          layanansertifUpdateObj.body = layananUpdateObj.body;
        if (layananUpdateObj.footer)
          layanansertifUpdateObj.footer = layananUpdateObj.footer;
        if (layananUpdateObj.nomor)
          layanansertifUpdateObj.nomor = layananUpdateObj.nomor;
        if (layananUpdateObj.catatan)
          layanansertifUpdateObj.catatan = layananUpdateObj.catatan;
        if (layananUpdateObj.tembusan)
          layanansertifUpdateObj.tembusan = layananUpdateObj.tembusan;
        if (layananUpdateObj.perihal)
          layanansertifUpdateObj.perihal = layananUpdateObj.perihal;
        if (layananUpdateObj.gelar)
          layanansuratUpdateObj.gelar = layananUpdateObj.gelar;
        if (layananUpdateObj.jabatan)
          layanansuratUpdateObj.jabatan = layananUpdateObj.jabatan;

        let [layanansertif, created] = await Layanansertif.findOrCreate({
          where: { layanan_id: layananGet.id },
          defaults: layanansertifUpdateObj,
          transaction,
        });

        if (!created) {
          await Layanansertif.update(layanansertifUpdateObj, {
            where: { layanan_id: layananGet.id },
            transaction,
          });
        }
      }

      await transaction.commit();

      res.status(200).json(response(200, "success update layanan"));
    } catch (err) {
      await transaction.rollback();
      res.status(500).json(response(500, "internal server error", err));
      console.log(err);
    }
  },
};
