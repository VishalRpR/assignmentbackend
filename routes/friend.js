const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ error: "Access denied" });

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
};

// Search for users
router.get("/search/:username", verifyToken, async (req, res) => {
    const users = await User.find({
        username: { $regex: req.params.username, $options: "i" },
    }).select("username email");
    res.json(users);
});

// Send a friend request
router.post("/add/:userId", verifyToken, async (req, res) => {
    const sender = req.user.id;
    const receiver = await User.findById(req.params.userId);

    if (!receiver) return res.status(404).json({ error: "User not found" });

    receiver.friendRequests.push(sender);
    await receiver.save();
    res.json({ message: "Friend request sent" });
});

// Accept or reject friend request
router.post("/accept/:userId", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.userId);

    if (!friend) return res.status(404).json({ error: "User not found" });

    user.friends.push(friend._id);
    friend.friends.push(user._id);
    user.friendRequests = user.friendRequests.filter(id => id !== req.params.userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend request accepted" });
});



router.get("/recommendations", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id).populate("friends");
    const friendIds = user.friends.map(f => f._id);

    const recommendations = await User.find({
        _id: { $nin: [...friendIds, req.user.id] },
        friends: { $in: friendIds },
    }).limit(5);

    res.json(recommendations);
});


module.exports = router;
