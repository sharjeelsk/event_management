const Admin = require('../models/admin');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');


class AdminClass{
    async getUser (req,res){
        res.send("home routre user")
    }

    async signUp (req,res){
        if(!req.body.email || !req.body.password){
            res.status(400).json({msg:"data missing"})
        }else{
            const presentUser = await Admin.find({email:req.body.email})
            console.log(presentUser)
            var hash = bcrypt.hashSync(req.body.password, 10);
            if(presentUser.length===0){
                const user = new Admin ({
                    email:req.body.email,
                    password:hash,
                })
               let responseOfUser = await user.save()
               console.log(responseOfUser)
               let token = jwt.sign({ admin: req.body.email,_id:responseOfUser._id }, process.env.ACCOUNT);
               res.status(201).json({msg:"user saved successfully",token})
            }else{
                res.status(200).json({msg:"user already exist"})
            }
        }
        
    }

    async logIn (req,res){
        if(!req.body.email || !req.body.password){
            res.status(400).json({msg:"data missing"})
        }else{
            const presentUser = await Admin.findOne({email:req.body.email})
            if(!presentUser){
                res.status(400).json({msg:"User doesn't exists"})
            }else{
                bcrypt.compare(req.body.password, presentUser.password, function(err, response) {
                    if(response){
                        let token = jwt.sign({admin:req.body.email,_id:presentUser._id},process.env.ACCOUNT)
                        res.status(200).json({msg:"success",token})
                    }else{
                        res.status(400).json({msg:"incorrect password"})
                    }
                });
                
            }
        }
    }
}

const adminController = new AdminClass();
module.exports=adminController;