const conversationModel = require("../models/conversation");
const User = require("../models/user");
var ObjectID = require('mongodb').ObjectID;

const jwt = require("jsonwebtoken");

class Conversation {


    async newCon(req, res) {
        try {
            let { senderId, recieverId } = req.body;
            if( !senderId || !recieverId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
              await User.findOne({_id: recieverId})
              .then(async (reciever) => {
                await User.findOne({_id: senderId})
                .then(async (sender) => {
                  let conversation = await conversationModel.findOne({members: {$all: [sender._id, reciever._id]}, type: "Single"})
                  console.log(conversation)
                  if(conversation != null && conversation != []){
                  console.log("Conversation Exist...")
                    return res.status(200).json({ result: conversation._id, msg: "Success"});
                } else {
                  console.log("Creating New Conversation...")
                  let newConversation = new conversationModel({
                    name: [{userId: reciever._id, name: reciever.name}, {userId: sender._id, name: sender.name}],
                    members: [sender._id, reciever._id],
                    type: "Single" // this is used bcoz this function is used only for creating one-to-one Conversation
                    });
                  let conversation = await newConversation.save();
                  return res.status(200).json({ result: conversation, msg: "Success"});
                  }
                })
              })
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async userCon(req, res) {
        try {
            let conversations = await conversationModel.find({members: {$in: [req.user._id]}})
            if(conversations){
              console.log(conversations)
                return res.status(200).json({ result: conversations, msg: "Success"});
            }
          } catch (err) {
            console.log(err)()
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const ConversationController = new Conversation();
module.exports = ConversationController;