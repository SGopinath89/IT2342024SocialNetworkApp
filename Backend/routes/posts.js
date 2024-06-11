const express = require('express');
const mongoose = require('mongoose');
const router = require("express").Router();
const User = require('../models/User');
const Post = require("../models/Post");

//Create a post
router.post("/",async(req,res)=>{
  const newPost = new Post(req.body)
  try{
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  }catch(err){
    res.status(500).json(err)
  }
});

//Update
router.put("/:id",async(req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId){
      await post.updateOne({$set:req.body});
      res.status(200).json("The post has been updated")
    }else{
      res.status(403).json("you can update only your post");
    }}catch(err){
    res.status(500).json(err);
  }
});

//Like a post
router.put("/:id/like",async(req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post.likes.includes(req.body.userId)){
      await post.updateOne({ $push: {likes: req.body.userId}});
      res.status(200).json("The post has been lliked");
    }else{
      await post.updateOne({$pull: {likes: req.body.userId}});
      res.status(200).json("The post has been disliked");
    }
  } catch(err){
    res.status(500).json(err);
  }
})

//Get a post by Id

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(id);

        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err });
    }
});

//get timeline posts

router.get("/timeline/all", async (req, res) => {
    try {
       
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

       
        const userPosts = await Post.find({ userId: currentUser._id });

        
        const friendPostsPromises = currentUser.followings.map(async (friendId) => {
            return Post.find({ userId: friendId });
        });

        const friendPosts = await Promise.all(friendPostsPromises);

        
        const allFriendPosts = friendPosts.flat();

        
        const allPosts = [...userPosts, ...allFriendPosts];

        res.json(allPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;
