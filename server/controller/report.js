const reportModel = require("../models/report");
// const User = require("../models/user");
const Event = require("../models/event");
const Bid = require("../models/bid");
const Report = require("../models/report");
// const jwt = require("jsonwebtoken");

class ReportClass {

    async getAllReport(req, res) {
        try {
            let reports = await reportModel.find()
              .sort({ _id: -1 })
              
            if (reports) {
              return res.status(200).json({ result: reports, msg: "Success"});
                }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleReport(req, res) {
        try {
            let {reportId} = req.body
            let report = await reportModel.findOne({_id: reportId})
            
            if (report) {
                await reportModel.findOne({_id: reportId})
                .populate({
                    path: "itemId",
                    model: report.collectionName
                })
                .then((fountReport) => {
                    return res.status(200).json({ result: fountReport, msg: "Success"});
                })
                }
          } catch (err) {
              console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    // async getUserBid(req, res) {
    //     try {
    //         let user = await User.findOne({mobileNo: req.user.mobileNo})
    //                     .populate("myBids")
    //                     .select("myBids")
    //         if(user){
    //             return res.status(200).json({ result: user, msg: "Success"});
    //         }
    //       } catch (err) {
    //         return res.status(500).json({ result: err, msg: "Error"});
    //       }
    // }

    async createReport(req, res) {
        try {
            let { collectionName, itemId, reason} = req.body;
            let createdBy = req.user._id;
            console.log(req.body)
            if(!collectionName || !itemId || !reason){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let newReport = new reportModel({
                    createdBy,
                    collectionName,
                    itemId,
                    reason
                })
                console.log(newReport)
                let createdReport = await newReport.save()
                return res.status(200).json({ result: createdReport, msg: "Success"});
                 
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateReport(req, res) {
        try {
            let { reportId } = req.body;
                if(!reportId){
                    return res.status(500).json({ result: "Data Missing", msg: "Error"});
                } else {
                    let updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    console.log(updateOps)
                    let currentReport = await reportModel.updateOne({_id: reportId}, {
                        $set: updateOps
                      });
                        if(currentReport) {
                          return res.status(200).json({ result: currentReport, msg: "Success" });
                        }
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async deleteReport(req, res) {
        try {
            let { reportId } = req.body;
            if(!reportId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    await reportModel.deleteOne({_id: reportId})
                    .then((deletedReport) => {
                        return res.status(200).json({ result: deletedReport.deletedCount, msg: "Success" });
                    })
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async deleteReportItem(req, res) {
      try {
          let { itemId, collectionName, reportId } = req.body;
          if(!itemId || !collectionName || !reportId){
              return res.status(500).json({ result: "Data Missing", msg: "Error"});
          } else {
            if(collectionName === "Event") {
                Event.deleteOne({_id: itemId})
                  .then((deletedReport) => {
                      Report.updateOne({_id: reportId}, {$set: {status: "Deleted"}})
                        .then((updatedReport) => {
                          console.log("report set to | Deleted |")
                          return res.status(200).json({ result: deletedReport.deletedCount, msg: "Success" });
                    })
                  })
            } else if(collectionName === "Bid") {
                Bid.deleteOne({_id: itemId})
                  .then((deletedReport) => {
                      Report.updateOne({_id: reportId}, {$set: {status: "Deleted"}})
                        .then((updatedReport) => {
                          console.log("report set to | Deleted |")
                          return res.status(200).json({ result: deletedReport.deletedCount, msg: "Success" });
                    })
                  })
            } else {
              console.log("something went wrong")
              return res.status(200).json({ result: "Something went wrong", msg: "Success" });
            }
          }
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

    // async approveBid(req, res) {
    //     try {
    //         let { bidId } = req.body;
    //         if(!bidId){
    //             return res.status(500).json({ result: "Data Missing", msg: "Error"});
    //         } else {
    //                     let approvedBid = await bidModel.updateOne({_id: bidId}, {$set: {status: "Approved"}})
    //                     if(approvedBid) {
    //                             return res.status(200).json({ result: approvedBid, msg: "Success" });
    //                     }
    //         }
    //       } catch (err) {
    //         console.log(err)
    //         return res.status(500).json({ result: err, msg: "Error"});
    //       }
    // }
}

const reportController = new ReportClass();
module.exports = reportController;