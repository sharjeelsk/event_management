const categoryModel = require("../models/category");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


class Category {


    async getAllCategory(req, res) {
        try {
                let categories = await categoryModel.find().sort({ createdAt: -1 });
                if(categories){
                    return res.status(200).json({ result: categories, msg: "Success"});
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
                    let category = await categoryModel.findById(categoryId)
                    if(category){
                    return res.status(200).json({ result: category, msg: "Success"});
                    }
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async createCategory(req, res) {
        try {
            let { _id, name, approximation, currency} = req.body;
            if(!name || !_id || !approximation || !currency){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    categoryModel.findOne({_id: _id})
                    .then((category) => {
                      if(!category || category === null){
                        let newName = name.charAt(0).toUpperCase() + name.slice(1);
                        let newCatgeory = new categoryModel({
                        name: newName,
                        approximation,
                        currency
                    })
                    newCatgeory.save().then((result) => {
                        console.log("Category Created Successfully")
                        return res.status(200).json({ result: result, msg: "Success"});
                    }) //xyz
                    } else {
                      categoryModel.updateOne({_id: _id}, {$set: {name, approximation, currency}})
                      .then((result) => {
                        return res.status(200).json({ result: result, msg: "Success"});
                      })
                    }
                })
                    
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
                    const updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    let currentCategory = await categoryModel.updateOne({_id: categoryId}, {
                      $set: updateOps
                    });
                      if(currentCategory) {
                        return res.status(200).json({ result: currentCategory, msg: "Success" });
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
                    let deletedCategory = await categoryModel.deleteOne({_id: categoryId})
                      if(deletedCategory) {
                        return res.status(200).json({ result: deletedCategory.deletedCount, msg: "Success" });
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
