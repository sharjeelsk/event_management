// Hagia sophia constantinople
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
const socketio = require("socket.io")
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:3001", "http://localhost:3006"],
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
let Conv = require("./server/models/conversation")

//Socket
io.sockets.on("connection", socket => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room",async (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    let messages = await messageModel.aggregate([
      {$match : { conversationId: new mongoose.Types.ObjectId(data)}}
  ])
  let messages1 = await messageModel.aggregate([
    {$match : { conversationId: new mongoose.Types.ObjectId(data)}}
])
  // conversationId: data.toString()
  consol.log(messages)
    io.to(data).emit("all-msg", messages);
  });

  socket.on("leave_room",async (data) => {
    console.log(data)
    socket.leave(data);
    console.log(`User with ID: ${socket.id} leave room: ${data}`);
  });

  socket.on("send_message",(data, senderName, nextUserId) => {
    console.log(data, senderName, nextUserId)
    let newMessage = new messageModel({
      conversationId: data.room,
      sender: data.sender,
      text : data.text
  });
    newMessage.save()
    .then((saved) => {
      console.log("COnv ID", data.room)
      // Norify next User
      notifyUser(senderName, nextUserId, saved.text)// Not Reminder
      io.to(data.room).emit("receive_message", saved)
    })
  });

  socket.on("seen_msg",async (unseen, convId) => {
    console.log("******************************************************************")
    console.log(convId)
    let a = await messageModel.aggregate([
      {$match : { convsersationId: convId}}
  ])
  console.log("seen_msg________________________________", a)
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
})

// Send Notification for One to One Conversation
async function notifyUser(senderName, nextUserId, message) {
  console.log(senderName, nextUserId, message)
  console.log(mongoose.Types.ObjectId(nextUserId))
  await User.findOne({_id: nextUserId})
  .then((user) => {
    console.log(user);
    notification(user.expoPushToken, `New Message from ${senderName}`, message)
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

