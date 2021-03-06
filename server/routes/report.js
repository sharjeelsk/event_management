const express = require("express");
const router = express.Router();
const reportController = require("../controller/report");
const { isAuthorized } = require("../middleware/reqAuth");

router.get("/all-report", reportController.getAllReport);
router.get("/single-report", isAuthorized, reportController.getSingleReport);
// router.get("/user-report", isAuthorized, reportController.getUserreports);

router.post("/create-report", isAuthorized, reportController.createReport);
router.post("/update-report", isAuthorized, reportController.updateReport);
router.post("/delete-report", isAuthorized, reportController.deleteReport);

router.post("/delete-report-item", reportController.deleteReportItem)

module.exports = router;