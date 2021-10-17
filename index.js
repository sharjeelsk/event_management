require("dotenv").config()
const express = require("express")
const bodyParser = require('body-parser')
const cors = require("cors");
const mongoose = require("mongoose")
const morgan = require("morgan")
const jwt = require("jsonwebtoken");
const http = require("http")
const app = express()
const socketio = require("socket.io")
const server = http.createServer(app)
const io = socketio(server);

//uploads
const path = require('path')
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const Grid = require("gridfs-stream")
const crypto = require("crypto")


const User = require("./server/models/user");

const PORT = process.env.PORT || 3000;

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
// // Grid Stream Intt
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads")
 
  // all set!
})

// Storage Engine
const storage = new GridFsStorage({
  url: process.env.DATABASE,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });




// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json())
app.use(cors());
if(process.env.NODE_ENV==='production'){
  app.use(express.static('client/build'));
  app.get('*',(req,res)=>{
      res.sendFile(path.resolve(__dirname,'client','build','index.html'))
  })
}
//app.use(express.static("public"));
//app.use(express.urlencoded({ extended: false }));
//app.use(express.json());

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


app.get("/test", (req,res) => {
  res.send("hello")
})

app.post("/api/user/upload", upload.single("file"),  async (req, res) => {
  try {
    let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
    let user = await User.findOne({mobileNo: decoded.data});
    if(user){
      await User.updateOne({_id: user._id}, {$set: {img: req.file.filename}})
      .then(result => {console.log(result)})
      .catch(err => {console.log(err)})
      res.json({file: req.file})
    } else {
      return res.status(500).json({ result: "UnAuthorised", msg: "Error"});
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
  }
})


app.get("/api/user/uploads", async (req, res) => {
  try {
    let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
    let user = await User.findOne({mobileNo: decoded.data});
    if(user){
      gfs.files.find().toArray((err, files) => {
        if(!files || files.length === 0){
          return res.status(404).json({
            err: "no file exist"
          });
        } else {
          return res.status(500).json({ result: "UnAuthorised", msg: "Error"});
        }
        
        return res.json(files);
      })
    } 
  } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
  }
})

app.get("/api/user/uploads/:filename", async (req, res) => {
  try {
    let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
    let user = await User.findOne({mobileNo: decoded.data});
    if(user){
      gfs.files.findOne({filename: req.params.filename} , (err, files) => {
        if(!files || files.length === 0){
          return res.status(404).json({
            err: "no file exist"
          });
        }
        
        return res.json(files);
      }) 
    } else {
      return res.status(500).json({ result: "UnAuthorised", msg: "Error"});
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
  }
})

app.get("/api/user/image/:filename", async (req, res) => {
  try {
    let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
    let user = await User.findOne({mobileNo: decoded.data});
    if(user){
      gfs.files.findOne({filename: req.params.filename} , (err, file) => {
        if(!file || file.length === 0){
          return res.status(404).json({
            err: "no file exist"
          });
        }
        if(file.contentType === "image/jpeg" || file.contentType === "img/png"){
          const readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
        } else {
          res.status(404).json({
            err: "not An Image"
          });
        }
      })
    }  else {
      return res.status(500).json({ result: "UnAuthorised", msg: "Error"});
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
  }
})


// Run Server
server.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});

module.exports = gfs;