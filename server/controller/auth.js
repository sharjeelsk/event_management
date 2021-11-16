const userModel = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");

const crypto = require("crypto")
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken);
const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
let refreshTokens = [];

class Auth {

  async sendOTP(req, res) {
    const phone = req.body.phone;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 60 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', process.env.ACCOUNT).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
  console.log(fullHash)
    // for production
    // client.messages 
    //   .create({
    //     body: `Your One Time Login Password For Event Management App is ${otp}`,
    //     from: twilioNum,
    //     to: phone
    //   })
    //   .then((messages) => console.log(messages))
    //   .catch((err) => console.error(err));
    console.log("OTP:" +""+otp)
    res.status(200).send({ phone, hash: fullHash, otp });  // this bypass otp via api only for development instead hitting twilio api all the time
    // res.status(200).send({ 
    //   phone,
    //   hash: fullHash,
    //   msg: "Success" 
    // });          // Use this way in Production
  };

  async verifyOTP(req, res){
    let phone = req.body.phone;
    let hash = req.body.hash;
    let otp = req.body.otp;
    let [ hashValue, expires ] = hash.split('.');
  
    let now = Date.now();
    if (now > parseInt(expires)) {
      return res.status(504).send({ msg: 'Timeout. Please try again' });
    }
    let data = `${phone}.${otp}.${expires}`;
    let newCalculatedHash = crypto.createHmac('sha256', process.env.ACCOUNT).update(data).digest('hex');
    const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '30s' });
    const refreshToken = jwt.sign({ data: phone }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
    if (newCalculatedHash === hashValue) {
      console.log('user confirmed');

      let user = await userModel.findOne({mobileNo: phone})
      console.log(user)
      if(user){
        if (user.address === null){
          console.log("User Already Exist, But Details Not Available, Signing in...")
          res.status(200).send({result: refreshToken,  msg: "signup" });
        } else {
          console.log("User Already Exist, Logging in...")
        res.status(200).send({result: refreshToken,  msg: 'login' });
        }
      } else {
        try{
          console.log("New User being Created...")
          let newUser = new userModel({
            mobileNo: phone
          });
          console.log(newUser)
          let save = newUser.save().then(err => console.log(err))
          
          if(save){
            console.log("user Created Successfully")

            refreshTokens.push(refreshToken);
            res
              .status(202)
              .cookie('accessToken', accessToken, {
                expires: new Date(new Date().getTime() + 30 * 1000),
                sameSite: 'strict',
                httpOnly: true
              })
              .cookie('refreshToken', refreshToken, {
                expires: new Date(new Date().getTime() + 31557600000),
                sameSite: 'strict',
                httpOnly: true
              })
              .cookie('authSession', true, {
                expires: new Date(new Date().getTime() + 30 * 1000),
                sameSite: 'strict'
              })
              .cookie('refreshTokenID', true, {
                expires: new Date(new Date().getTime() + 31557600000),
                sameSite: 'strict'
              })
            // res.status(200)
            .send({result: refreshToken, msg: "signup"})
          }
        } catch (err) {
          res.status(400).send({error: err, msg: err})
        }
      }
        // COMMENT #1

        
    } else {
      console.log('not authenticated');
      return res.status(200).send({ result: "Incorrect", msg: 'Success' });
    }
  };

}

const authController = new Auth();
module.exports = authController;

////////////////COMMENT #1

      // const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '30s' });
      // const refreshToken = jwt.sign({ data: phone }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
      // refreshTokens.push(refreshToken);
      // res
        // .status(202)
        // .cookie('accessToken', accessToken, {
        // 	expires: new Date(new Date().getTime() + 30 * 1000),
        // 	sameSite: 'strict',
        // 	httpOnly: true
        // })
        // .cookie('refreshToken', refreshToken, {
        // 	expires: new Date(new Date().getTime() + 31557600000),
        // 	sameSite: 'strict',
        // 	httpOnly: true
        // })
        // .cookie('authSession', true, { expires: new Date(new Date().getTime() + 30 * 1000), sameSite: 'strict' })
        // .cookie('refreshTokenID', true, {
        // 	expires: new Date(new Date().getTime() + 31557600000),
        // 	sameSite: 'strict'
        // })

        ///////////////COMMENT #1
