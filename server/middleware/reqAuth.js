const User = require("../models/user");
const jwt = require("jsonwebtoken");
module.exports.isAuthorized  = function(req, res, next) {
    let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
    User.findOne({mobileNo: decoded.data}).then((user) => {
        req.user = user  
            if (user === null) {     
                return res.status(401).json({ result: "Unauthorised", msg: "Error"});
            } else {
                req.user = user
                return next();
            }
    })
    .catch((err) => {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      })
}