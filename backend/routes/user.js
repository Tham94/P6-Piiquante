const express = require("express");
const userCtrl = require("../controllers/user");
const passwordValidator = require("../middleware/password-validator");

const router = express.Router();

router.post("/signup", passwordValidator, userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
