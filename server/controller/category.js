const categoryModel = require("../models/category");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


class Category {


    async getAllCategory(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
                let categories = await categoryModel.find({}).sort({ createdAt: -1 });
                if(categories){
                    return res.status(200).json({ result: categories, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleCategory(req, res) {
        try {
            let { categoryId } = req.body;
            if(!categoryId) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user){
                    let category = await categoryModel.findById(categoryId)
                    if(category){
                    return res.status(200).json({ result: category, msg: "Success"});
                    } else {
                        return res.status(200).json({ result: "Not Found", msg: "Success"});
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


    async createCategory(req, res) {
        try {
            let { name } = req.body;
            if(!name){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let newName = name.charAt(0).toUpperCase() + name.slice(1);
                    let newCatgeory = new categoryModel({
                        name: newName,
                        user: user._id
                    })
                    await newCatgeory.save().then((result) => {
                        console.log("Category Created Successfully")
                        return res.status(200).json({ result: result, msg: "Success"});
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

    async updateCategory(req, res) {
        try {
            let { categoryId } = req.body;
            if(!categoryId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    const updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    console.log(updateOps)
                
                    let currentCategory = await categoryModel.updateOne({_id: categoryId}, {
                      $set: updateOps
                    });
                      if(currentCategory) {
                        return res.status(200).json({ result: currentCategory, msg: "Success" });
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

    async deleteCategory(req, res) {
        try {
            let { categoryId } = req.body;
            if(!categoryId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let deletedCategory = await categoryModel.deleteOne({_id: categoryId})
                      if(deletedCategory) {
                        return res.status(200).json({ result: deletedCategory, msg: "Success" });
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

const categoryController = new Category();
module.exports = categoryController;
