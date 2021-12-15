const express = require("express");
const router = express.Router();
const usersController = require("../controller/user");
const { isAuthorized } = require("../middleware/reqAuth");
const path = require('path')
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const crypto = require("crypto")

// Storage Engine
const storage = new GridFsStorage({
    url: process.env.DATABASE,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          console.log(filename)
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

router.get("/all-user", isAuthorized, usersController.getAllUser);
router.get("/single-user", isAuthorized, usersController.getSingleUser);

router.post("/edit-user", isAuthorized, usersController.postEditUser);
// router.post("/delete-user", usersController.getDeleteUser);

//uploads
router.post("/upload", isAuthorized, upload.single("image"), usersController.upload)
router.get("/uploads", isAuthorized, usersController.getAllUploads)
router.get("/uploads/:filename", isAuthorized, usersController.getSingleUpload)
router.get("/image/:filename", usersController.getSingleImg)

router.get("/myApprovals", isAuthorized, usersController.getMyApprovals);
router.post("/rate-user", usersController.rateUser);
router.post("/search", usersController.search);


module.exports = router;