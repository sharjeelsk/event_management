const express = require("express");
const router = express.Router();
const sTagController = require("../controller/serviceTag");
const { isAuthorized } = require("../middleware/reqAuth");

router.get("/all-tag", isAuthorized, sTagController.getAllTag);
router.get("/single-tag", isAuthorized, sTagController.getSingleTag);

router.post("/create-tag", isAuthorized, sTagController.createTag);
router.post("/update-tag", isAuthorized, sTagController.updateTag);
router.post("/delete-tag", isAuthorized, sTagController.deleteTag);

module.exports = router;