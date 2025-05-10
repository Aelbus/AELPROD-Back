const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route test email
router.post("/send-mail", async (req, res) => {
  const { name, email, service, message } = req.body;

  if (!name || !email || !service || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const mailOptions = {
    from: `"AELPROD Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `Nouveau devis : ${service}`,
    html: `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Service :</strong> ${service}</p>
      <p><strong>Message :</strong><br>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Email envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur d'envoi d'email :", error);
    res.status(500).json({ error: "Échec de l'envoi de l'email." });
  }
});

module.exports = router;
