const express = require("express");
const router = express.Router();
const cors = require("cors");
const User = require("./database");

// middleware
router.use(cors());
router.use(express.json());

// create a user

let use = {
  name: "teseeft",
}
router.post("/", (req, res) => {
  // User.create({ ...req.body },
  User.create({ use },
    () =>
      User.find((err, users) => {
        if (err) res.status(400).json({ msg: err.message });
        res.status(200).json(users);
      }));
});

// get all users
router.get("/", (req, res) => {
  User.find((err, users) => {
    if (err) {
      res.status(400).json({ msg: err.message });
    } else {
      res.status(200).json(users);
    }
  });
});

module.exports = router;
