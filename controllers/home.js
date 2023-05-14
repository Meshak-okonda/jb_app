const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { existsSync } = require("fs");
require("dotenv").config();
const { io } = require("socket.io-client");

const { PATH_FILE, SITE_URL } = process.env;

const mailgun = require("mailgun-js");
const { removeSpecialChars } = require("../utils");
const sendEMail = require("../utils/sendMail");
const DOMAIN = process.env.DOMAIN_NAME;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dateStrings: "date",
  database: "iph",
});

exports.getIndex = (req, res, next) => {
  res.render("index");
};

exports.getLanding = (req, res, next) => {
  res.render("landing");
};
exports.getAbout = (req, res, next) => {
  res.render("about");
};
exports.getFormations = (req, res, next) => {
  db.query("SELECT * FROM course", (error, results) => {
    if (error) {
      console.log("Error retrieving data from MySQL:", error);
    } else {
      res.render("formations", { course: results });
    }
  });
};
exports.getCoursDetail = (req, res, next) => {
  const id = req.params.id; // Récupération de l'identifiant dans l'URL
  db.query("SELECT * FROM course WHERE c_id = ?", [id], (err, rows) => {
    if (err) throw err;
    res.render("coursdetail", { course: rows[0] }); // Affichage de la vue avec les données récupérées
  });
};

// Méthode pour afficher le formulaire d'inscription
exports.showInscriptionForm = (req, res) => {
  const id = req.params.id; // Récupération de l'identifiant dans l'URL
  db.query("SELECT * FROM course WHERE c_id = ?", [id], (err, rows) => {
    if (err) throw err;
    res.render("inscriptions", { course: rows[0] }); // Affichage de la vue avec les données récupérées
  });
};

// Méthode pour traiter la soumission du formulaire d'inscription
exports.submitInscriptionForm = (req, res) => {
  const course_id = req.body.course_id;
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const adresse = req.body.adresse;
  const diplomeFile = req.files.diplome;
  const extension =
    diplomeFile.name.split(".")[diplomeFile.name.split(".").length - 1];
  const file_name = `${removeSpecialChars(diplomeFile.name)}.${extension}`;
  const diplomeFilePath = `${PATH_FILE}${file_name}`;

  // Enregistrer le fichier sur le disque
  diplomeFile.mv(diplomeFilePath, (err) => {
    if (err) throw err;

    // Insérer les données dans la base de données
    const query =
      "INSERT INTO inscriptions (course_id, name, last_name, email, adress, diplome_name, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      course_id,
      nom,
      prenom,
      email,
      adresse,
      file_name,
      "progress",
    ];
    db.query(query, values, async (err, results) => {
      if (err) throw err;
      const subject = `Votre inscription`;
      const message = `
        <div>
          <p>
            Felicitation pour votre inscription <strong>${nom} ${prenom}</strong>
            <a href="${SITE_URL}${results.insertId}">
              clickez sur ce lien pour voir l'évolution de votre candidature
            </a>
          </p>
        </div>
      `;
      const socket = await io("http://localhost:5000", {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("connect_error", (error) => {
        console.error("Failed to connect to server:", error);
      });

      socket.emit(
        "back_to_server",
        JSON.stringify({
          id: results.insertId,
          course_id,
          nom,
          prenom,
          email,
        })
      );

      res.redirect("/merci");
      // await sendEMail(subject, message, email);
    });
  });
};

// Méthode pour traiter la soumission du formulaire d'inscription
exports.submitInscriptionUpdate = (req, res) => {
  const status = req.body.status;
  const remarque = req.body.remarque;
  const id = req.params.id;

  // Insérer les données dans la base de données
  const query = `UPDATE inscriptions SET status = ? WHERE id = ?`;
  const values = [status, parseInt(id)];
  db.query(query, values, async (err, results) => {
    if (err) throw err;
    const subject = `Votre inscription`;
    const message = `
        <div>
          <p>
            Après vérification de votre requete nous vous informons que votre inscription est : ${
              status === "accepted" ? "Acceptée" : "Refusée"
            }!
            ${
              status !== "accepted"
                ? `<div>
            <h6>La Raison</h6>
            <p>${remarque}</p>
            </div>`
                : ""
            }
          </p>
        </div>
      `;

    res.redirect("/admin/getAllCourses");
    // await sendEMail(subject, message, email);
  });
};


exports.getInscriptionDetails = (req, res, next) => {
  const { id } = req.params;
  const query = "SELECT * FROM inscriptions WHERE id=?";
  const values = [id];
  db.query(query, values, async (err, results) => {
    if (err) throw err;
    res.render("inscription_detatail", { results: results[0] });
  });
};

exports.getError403 = (req, res, next) => {
  res.render("error403");
};

exports.getError404 = (req, res, next) => {
  res.render("error404");
};

exports.merci = (req, res, next) => {
  res.render("merci");
};