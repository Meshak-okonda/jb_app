const express = require("express");
const homeController = require("../controllers/home");

const router = express.Router();
router.get("/", homeController.getLanding);

router.get("/index", homeController.getIndex);

router.get("/About", homeController.getAbout);

router.get("/formations", homeController.getFormations);

router.get("/coursdetail/:id", homeController.getCoursDetail);

router.get("/unauthorized", homeController.getError403);

// Route pour afficher le formulaire d'inscription
router.get("/inscriptions/:id", homeController.showInscriptionForm);

// Route pour traiter la soumission du formulaire d'inscription
router.post("/inscriptions", homeController.submitInscriptionForm);

router.put("/inscriptions/:id", homeController.submitInscriptionUpdate);

// Route pour traiter la soumission du formulaire d'inscription
router.get("/inscriptions/view/:id", homeController.getInscriptionDetails);

// Route pour traiter la soumission du formulaire d'inscription
router.get("/merci", homeController.merci);

// should be in last
router.use("/", homeController.getError404);

module.exports = router;
