const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

let quotes = [];
let templates = [];
let comments = [];

// GET quotes
router.get("/quotes", (req, res) => {
  res.json(quotes);
});

// POST quote (demande de devis)
router.post("/quotes", (req, res) => {
  const { name, email, service, message } = req.body;
  if (!name || !email || !service || !message) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const selectedTemplate = templates.find((t) => t.name === service);
  const price = selectedTemplate ? selectedTemplate.price : "Sur devis";

  const newQuote = {
    id: Date.now(),
    name,
    email,
    service,
    price,
    message,
  };
  quotes.push(newQuote);

  sendQuoteEmail(newQuote).catch(console.error);

  res.status(201).json(newQuote);
});

// DELETE quote
router.delete("/quotes/:id", (req, res) => {
  const id = Number(req.params.id);
  quotes = quotes.filter((q) => q.id !== id);
  res.json({ success: true });
});

// GET templates
router.get("/templates", (req, res) => {
  res.json(templates);
});

// POST template
router.post("/templates", (req, res) => {
  const { name, price, description } = req.body;
  const newTemplate = {
    id: Date.now(),
    name,
    price,
    description,
  };
  templates.push(newTemplate);
  res.status(201).json(newTemplate);
});

// DELETE template
router.delete("/templates/:id", (req, res) => {
  const id = Number(req.params.id);
  templates = templates.filter((t) => t.id !== id);
  res.json({ success: true });
});

// GET comments
router.get("/comments", (req, res) => {
  res.json(comments);
});

// POST comment
router.post("/comments", (req, res) => {
  const { name, text, rating } = req.body;
  if (!name || !text || !rating) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  const newComment = {
    id: Date.now(),
    name,
    text,
    rating,
  };
  comments.push(newComment);
  sendCommentEmail(newComment).catch(console.error);
  res.status(201).json(newComment);
});

// DELETE comment
router.delete("/comments/:id", (req, res) => {
  const id = Number(req.params.id);
  comments = comments.filter((c) => c.id !== id);
  res.json({ success: true });
});

// Nodemailer for quotes
async function sendQuoteEmail(quote) {
  const transporter = nodemailer.createTransport({
    host: "mail.infomaniak.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <h2>Nouvelle demande de devis</h2>
    <p><strong>Nom:</strong> ${quote.name}</p>
    <p><strong>Email:</strong> ${quote.email}</p>
    <p><strong>Service:</strong> ${quote.service}</p>
    <p><strong>Prix estimé:</strong> ${quote.price}</p>
    <p><strong>Message:</strong> ${quote.message}</p>
  `;

  await transporter.sendMail({
    from: `"AELPROD" <${process.env.SMTP_USER}>`,
    to: "contact@aelprod.com",
    subject: "Nouvelle demande de devis AELPROD",
    html: htmlContent,
  });

  console.log("✅ Email devis envoyé à contact@aelprod.com");
}

// Nodemailer for comments
async function sendCommentEmail(comment) {
  const transporter = nodemailer.createTransport({
    host: "mail.infomaniak.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <h2>Nouveau commentaire reçu</h2>
    <p><strong>Nom:</strong> ${comment.name}</p>
    <p><strong>Commentaire:</strong> ${comment.text}</p>
    <p><strong>Note:</strong> ${comment.rating} ★</p>
  `;

  await transporter.sendMail({
    from: `"AELPROD" <${process.env.SMTP_USER}>`,
    to: "contact@aelprod.com",
    subject: "Nouveau commentaire AELPROD",
    html: htmlContent,
  });

  console.log("✅ Email commentaire envoyé à contact@aelprod.com");
}

module.exports = router;
