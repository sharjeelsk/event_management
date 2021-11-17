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
    origin: "http://localhost:3000",
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
io.on("connection", socket => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room",async (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    let messages = await messageModel.find({
      conversationId: data.toString()
  })
  console.log(messages)
    io.to(data).emit("receive_message", messages);
  });

  socket.on("send_message",(data) => {
    console.log(data)
    let newMessage = new messageModel({
      conversationId: data.conversationId,
      sender: data.sender,
      text : data.text
  });
    newMessage.save()
    .then((saved) => {
      console.log(saved)
      console.log("COnv ID", data.conversationId)
      let roomId = data.conversationId;
      io.to(roomId).emit("receive_message", saved);
    })

  });

  // socket.on("all-messages",async (data) => {
  //   console.log(data)
  //   let messages = await messageModel.find({
  //     conversationId: data.toString()
  // })
  // console.log(messages)
  //   socket.to(data).emit("receive_message", messages);
  // });

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
  const expoPushToken ='ExponentPushToken[r7kJbmFjt4-3Sb1aoaIxiq]'
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

