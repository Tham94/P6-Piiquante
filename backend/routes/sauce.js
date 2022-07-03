const express = require("express");
const auth = require("../middleware/auth");
const sauceCtrl = require("../controllers/sauce");
const multer = require("../middleware/multer-config");

const router = express.Router();

router.post("/", auth, multer, sauceCtrl.createSauce);

router.put("/:id", auth, multer, sauceCtrl.modifyingSauce);

router.delete("/:id", auth, sauceCtrl.deleteSauce);

router.get("/:id", auth, sauceCtrl.getOneSauce);

router.get("/", auth, sauceCtrl.getAllSauces);

router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
