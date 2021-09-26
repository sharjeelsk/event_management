const express = require("express");
const router = express.Router();
const usersController = require("../controller/user");

router.get("/all-user", usersController.getAllUser);
router.post("/single-user", usersController.getSingleUser);

router.post("/edit-user", usersController.postEditUser);
// router.post("/delete-user", usersController.getDeleteUser);


module.exports = router;