require("dotenv").config()
const express = require("express")
const bodyParser = require('body-parser')
const cors = require("cors");
const mongoose = require("mongoose")
const morgan = require("morgan")

const path = require('path')
const app = express()

const PORT = process.env.PORT || 3000;

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
  });

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


app.get("/test", (req,res) => {
  res.send("hello")
})

// Run Server
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});