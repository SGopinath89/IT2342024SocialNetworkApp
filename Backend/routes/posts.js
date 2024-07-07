const router = require("express").Router();
const Post = require("../models/Post");
const {verifyToken}=require("../Security/autho")
const mongoose=require("mongoose")
const Share=require("../models/share")
const Bookmark=require("../models/bookmark");


//Create a post
const multer=require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', verifyToken, upload.single('img'), async (req, res) => {
    const { description } = req.body;
    const userId = req.user.id; 

    try {
        const imgPath = req.file ? req.file.path : '';

        const newPost = new Post({
            userId,
            desc: description,
            img: imgPath
        });

        const savedPost = await newPost.save();
        res.status(200).json({ message: 'File uploaded successfully', post: savedPost });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/all', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Like a post
router.put('/like/:postId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user already liked the post
        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({ message: 'Post already liked' });
        }

        post.likes.push(req.user.id);
        await post.save();
        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Comment on a post
router.post('/comment/:postId', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.postId;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            text,
            postedBy: userId
        };

        post.comments.push(newComment);
        await post.save();

        res.status(200).json({ message: 'Comment added successfully', post });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:postId', verifyToken, async (req, res) => {
    const postId = req.params.postId;

    try {
        // Check if the post exists
        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is authorized to delete the post
        if (post.userId !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
});

//to edit the upload post
router.put('/:postId', verifyToken, upload.single('img'), async (req, res) => {
    try {
        const postId = req.params.postId;
        const { description } = req.body;
        const img = req.file ? req.file.path : null;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.desc = description || post.desc; 
        post.img = img || post.img; 
        post.updatedAt = Date.now();

        const updatedPost = await post.save();
        res.json({
            message: 'Post updated successfully',
            post: updatedPost
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post' });
    }
});

router.get("/:id",verifyToken, async (req, res) => {
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

//to share
router.post('/share', verifyToken, async (req, res) => {
    try {
      const { postId } = req.body;
      const userIdToShareWith = req.user.id;
      const share = new Share({
        userId: userIdToShareWith,
        itemId: postId,
        itemModel: 'Post'
      });
      await share.save();
      res.status(201).json({ message: 'Post shared successfully' });
    } catch (error) {
      console.error('Error sharing post:', error.message);
      res.status(500).json({ message: 'Error sharing post', error: error.message });
    }
  });

  router.post('/bookmarks', verifyToken, async (req, res) => {
    const { postId} = req.body;
    const userId = req.user.id;

    console.log('Received userId:', userId);
    console.log('Received eventId:', postId);

    if (!userId || !postId) {
        return res.status(400).json({ error: 'User ID and post ID are required' });
    }

    try {
        const result = await Bookmark.create({ userId, itemId: postId, itemModel: 'Post' });
        console.log('Bookmark created:', result);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error creating bookmark:', error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports=router;
