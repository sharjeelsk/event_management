const ServiceModel = require("../models/service");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


class Service {


    async getAllServices(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
                let services = await ServiceModel.find({})
              // .populate()
              .sort({ _id: -1 });
            if (services) {
              return res.status(200).json({ result: services, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleService(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
                let {serviceId} = req.body
                let services = await ServiceModel.findOne({_id: serviceId})
              // .populate()
            if (services) {
              return res.status(200).json({ result: services, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getUserService(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data}).populate("myServices");
            if(user){
                return res.status(200).json({ result: user.myServices, msg: "Success"});
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async createService(req, res) {
        try {
            let { name, vendorId, mobileNo, email, address, type, subType,price, description} = req.body;
            if(!name || !vendorId || !mobileNo || !email || ! address || !type || !subType || !price || !description){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let service = new ServiceModel({
                        name,
                        vendorId,
                        mobileNo,
                        email,
                        address,
                        type,
                        subType,
                        price,
                        description
                    })
                    await service.save().then(async(result) => {
                        console.log("Service Created Successfully... Updating User Services...")
                        await User.updateOne({mobileNo: decoded.data}, {$push: {myServices: result._id}})
                        .then( user => {
                            console.log("User Updated Successfully")
                            return res.status(200).json({ result: result, msg: "Success"});
                        })
                    })
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateService(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let { serviceId } = req.body;
            let user = await User.findOne({mobileNo: decoded.data});
            if(user) {
                if(!serviceId){
                    return res.status(500).json({ result: "Data Missing", msg: "Error"});
                } else {
                    let updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    console.log(updateOps)
                    let currentService = await ServiceModel.updateOne({_id: serviceId}, {
                        $set: updateOps
                      });
                        if(currentService) {
                          return res.status(200).json({ result: currentService, msg: "Success" });
                        }
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async deleteService(req, res) {
        try {
            let { serviceId } = req.body;
            if(!serviceId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let deletedService = await ServiceModel.deleteOne({_id: serviceId})
                      if(deletedService) {
                        return res.status(200).json({ result: deletedService, msg: "Success" });
                      }
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const serviceController = new Service();
module.exports = serviceController;
