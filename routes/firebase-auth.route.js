// const express = require("express");
// const admin = require("firebase-admin"); // Firebase Admin SDK
// const jwt = require("jsonwebtoken"); // Library untuk membuat JWT
// const router = express.Router();

// // Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(require("../config/accountKey.json")), // Masukkan path service account
// });

// // Route untuk login menggunakan Firebase
// router.post("/auth/firebase-login", async (req, res) => {
//   const { token } = req.body; // Firebase ID token yang dikirim dari frontend

//   try {
//     // Verifikasi Firebase ID Token
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     const uid = decodedToken.uid;
//     const email = decodedToken.email;

//     // Cek apakah pengguna sudah ada di database, atau buat pengguna baru
//     let user = await findUserByEmail(email); // Fungsi ini harus Anda sesuaikan dengan sistem Anda
//     if (!user) {
//       user = await createUser(uid, email); // Buat user baru jika tidak ditemukan
//     }

//     // Buat JWT untuk diberikan ke frontend
//     const jwtToken = jwt.sign(
//       { uid: user.uid, email: user.email },
//       process.env.AUTH_SECRET,
//       {
//         expiresIn: 864000, // Masa berlaku token
//       }
//     );

//     res.status(200).send({ token: jwtToken });
//   } catch (error) {
//     console.error("Error verifying Firebase token:", error);
//     res.status(403).send({ message: "Invalid Firebase Token" });
//   }
// });

// module.exports = router;
