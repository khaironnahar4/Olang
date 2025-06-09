import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecomendedUsers(req, res) {
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recomendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId }}, // exclude current user
                { _id: { $nin: currentUser.friends}}, // exclude current user's friend
                { isOnboarded: true }
            ]
        })

        res.status(200).json(recomendedUsers)

    } catch (error) {
        console.error("Error fetching recommended users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user._id).select('friends')
        .populate('friends', 'fullName profilePicture nativeLanguage learningLanguage');

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const {id: recipientId} = req.params;

        // prevent sending friend request to you
        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }

        const recipient = await User.findById(recipientId);

        if(!recipient) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        if(recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user." });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sender: myId, recipient: recipientId},
                {sender: recipientId, recipient: myId}
            ]
        })

        if(existingRequest) {
            return res.status(400).json({ message: `Friend request already exists between you and ${recipient.fullName}.`});
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        })

        res.status(201).json(friendRequest);
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id: requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        // verify the current user is the recipient of the request
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request." });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        // add each other to friends list
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender } 
        });

        res.status(200).json({ message: "Friend request accepted successfully." });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: 'pending'
        }).populate('sender', 'fullName profilePicture nativeLanguage learningLanguage');

        const acceptedRequests = await FriendRequest.find({
            sender: req.user.id,
            status: 'accepted'
        }).populate('recipient', 'fullName profilePicture');

        res.status(200).json({
            incomingRequests,
            acceptedRequests
        });

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending"
        }).populate("recipient", "fullName profilePicture nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}