const express = require("express");

require("dotenv").config();
console.log(process.env);
console.log();
console.log();

const mongoose = require("mongoose");
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion to MongoDB succeded !"))
  .catch(() => console.log("Connexion to MongoDB failed !"));

const app = express();

app.use(express.json());

module.exports = app;
