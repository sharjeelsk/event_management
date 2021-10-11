const userModel = require("../models/user");
const jwt = require("jsonwebtoken");

class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        // .populate()
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

        let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
        console.log(decoded)
        let User = await userModel
          .findOne({mobileNo: decoded.data})
          .select("name email mobileNo address organisation myEvent joinedEvents myBids")
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
      let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
      const updateOps = {};
      for(const ops of req.body){
          updateOps[ops.propName] = ops.value;
      }
      console.log(updateOps)
  
      let currentUser = await userModel.updateOne({mobileNo: decoded.data}, {
        $set: updateOps
      });
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

}

const userController = new User();
module.exports = userController;
