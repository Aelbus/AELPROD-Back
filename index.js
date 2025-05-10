require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");

const adminRoutes = require("./routes/admin");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://aelprod.com"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use("/api", adminRoutes);

// ======================= CONTACT ROUTE =======================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `Nouveau message de ${name}`,
    text: `Email: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);

    const quotes = JSON.parse(fs.readFileSync("./data/quotes.json"));
    quotes.push({
      id: Date.now().toString(),
      name,
      email,
      message,
    });
    fs.writeFileSync("./data/quotes.json", JSON.stringify(quotes, null, 2));

    res.json({ success: true, message: "Message envoyé avec succès !" });
  } catch (err) {
    console.error("Erreur envoi mail:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.toString(),
    });
  }
});

// ======================= LOGIN ROUTE =======================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (email.trim() === adminEmail && password.trim() === adminPassword) {
    res.json({ success: true, message: "Connexion réussie !" });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Email ou mot de passe incorrect" });
  }
});

// ======================= TEMPLATES ROUTES =======================
app.get("/api/templates", (req, res) => {
  const templates = JSON.parse(fs.readFileSync("./data/templates.json"));
  res.json(templates);
});

app.post("/api/templates", (req, res) => {
  const templates = JSON.parse(fs.readFileSync("./data/templates.json"));
  const newTemplate = { id: Date.now().toString(), ...req.body };
  templates.push(newTemplate);
  fs.writeFileSync("./data/templates.json", JSON.stringify(templates, null, 2));
  res.json(newTemplate);
});

app.delete("/api/templates/:id", (req, res) => {
  const templates = JSON.parse(fs.readFileSync("./data/templates.json"));
  const updatedTemplates = templates.filter((t) => t.id !== req.params.id);
  fs.writeFileSync(
    "./data/templates.json",
    JSON.stringify(updatedTemplates, null, 2)
  );
  res.json({ success: true });
});

// ======================= QUOTES ROUTES =======================
app.get("/api/quotes", (req, res) => {
  const quotes = JSON.parse(fs.readFileSync("./data/quotes.json"));
  res.json(quotes);
});

app.delete("/api/quotes/:id", (req, res) => {
  const quotes = JSON.parse(fs.readFileSync("./data/quotes.json"));
  const updatedQuotes = quotes.filter((q) => q.id !== req.params.id);
  fs.writeFileSync(
    "./data/quotes.json",
    JSON.stringify(updatedQuotes, null, 2)
  );
  res.json({ success: true });
});

// ======================= COMMENTS ROUTES =======================
app.get("/api/comments", (req, res) => {
  const comments = JSON.parse(fs.readFileSync("./data/comments.json"));
  res.json(comments);
});

app.delete("/api/comments/:id", (req, res) => {
  const comments = JSON.parse(fs.readFileSync("./data/comments.json"));
  const updatedComments = comments.filter((c) => c.id !== req.params.id);
  fs.writeFileSync(
    "./data/comments.json",
    JSON.stringify(updatedComments, null, 2)
  );
  res.json({ success: true });
});

// ======================= START SERVER =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur opérationnel sur le port ${PORT}`);
});
