const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: "public/diplomes/" });


const mailgun = require('mailgun-js');
const DOMAIN = process.env.DOMAIN_NAME;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dateStrings: 'date',
  database: 'iph',
});


exports.getIndex = (req, res, next) => {
  res.render('index');
};

exports.getLanding = (req, res, next) => {
  res.render('landing');
}
exports.getAbout = (req, res, next) => {
  res.render('about');
}
exports.getFormations = (req, res, next) => {
  db.query('SELECT * FROM course', (error, results) => {
    if (error) {
      console.log('Error retrieving data from MySQL:', error);
    } else {
      res.render('formations', { course: results });
    }
  });

}
exports.getCoursDetail = (req, res, next) => {
  const id = req.params.id; // Récupération de l'identifiant dans l'URL
  db.query('SELECT * FROM course WHERE c_id = ?', [id], (err, rows) => {
    if (err) throw err;
    res.render('coursdetail', { course: rows[0] }); // Affichage de la vue avec les données récupérées
  });

}

// exports.getInscription = (req, res, next) => {
//   const formationId = req.session.coursId = c_id;
//   const nom = req.body.nom;
//   const prenom = req.body.prenom;
//   const email = req.body.email;
//   const diplome = req.files.diplome;
//   diplome.mv(`public/diplomes/${diplome.name}`, err => {
//     if (err) throw err;
//     const query = 'INSERT INTO inscriptions (cours_id, nom, prenom, email, diplome) VALUES (?, ?, ? , ?, ?)';
//     db.query(query [formationId, nom, prenom, email, diplome.name], (err, results) => {
//       if (err) throw err;
//       res.redirect('/merci');
//     });
//   });
// }






// Méthode pour afficher le formulaire d'inscription
exports.showInscriptionForm = (req, res) => {
  const id = req.params.id; // Récupération de l'identifiant dans l'URL
  db.query('SELECT * FROM course WHERE c_id = ?', [id], (err, rows) => {
    if (err) throw err;
    res.render('inscriptions', { course: rows[0] }); // Affichage de la vue avec les données récupérées
  });
};

exports.showInscription = (req, res) => {
    res.render("inscriptions");
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/diplomes");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});



// Méthode pour traiter la soumission du formulaire d'inscription
exports.submitInscriptionForm = (req, cpUpload, res) => {
  // Récupération des données soumises dans le formulaire

  // Insertion des données dans la base de données

  console.log(req.files);

  const course_id = req.body.course_id;
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const adresse = req.body.adresse;
  const diplomeFile = req.files.diplome;
  const diplomeFileName = diplomeFile.name;
  const diplomeFilePath = `public/diplomes/${diplomeFileName}`;

  // Enregistrer le fichier sur le disque
  diplomeFile.mv(diplomeFilePath, (err) => {
    if (err) throw err;

    // Insérer les données dans la base de données
    const query =
      "INSERT INTO inscriptions (course_id, nom, prenom, email, adresse, diplome) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [course_id, nom, prenom, email, adresse, diplomeFilePath];
    db.query(query, values, (err, results) => {
      if (err) throw err;
      res.redirect("/merci");
    });
  });
};


exports.getError403 = (req, res, next) => {
  res.render('error403');
}

exports.getError404 = (req, res, next) => {
  res.render('error404');
}
