const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

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
        let User = await userModel
          .findOne({mobileNo: req.user.mobileNo})
          .select("name email mobileNo address organisation myEvents myBids myServices bidedEvent img")
          .populate({path: 'myEvents myBids myServices', options: { sort: {'createdAt': -1} }});
        if (User) {
          return res.status(200).json({ result: User, msg: "Success"});
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


}

const userController = new User();
module.exports = userController;
