const express = require("express");
const router = express.Router();
const usersController = require("../controller/user");

router.get("/all-user", usersController.getAllUser);
router.get("/single-user", usersController.getSingleUser);

router.post("/edit-user", usersController.postEditUser);
// router.post("/delete-user", usersController.getDeleteUser);


// //uploads
// router.post("/upload", upload.single("file"), usersController.upload)
// router.get("/uploads", usersController.getAllUploads)


module.exports = router;