const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const { isAuthorized } = require("../middleware/reqAuth");

router.get("/all-category", categoryController.getAllCategory);
router.get("/single-category", isAuthorized, categoryController.getSingleCategory);

router.post("/create-category", categoryController.createCategory);
router.post("/update-category", isAuthorized, categoryController.updateCategory);
router.post("/delete-category", categoryController.deleteCategory);

module.exports = router;