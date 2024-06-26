const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt")
router.post("/register",async(req,res)=>{

  /*register*/
    try{
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(req.body.password, salt);
        
        const newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword,
        });

        const user =await newUser.save();
        res.status(200).json(user);
    }
    catch(err){
       // console.log(err)
       res.status(500).json(err)

    }
    });

    /*login*/
    router.post("/Login", async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json("user not found");
            }
    
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(400).json("wrong password");
            }
    
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    });



module.exports = router
