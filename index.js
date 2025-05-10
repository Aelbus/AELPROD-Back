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

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Nouveau message de ${name}`,
      text: `Email: ${email}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    const messages = JSON.parse(
      fs.readFileSync("./data/messages.json", "utf-8")
    );
    messages.push({ id: Date.now().toString(), name, email, message });
    fs.writeFileSync("./data/messages.json", JSON.stringify(messages, null, 2));

    res.json({ success: true, message: "Message envoyé avec succès !" });
  } catch (err) {
    console.error("Erreur envoi mail:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
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
  try {
    const templates = JSON.parse(
      fs.readFileSync("./data/templates.json", "utf-8")
    );
    res.json(templates);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post("/api/templates", (req, res) => {
  if (req.headers.authorization !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Non autorisé" });
  }
  try {
    const templates = JSON.parse(
      fs.readFileSync("./data/templates.json", "utf-8")
    );
    const newTemplate = { id: Date.now().toString(), ...req.body };
    templates.push(newTemplate);
    fs.writeFileSync(
      "./data/templates.json",
      JSON.stringify(templates, null, 2)
    );
    res.json(newTemplate);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.delete("/api/templates/:id", (req, res) => {
  if (req.headers.authorization !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Non autorisé" });
  }
  try {
    const templates = JSON.parse(
      fs.readFileSync("./data/templates.json", "utf-8")
    );
    const updatedTemplates = templates.filter((t) => t.id !== req.params.id);
    fs.writeFileSync(
      "./data/templates.json",
      JSON.stringify(updatedTemplates, null, 2)
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ======================= QUOTES ROUTES =======================
app.get("/api/quotes", (req, res) => {
  try {
    const quotes = JSON.parse(fs.readFileSync("./data/quotes.json", "utf-8"));
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.delete("/api/quotes/:id", (req, res) => {
  if (req.headers.authorization !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Non autorisé" });
  }
  try {
    const quotes = JSON.parse(fs.readFileSync("./data/quotes.json", "utf-8"));
    const updatedQuotes = quotes.filter((q) => q.id !== req.params.id);
    fs.writeFileSync(
      "./data/quotes.json",
      JSON.stringify(updatedQuotes, null, 2)
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ======================= COMMENTS ROUTES =======================
app.get("/api/comments", (req, res) => {
  try {
    const comments = JSON.parse(
      fs.readFileSync("./data/comments.json", "utf-8")
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post("/api/comments", (req, res) => {
  try {
    const comments = JSON.parse(
      fs.readFileSync("./data/comments.json", "utf-8")
    );
    const newComment = { id: Date.now().toString(), ...req.body };
    comments.push(newComment);
    fs.writeFileSync("./data/comments.json", JSON.stringify(comments, null, 2));
    res.json(newComment);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.delete("/api/comments/:id", (req, res) => {
  if (req.headers.authorization !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Non autorisé" });
  }
  try {
    const comments = JSON.parse(
      fs.readFileSync("./data/comments.json", "utf-8")
    );
    const updatedComments = comments.filter((c) => c.id !== req.params.id);
    fs.writeFileSync(
      "./data/comments.json",
      JSON.stringify(updatedComments, null, 2)
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ======================= START SERVER =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur opérationnel sur le port ${PORT}`);
});
