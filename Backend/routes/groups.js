const express = require('express');
const mongoose = require('mongoose');
const GroupPost = require('../models/Group');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.post("/upload",async(req,res)=>{
    
  const newGroup = new GroupPost(req.body)
  try{
      const savedPost = await newGroup.save();
      res.status(200).json(savedPost);
  }catch(err){
      res.status(500).json(err)
  }
})

module.exports = router;
