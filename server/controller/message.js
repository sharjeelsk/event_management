// const Conversation = require("../models/conversation");
const messageModel = require("../models/message");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

class Message {


    async addMsg(req, res) {
        try {
            let { text, conversationId } = req.body;
            if( !text || !conversationId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let newMessage = new messageModel({
                        conversationId,
                        sender: req.user._id,
                        text 
                    });
                let savedMsg = await newMessage.save();
                return res.status(200).json({ result: savedMsg, msg: "Success"});
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async getMsg(req, res) {
        try {
            let { conversationId } = req.body;
            if( !conversationId ){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let messages = await messageModel.find({
                        conversationId: conversationId
                    })
                    return res.status(200).json({ result: messages, msg: "Success"});

            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const MessageController = new Message();
module.exports = MessageController;