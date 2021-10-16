const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");

router.get("/all-category", categoryController.getAllCategory);
router.get("/single-category", categoryController.getSingleCategory);

router.post("/create-category", categoryController.createCategory);
router.post("/update-category", categoryController.updateCategory);
router.post("/delete-category", categoryController.deleteCategory);

module.exports = router;