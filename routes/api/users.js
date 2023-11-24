const express = require('express');
const User = require('../../schemas/userSchema');
const Notification = require('../../schemas/notificationSchema');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: '/uploads/' });


router.get('/', async (req, res, next) => {
    try {
        let searchObj = req.query;
        console.log(searchObj)
        if (req.query.search !== undefined) {
            searchObj = {
                $or: [
                    { firstname: { $regex: req.query.search, $options: "i" } },
                    { lastname: { $regex: req.query.search, $options: "i" } },
                    { username: { $regex: req.query.search, $options: "i" } }
                ]
            }
        }
        let results = await User.find(searchObj);
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})
router.put('/:userId/follow', async (req, res, next) => {
    try {
        let userId = req.params.userId;
        let user = await User.findById(userId);
        if (!user) {
            return res.sendStatus(404);
        }
        let isFollowing = user.followers && user.followers.includes(req.session.user._id);
        let option = isFollowing ? '$pull' : '$addToSet';

        // Update the following list of the session user
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true });

        // Update the following list of the targeted user
        await User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } }, { new: true })
        res.status(200).send(req.session.user)

        //send the notifications if not followed
        if (!isFollowing) {
            await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
        }


    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})
router.get('/:userId/followers', async (req, res, next) => {
    try {
        let userId = req.params.userId;
        let results = await User.findById(userId).populate("followers");
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

});

router.get('/:userId/following', async (req, res, next) => {
    try {
        let userId = req.params.userId;
        let results = await User.findById(userId).populate("following");
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.post('/coverPhoto', upload.single("croppedImage"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.sendStatus(400)
        }
        let filePath = `/uploads/images/${req.file.filename}.png`;
        console.log(filePath)
        let tempPath = req.file.path;
        console.log(tempPath)
        let targetPath = path.join(__dirname, `../../${filePath}`);
        console.log(targetPath)
        fs.rename(tempPath, targetPath, async (error) => {
            if (error != null) {
                console.log(error)
                return res.sendStatus(400);
            }
            req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })
            res.sendStatus(204);
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }


})
router.post('/profilePicture', upload.single("croppedImage"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.sendStatus(400)
        }
        let filePath = `/uploads/images/${req.file.filename}.png`;
        console.log(filePath)
        let tempPath = req.file.path;
        console.log(tempPath)
        let targetPath = path.join(__dirname, `../../${filePath}`);
        console.log(targetPath)
        fs.rename(tempPath, targetPath, async (error) => {
            if (error != null) {
                console.log(error)
                return res.sendStatus(400);
            }
            req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePicture: filePath }, { new: true })
            res.sendStatus(204);
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }


})

module.exports = router;