require("dotenv").config()
const express = require("express")
const bodyParser = require('body-parser')
const cors = require("cors");
const mongoose = require("mongoose")
const morgan = require("morgan")
const http = require("http")
const app = express()
app.use(cors());
const socketio = require("socket.io")
const server = http.createServer(app)
const io = socketio(server);

const PORT = process.env.PORT || 3002;

//uploads
const path = require('path')
const Grid = require("gridfs-stream")

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json())


//app.use(express.static("public"));
//app.use(express.urlencoded({ extended: false }));
//app.use(express.json());

//Socket
io.on("connection", socket => {
  console.log(socket.id)
  io.emit("Welcome","diahdojasnk")
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



app.get("/", (req,res) => {
  res.send("hello")
})

// Run Server
server.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});

