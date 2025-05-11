const express = require("express");
const fs = require("fs");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

// =================== Transporter email ===================
// Configuration corrigée pour Infomaniak avec 2FA
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: true, // toujours true pour le port 465
  auth: {
    user: process.env.EMAIL_USER, // adresse email complète
    pass: process.env.EMAIL_PASS, // mot de passe d'application
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
});

// =================== AUTHENTIFICATION ===================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email.trim() === process.env.ADMIN_EMAIL &&
    password.trim() === process.env.ADMIN_PASSWORD
  ) {
    res.json({ success: true, message: "Connexion réussie !" });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Email ou mot de passe incorrect" });
  }
});

// =================== TEMPLATES ===================
router.get("/templates", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./data/templates.json"));
  res.json(data);
});

router.post("/templates", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const data = JSON.parse(fs.readFileSync("./data/templates.json"));
  const newItem = { id: Date.now().toString(), ...req.body };
  data.push(newItem);
  fs.writeFileSync("./data/templates.json", JSON.stringify(data, null, 2));
  res.json(newItem);
});

router.delete("/templates/:id", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const data = JSON.parse(fs.readFileSync("./data/templates.json"));
  const updated = data.filter((item) => item.id !== req.params.id);
  fs.writeFileSync("./data/templates.json", JSON.stringify(updated, null, 2));
  res.json({ success: true });
});

// =================== QUOTES ===================
router.get("/quotes", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./data/quotes.json"));
  res.json(data);
});

router.post("/quotes", async (req, res) => {
  const { name, email, service, message } = req.body;

  if (!name || !email || !service || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  // Save locally
  const data = JSON.parse(fs.readFileSync("./data/quotes.json"));
  const newQuote = { id: Date.now().toString(), name, email, service, message };
  data.push(newQuote);
  fs.writeFileSync("./data/quotes.json", JSON.stringify(data, null, 2));

  // Send email
  const mailOptions = {
    from: `"AELPROD Devis" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `Demande de devis - ${service}`,
    html: `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Service :</strong> ${service}</p>
      <p><strong>Message :</strong><br>${message}</p>
    `,
  };

  try {
    // Vérifier la connexion avant d'envoyer
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Devis envoyé et enregistré avec succès.",
    });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
  }
});

router.delete("/quotes/:id", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const data = JSON.parse(fs.readFileSync("./data/quotes.json"));
  const updated = data.filter((q) => q.id !== req.params.id);
  fs.writeFileSync("./data/quotes.json", JSON.stringify(updated, null, 2));
  res.json({ success: true });
});

// =================== COMMENTS ===================
router.get("/comments", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./data/comments.json"));
  res.json(data);
});

router.post("/comments", (req, res) => {
  const { name, text, rating } = req.body;

  if (!name || !text || !rating) {
    return res.status(400).json({ error: "Champs manquants." });
  }

  const data = JSON.parse(fs.readFileSync("./data/comments.json"));
  const newComment = { id: Date.now().toString(), name, text, rating };
  data.push(newComment);
  fs.writeFileSync("./data/comments.json", JSON.stringify(data, null, 2));
  res.json(newComment);
});

router.delete("/comments/:id", (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const data = JSON.parse(fs.readFileSync("./data/comments.json"));
  const updated = data.filter((c) => c.id !== req.params.id);
  fs.writeFileSync("./data/comments.json", JSON.stringify(updated, null, 2));
  res.json({ success: true });
});

module.exports = router;
