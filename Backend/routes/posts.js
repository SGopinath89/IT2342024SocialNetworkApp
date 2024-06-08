const router = require("express").Router();
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

//Get a post

router.get("/:id",async(req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  }catch(err){
    res.status(500).json(err);
  }
})


module.exports = router;
