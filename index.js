require("dotenv").config()
const express = require("express")
const fetch = require("node-fetch");
const bodyParser = require('body-parser')
const cors = require("cors");
const mongoose = require("mongoose")
const morgan = require("morgan")
const http = require("http")
const app = express()
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


// Models
let messageModel = require("./server/models/message")

//Socket
io.sockets.on("connection", socket => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room",async (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    let messages = await messageModel.find({
      conversationId: data.toString()
  })
    io.to(data).emit("all-msg", messages);
  });

  socket.on("leave_room",async (data) => {
    console.log(data)
    socket.leave(data);
    console.log(`User with ID: ${socket.id} leave room: ${data}`);
  });

  socket.on("send_message",(data) => {
    console.log(data)
    let newMessage = new messageModel({
      conversationId: data.room,
      sender: data.sender,
      text : data.text
  });
    newMessage.save()
    .then((saved) => {
      console.log("COnv ID", data.room)
      let roomId = data.conversationId;
      console.log(data.room)
      io.to(data.room).emit("receive_message", saved);
    })

  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
})

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

