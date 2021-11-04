const contactModel = require("../models/userContact");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

class UserContact {


    async getAllUserContact(req, res) {
        try {
                let contacts = await contactModel.find().sort({ createdAt: -1 });
                if(contacts){
                    return res.status(200).json({ result: contacts, msg: "Success"});
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleUserContact(req, res) {
        try {
                    let contact = await contactModel.findById(req.user.contactId)
                    if(contact === null){
                    return res.status(200).json({ result: "No Contacts", msg: "Success"});
                    } else if(contact) {
                      return res.status(200).json({ result: contact, msg: "Success"});
                    }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async createUserContact(req, res) {
        try {
          // let groupName = "Friends";
          // let list = {
          //   "+917020181351":"fida",
          //   "+917020181352":"sharjeel",
          //   "+917020181353":"hassan",
          //   "+917020181355":"aquib"
          // }
            let { groupName, list } = req.body;
            if(!groupName || !list){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {

              let newList = Object.entries(list)
              console.log(typeof newList)
              if (req.user.contactId == null){
                //create New userCOntact
                let newUserContact = new contactModel({
                  userId: req.user._id,
                  groups: {
                    groupName,
                    list: newList
                  }
                })

                await newUserContact.save().then(async (result) => {
                  console.log("New User coNTACT dOC HAS BEEN CREATED Successfully Updating USer...")
                  await User.updateOne({_id: req.user._id}, {$set: {contactId: result._id}})
                  console.log("updated USer")
                  return res.status(200).json({ result: result, msg: "Success"});
              })
              } else {
                // find contactId 
                let contactDoc = await contactModel.findById(req.user.contactId)
                if(!contactDoc || contactDoc === null){
                  console.log("not found Any userContact for provided Id")
                  return res.status(200).json({ result: "No User Contact", msg: "Success"});
                } else {
                  let previousList;
                  let found = contactDoc.groups.some(el => (el.groupName ===groupName))
                  let found2 = contactDoc.groups.some(el => (previousList = el.list))
                  console.log(found)
                  console.log(typeof previousList)
                  let updationList = previousList.concat(newList)
                  console.log(typeof updationList)
                  if(found === true){// update group
                    // await contactModel.updateOne({_id: contactDoc._id}, {$addToSet: {"groups.$[elem].list": values}}, { arrayFilters: [ { "elem.groupName": groupName } ] })
                    await contactModel.updateOne({_id: contactDoc._id}, {$addToSet: {"groups.$[elem].list": {$each: newList}}}, { arrayFilters: [ { "elem.groupName": groupName } ] })
                    return res.status(200).json({ result: "Updated", msg: "Success"});
                  } else { //create new group
                    let newGroup = {
                      groupName: groupName,
                      list: newList
                    }
                    await contactModel.updateOne({_id: contactDoc._id}, {$addToSet: {groups: newGroup}})
                    return res.status(200).json({ result: "New Group Created", msg: "Success"});
                  }
                }
              }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    // async updateCategory(req, res) {
    //     try {
    //         let { contactId } = req.body;
    //         if(!contactId){
    //             return res.status(500).json({ result: "Data Missing", msg: "Error"});
    //         } else {
    //                 const updateOps = {};
    //                 for(const ops of req.body.data){
    //                     updateOps[ops.propName] = ops.value;
    //                 }
    //                 let currentCategory = await categoryModel.updateOne({_id: contactId}, {
    //                   $set: updateOps
    //                 });
    //                   if(currentCategory) {
    //                     return res.status(200).json({ result: currentCategory, msg: "Success" });
    //                   }
    //         }
    //       } catch (err) {
    //         console.log(err)
    //         return res.status(500).json({ result: err, msg: "Error"});
    //       }
    // }

    // async deleteCategory(req, res) {
    //     try {
    //         let { categoryId } = req.body;
    //         if(!categoryId){
    //             return res.status(500).json({ result: "Data Missing", msg: "Error"});
    //         } else {
    //                 let deletedCategory = await categoryModel.deleteOne({_id: categoryId})
    //                   if(deletedCategory) {
    //                     return res.status(200).json({ result: deletedCategory, msg: "Success" });
    //                   }
    //         }
    //       } catch (err) {
    //         console.log(err)
    //         return res.status(500).json({ result: err, msg: "Error"});
    //       }
    // }
}

const userContactController = new UserContact();
module.exports = userContactController;
