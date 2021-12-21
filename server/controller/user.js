const userModel = require("../models/user");
const Conv = require("../models/conversation");
const Bid = require("../models/bid");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { AvailableAddOnPage } = require("twilio/lib/rest/preview/marketplace/availableAddOn");

class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .sort({ _id: -1 });
      if (Users) {
        return res.status(200).json({ result: Users, msg: "Success"});
      }
    } catch (err) {
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getSingleUser(req, res) {
      try {
        let user = await userModel
          .findOne({_id: req.user._id})
          .select("name email mobileNo address organisation myEvents myBids myServices bidedEvent img")
          .populate({path: 'myEvents myBids myServices', options: { sort: {'createdAt': -1} }});

        let b = await userModel.aggregate([
          {
            $facet: {
              "user": [
                {$match: {_id: req.user._id}}
              ],
              "reminders": [

                {$match: {_id: req.user._id}},
                {$lookup: 
                  {
                      from: 'reminders',
                      localField: '_id',
                      foreignField: 'users',
                      as: 'reminderss'
                  }},
                  {
                    $project:{
                            count:{$size:"$reminderss"},
                        }
                }
              ],
            }
          }
        ])
        
        if (user && b) {
          console.log(b[0].user[0])
          b[0].user[0]['reminderCount'] = b[0].reminders[0].count
          let conversations = await Conv.aggregate([
            { $match: { members: {$in: [new mongoose.Types.ObjectId(req.user._id)]}}},
            { $lookup: {
               from: 'messages',
               localField: '_id',
               foreignField: 'conversationId',
               as: 'messages'
           }},
           { $addFields: {unseen: { $sum: { // map out array of seenBy id's //'$$message.seenBy'
                   $map: {
                     input: "$messages",
                     as: "message",
                     in:  { $cond: {if: {$in: [ new mongoose.Types.ObjectId(req.user._id), "$$message.seenBy" ] }, then: 0, else: -1}}}}}}
           }, 
          //  { $addFields: { lastMsg: {"$arrayElemAt": ["$messages", -1]}}},
           { $addFields: { unseenMsg: {"$slice": ["$messages", "$unseen"]}}},
           { $project: { "messages": 0, "unseenMsg": {"conversationId": 0, "createdAt": 0, "seenBy": 0, "sender": 0, "text": 0, "updatedAt": 0, "__v": 0}}}
          ])

          let conversationCount = conversations.filter(function (el) {
            return el.unseen < 0
          });
          b[0].user[0]['conversationCount'] = conversationCount.length
          return res.status(200).json({ result: b[0].user[0], msg: "Success"});
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async postEditUser(req, res) {
    try {
      const updateOps = {};
      for(const ops of req.body){
          updateOps[ops.propName] = ops.value;
      }
      let currentUser = await userModel.updateOne({mobileNo: req.user.mobileNo}, {
        $set: updateOps
      });
      console.log(updateOps)
        if(currentUser) {
          return res.status(200).json({ result: currentUser, msg: "Success" });
        }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

//   async getDeleteUser(req, res) {
//     let { oId, status } = req.body;
//     if (!oId || !status) {
//       return res.json({ message: "All filled must be required" });
//     } else {
//       let currentUser = userModel.findByIdAndUpdate(oId, {
//         status: status,
//         updatedAt: Date.now(),
//       });
//       currentUser.exec((err, result) => {
//         if (err) console.log(err);
//         return res.json({ success: "User updated successfully" });
//       });
//     }
//   }

  async upload(req, res) {
    try {
       await userModel.updateOne({_id: req.user._id}, {$set: {img: req.file.filename}})
       .then(result => {console.log(result)})
       .catch(err => {console.log(err)})
       res.json({file: req.file})
   } catch (err) {
     console.log(err)
     return res.status(500).json({ result: err, msg: "Error"});
   }
  }

  async getAllUploads(req, res) {
    try {
        let gfs = require("../../index")
        gfs.files.find().toArray((err, files) => {
          if(!files || files.length === 0){
            return res.status(404).json({
              err: "no file exist"
            });
          }
          return res.json(files);
        })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getSingleUpload(req, res) {
    try {
      gfs.files.findOne({filename: req.params.filename} , (err, files) => {
        if(!files || files.length === 0){
          return res.status(404).json({
            err: "no file exist"
          });
        }
        
        return res.json(files);
      }) 
  } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
  }
  }

  async getSingleImg(req, res) {
    try {
      let gfs = require("../../index")
      gfs.files.findOne({filename: req.params.filename} , (err, file) => {
        if(!file || file.length === 0){
          return res.status(404).json({
            err: "no file exist"
          });
        }
        if(file.contentType === "image/jpeg" || file.contentType === "image/png" || file.contentType === "image/jpg"){
          const readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
        } else {
          res.status(404).json({
            err: "not An Image"
          });
        }
      })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
  }
  }

  async getMyApprovals(req, res) {
    try {
      let User = await userModel
        .findOne({_id: req.user._id})
        .select("myApprovals")
        .populate({
          path: "myApprovals.bid",
          model: "Bid",
          populate: {
            path: "userId",
            model: "User",
            select: ("name _id")
          }
        });
      if (User) {
        return res.status(200).json({ result: User, msg: "Success"});
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async rateUser(req, res) {
    try {
      let { userId, stars, bidId} = req.body;
      console.log(req.body.stars)
      if(!bidId || !userId || !stars && stars !== 0){
        return res.status(500).json({ result: "Data Missing", msg: "Error"});
      } else {
        await userModel.findById(userId)
        .then( async (user) => {
          // let avg = ((user.rating.avg * user.rating.total) + stars) / (user.rating.total + 1)
          let avg = (user.rating.total + stars) / (user.rating.count +1)
          await userModel.updateOne({_id: userId}, {$set: {"rating.avg": Math.round(avg * 10) / 10, "rating.total": user.rating.total+ stars}, $inc: {"rating.count": 1}})
          .then( async (updated) => {
            await Bid.updateOne({_id: bidId}, {$set: {rating: true}})
            .then((updatedBid) => {
              return res.status(200).json({ result:Math.round(avg * 10) / 10, msg: "Success"});
            })
          })
          
        })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async search(req, res){
    try {
      let users = await userModel.aggregate(
        [
          {
            '$search': {
              'index': 'default', 
              'text': {
                'query': req.body.query, 
                'path': [
                  'city'
                ], 
                'fuzzy': {}, 
                'score': {
                  'boost': {
                    'value': 5
                  }
                }
              }
            }
          },
          {
            '$match': {
                'myServices': {
                    '$exists': true, 
                    '$ne': []
                }
            }
        },
          {
            "$lookup": {
            from: "services",
            localField: "myServices",
            foreignField: "_id",
            as: "user_services"
        }}
        ]
      )
      if(users){
        console.log(users)
        return res.status(200).json({ result: users, msg: "Success"});
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }


}

const userController = new User();
module.exports = userController;
