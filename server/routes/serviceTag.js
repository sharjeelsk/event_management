const express = require("express");
const router = express.Router();
const sTagController = require("../controller/serviceTag");

router.get("/all-tag", sTagController.getAllTag);
router.get("/single-tag", sTagController.getSingleTag);

router.post("/create-tag", sTagController.createTag);
router.post("/update-tag", sTagController.updateTag);
router.post("/delete-tag", sTagController.deleteTag);

module.exports = router;