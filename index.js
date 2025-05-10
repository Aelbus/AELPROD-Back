require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");

const adminRoutes = require("./routes/admin");

const app = express();

// Middleware CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://aelprod.com"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Routes principales
app.use("/api", adminRoutes);

// ======================= CONTACT ROUTE =======================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 465,
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

    await transporter.sendMail(mailOptions);

    const messagesPath = "./data/messages.json";
    const messages = fs.existsSync(messagesPath)
      ? JSON.parse(fs.readFileSync(messagesPath, "utf-8"))
      : [];
    messages.push({ id: Date.now().toString(), name, email, message });
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

    res.json({ success: true, message: "Message envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ======================= LANCEMENT =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur opérationnel sur le port ${PORT}`);
});
