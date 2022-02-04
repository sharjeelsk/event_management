require("dotenv").config()
const express = require("express")
const fetch = require("node-fetch");
const bodyParser = require('body-parser')
const cors = require("cors");
const mongoose = require("mongoose")
const morgan = require("morgan")
const http = require("http")
const app = express()
const { notification } = require("./server/middleware/notification")
app.use(cors());
const { isAuthorized } = require("./server/middleware/reqAuth");
const socketio = require("socket.io")
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:3001", "http://localhost:3006", "http://localhost:57216", "https://events-fawn.vercel.app"],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3002;

//uploads
const path = require('path')
const Grid = require("gridfs-stream");
const { Message } = require("twilio/lib/twiml/MessagingResponse");
// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json())

//app.use(express.static("public"));
//app.use(express.urlencoded({ extended: false }));
//app.use(express.json());

//Models
let User = require("./server/models/user")
let messageModel = require("./server/models/message")
let Conv = require("./server/models/conversation");
const { userInfo } = require("os");



















































let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

//Socket //middleware remaining
io.sockets.on("connection", socket => {

  console.log(`User Connected: ${socket.id}`);
  //Leave Room
  socket.on("event_connect",async (userId) => {
    addNewUser(userId, socket.id);
    console.log(onlineUsers)
  });


  //Join Msg
  socket.on("join_room",async (data, userId, unseenMsg) => {
    socket.join(data);
    
    console.log(onlineUsers.length)
    // console.log(userId, data, unseenMsg)
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    await messageModel.aggregate([{$match : { conversationId: new mongoose.Types.ObjectId(data)}}])
      .then(async (messages) => {
        // console.log(messages)
        await messageModel.updateMany({_id: {$in: unseenMsg}}, {$addToSet: {seenBy: userId}})
        .then(()=> {
          // console.log(messages)
          io.to(data).emit("all-msg", messages);
        })
      })
  });



  //Leave Room
  socket.on("leave_room",async (data) => {
    console.log(data, "leave")
    socket.leave(data);
    console.log(`User with ID: ${socket.id} leave room: ${data}`);
  });



  //User Convesation
  socket.on("all_conv", async (userId) => {
    let conversations = await Conv.aggregate([
      { $match: { members: {$in: [new mongoose.Types.ObjectId(userId)]}}},
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
               in:  { $cond: {if: {$in: [ new mongoose.Types.ObjectId(userId), "$$message.seenBy" ] }, then: 0, else: -1}}}}}}
     }, 
    //  { $addFields: { lastMsg: {"$arrayElemAt": ["$messages", -1]}}},
     { $addFields: { unseenMsg: {"$slice": ["$messages", "$unseen"]}}},
     { $project: { "messages": 0, "unseenMsg": {"conversationId": 0, "createdAt": 0, "seenBy": 0, "sender": 0, "text": 0, "updatedAt": 0, "__v": 0}}}
    ])
    if(conversations){
      // console.log(conversations)
      io.to(socket.id).emit("all_conv", conversations)
    }
  });



  //send Message
  socket.on("send_message", async(data, senderName, nextUserId, socketId) => {
    let a = await io.sockets.adapter.rooms.get(data.room);
    console.log(data.room)
    console.log(a)
    let newMessage = new messageModel({
      conversationId: data.room,
      sender: data.sender,
      text : data.text,
      seenBy: [ data.sender ]
  });
    newMessage.save()
    .then( async (saved) => {
      console.log("COnv ID", data.room)
      let updateConv = await Conv.findOneAndUpdate({_id: saved.conversationId}, {$set: {lastMsg: saved}})
      if(updateConv) {
        let convUsers = updateConv.members
        notifyUser(senderName, nextUserId, saved.text)// Not Reminder

        let rm = Array.from(a);
    
        console.log("roomuserarray",rm, "onlineuserarray",onlineUsers)
        // let roomUsers = onlineUsers.filter((user) => user.convId === data.room);
        // console.log(roomUsers)
        // roomUsers.forEach(user => {
          // rm.forEach((socketUser) => {
          //   onlineUsers.forEach((onlineUser) => {
          //     if(socketUser === onlineUser.socketId){
          //       console.log("Recieve Message to:", socketUser)
          //     } else {
          //       console.log("increase count to:", socketUser)
          //     }
          //   })
          // })
          // for(let i=0;i<=rm.length;i++){
          //   for(let j = 0;j<=onlineUsers;j++){
          //     //rm[i]===onlineuserarray
          //   }
          // }
          // io.to(data.room).emit("receive_message",saved, rm);

          onlineUsers.map(user=>{
            if(convUsers.includes(user.username)){
              //yaha pe check if socket id of this user is in roomusrarray
              if(rm.includes(user.socketId)){
                //yhaha pe wo user room me hai to uska count mat increase karo
                console.log("do baar")
                  console.log("recive msg",user.socketId)
                  io.to(user.socketId).emit("receive_message",saved, rm);
              }else{
                //yaha pe wo user room me nahi hai
                io.to(user.socketId).emit("count",saved.conversationId);
                console.log("increase count",user.socketId)
              }
            }
          })


          // io.to(data.room).emit("receive_message",saved, rm);
        // })
        // io.to(data.room).emit("receive_message",saved, rm);
        // io.to(socket.id).emit("roomD")
      }
    })
  });



  // Seen Message
  socket.on("seen_msg",async (msg, userId) => {
    // console.log("******************************************************************")
    // console.log(msg._id, "msgId")
    // console.log(userId, "UserId")
    console.log(msg, userId)
    let a = await messageModel.updateOne({_id: msg._id}, {$addToSet: {seenBy: new mongoose.Types.ObjectId(userId)}})
  console.log("seen_msg________________________________", a)
  });



  // Disconnect
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(onlineUsers.length)
    console.log("User Disconnected", socket.id);
  });
})



















































// Send Notification for One to One Conversation
async function notifyUser(senderName, nextUserId, message) {
  // console.log(senderName, nextUserId, message)
  // console.log(mongoose.Types.ObjectId(nextUserId))
  await User.findOne({_id: nextUserId})
  .then((user) => {
    // console.log(user);
    // notification(user.expoPushToken, `New Message from ${senderName}`, message)
  })
  
  // let senderName = "";
  // let nextExpoToken = "";
  // await Conv.findOne({_id: conversationId})
  // .then((conv) => {
  //   console.log(conv.members)
  //   console.log("S",sender)
  //   conv.members.forEach(async (member) => {
  //     if(member !== sender) {
  //       console.log("A", member)
  //       await User.findOne({_id: member})
  //       .then( async (foundUser)=> {
  //         console.log(foundUser.expoPushToken)
  //         await User.findOne({_id: sender})
  //         .then((currentUser)=> {
  //           notification(nextExpoToken, `New Message from ${currentUser.name}`, message )
  //         })
  //       })
  //     }
  //   });
  // })

}

// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => {
    console.log(err)
  })

const conn = mongoose.connection

conn.on('error', console.error.bind(console, "Error connecting to db"));

let gfs;
// Grid Stream Intt
conn.once('open', async () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads")
  module.exports = gfs;
})

// Routes
app.use("/api/user", require("./server/routes/user"));
app.use("/api/admin", require("./server/routes/admin"))
app.use("/api/auth", require("./server/routes/auth"));
app.use("/api/sTag", require("./server/routes/serviceTag"));
app.use("/api/service", require("./server/routes/service"));
app.use("/api/event", require("./server/routes/event"))
app.use("/api/bid", require("./server/routes/bid"))
app.use("/api/category", require("./server/routes/category"))
app.use("/api/conv", require("./server/routes/conversation"))
app.use("/api/msg", require("./server/routes/message"))
app.use("/api/report", require("./server/routes/report"))
app.use("/api/userContact", require("./server/routes/userContact"))
app.use("/api/reminder", require("./server/routes/reminder"))
app.use("/api/eventForm", require("./server/routes/eventForm"))



app.get("/", (req,res) => {
  res.send("hello")
})

app.get("/notification",async (req,res)=>{
  const expoPushToken =['ExponentPushToken[2s67cYKY2z6fi4LQkvc3KH]',
     'ExponentPushToken[k5U0xyEqSJHIBuICc1dV27]',
     'ExponentPushToken[k5U0xyEqSJHIBuICc1dV27]',
     'ExponentPushToken[r7kJbmFjt4-3Sb1aoaIxiq]',
     'ExponentPushToken[MJRl5FA0BEjSwZv83kyyJk]',
     'ExponentPushToken[MJRl5FA0BEjSwZv83kyyJk]',
     'ExponentPushToken[MJRl5FA0BEjSwZv83kyyJk]',
     'ExponentPushToken[r7kJbmFjt4-3Sb1aoaIxiq]',
     'ExponentPushToken[2s67cYKY2z6fi4LQkvc3KH]'
  ]
  const message = {
      to: expoPushToken,
      sound: 'default',
      title: "There's a Pre Alert",
      body: 'And here is the body!',
      data: { someData: 'goes here' },
    };
      await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
    res.send("send")
  
   
})

// Run Server
server.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});



  // }}>New Events Nearby</MenuItem>
  // }}>Sort by oldest</MenuItem>
  // }}>Sort by name</MenuItem>