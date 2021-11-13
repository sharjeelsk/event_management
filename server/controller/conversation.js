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
              let conversation = await conversationModel.find({members: {$all: [senderId, recieverId]}})
              if(conversation.length != 0){
              // console.log(conversation)
                return res.status(200).json({ result: conversation, msg: "Success"});
            } else {
              // console.log("new")
                                    let newConversation = new conversationModel({
                        // name: 
                        members: [senderId, recieverId],
                        type: "Single" // this is used bcoz this function is used only for creating one-to-one Conversation
                    });

                    let conversation = await newConversation.save();
                    return res.status(200).json({ result: conversation, msg: "Success"});
              }
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
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const ConversationController = new Conversation();
module.exports = ConversationController;