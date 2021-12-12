const conversationModel = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose")

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
            let conversations = await conversationModel.aggregate([
             { $match: {
              members: {$in: [req.user._id]}
              }
            },
            {$lookup: 
            {
                from: 'messages',
                localField: '_id',
                foreignField: 'conversationId',
                as: 'messages'
            }},
            {
              $addFields: {
                unseen: {
                  $sum: { // map out array of seenBy id's //'$$message.seenBy'
                    $map: {
                      input: "$messages",
                      as: "message",
                      in:  {
                        $cond: {
                          if: {
                            $in: [ req.user._id, "$$message.seenBy" ]
                          //  $ne: [req.user._id, '$$message.seenBy']
                          },
                          then: 0,
                          else: -1
                        }
                     }
                    }
                  }
                }
              }
            },
            {
              $addFields: {
                  lastMsg: {"$arrayElemAt": ["$messages", -1]}
              }  
            },
            {
              $addFields: {
                  unseenMsg: {"$slice": ["$messages", "$unseen"]}
              }  
            },
            { $sort : { "lastMsg.createdAt": -1 } },
            {
              $project: 
              {
               "messages": 0,
               "unseenMsg": {"conversationId": 0, "createdAt": 0, "seenBy": 0, "sender": 0, "text": 0, "updatedAt": 0, "__v": 0}
              }
            }

            ])
            if(conversations){
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