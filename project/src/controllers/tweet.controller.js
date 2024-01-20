import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body


    if (!content) {
        throw new ApiError(400, "Tweet is empty")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet Created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "Something went wrong while getting User Id")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "No user found by this Id")
    }


    const userTweets = await Tweet.aggregate([

        {
            $match: {
              owner: new mongoose.Types.ObjectId(userId)
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "User"
            }
          },
          {
            $unwind: "$User"
          },
          {
            $group: {
              _id: null,
              content: { $push: "$content" },
              User: { $first: "$User" }
            }
          },
          {
            $project: {
              _id: 0,
              content: 1,
              User: {
                fullName: 1,
                avatar: 1,
                email: 1,
                username: 1
              }
            }
          }
    ])

    if (userTweets.length === 0) {
        return res.status(404).json(
            new ApiResponse(
                404,
                null,
                `No Tweets found for User ${user.username}`
            )
        );
    }
    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "Tweets fetched successfully"))


})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { tweetId } = req.params

    if (!content) {
        throw new ApiError(400, "Tweet can not be empty")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Something went wrong while getting tweetId")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "No tweet found by this tweetId")
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to update anotherone Tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    );


    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError("Something went wrong while getting TweetId")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "No tweet found by this tweetId")
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to update anotherone Tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new ApiError("Something went wrong while deleting Tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}