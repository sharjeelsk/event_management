const conversationModel = require("../models/conversation");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

class Conversation {


    async newCon(req, res) {
        try {
            let { senderId, recieverId } = req.body;
            if( !senderId || !recieverId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let newConversation = new conversationModel({
                        members: [senderId, recieverId],
                    });

                    let savedCon = await newConversation.save();
                    return res.status(200).json({ result: savedCon, msg: "Success"});
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async userCon(req, res) {
        try {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let conversations = await conversationModel.find({members: {$in: [user._id.toString()]}})
                    return res.status(200).json({ result: conversations, msg: "Success"});
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
            
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const ConversationController = new Conversation();
module.exports = ConversationController;