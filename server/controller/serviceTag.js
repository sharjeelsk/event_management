const ServiceTag = require("../models/serviceTag");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


class serviceTag {


    async getAllTag(req, res) {
        try {
                let tags = await ServiceTag.find({}).sort({ createdAt: -1 });
                if(tags){
                    return res.status(200).json({ result: tags, msg: "Success"});
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleTag(req, res) {
        try {
            let { tagId } = req.body;
            if(!tagId) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let tags = await ServiceTag.findById(tagId)
                    if(tags){
                        return res.status(200).json({ result: tags, msg: "Success"});
                    }
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async createTag(req, res) {
        try {
            let { name, type, subType} = req.body;
            if(!name || !type || !subType){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let newTag = new ServiceTag({
                        name,
                        type,
                        subType
                    })
                    await newTag.save().then((result) => {
                        console.log("ServiceTag Created Successfully")
                        return res.status(200).json({ result: result, msg: "Success"});
                    })
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateTag(req, res) {
        try {
            let { tagId } = req.body;
            if(!tagId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    const updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    let currentTag = await ServiceTag.updateOne({_id: tagId}, {
                      $set: updateOps
                    });
                      if(currentTag) {
                        return res.status(200).json({ result: currentTag, msg: "Success" });
                      }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async deleteTag(req, res) {
        try {
            let { tagId } = req.body;
            if(!tagId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let deletedTag = await ServiceTag.deleteOne({_id: tagId})
                      if(deletedTag) {
                        return res.status(200).json({ result: deletedTag, msg: "Success" });
                      }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const sTagController = new serviceTag();
module.exports = sTagController;
