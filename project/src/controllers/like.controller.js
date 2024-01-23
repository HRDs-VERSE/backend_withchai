import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Something went wrong while getting video id for like")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video found by this video Id")
    }

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully"))
    }



    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, "Video liked Successfully"))


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Something went wrong while getting video id for like")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "No comment found by this comment Id")
    }

    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(new ApiResponse(200, "Comment unliked successfully"))
    }



    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment liked Successfully"))


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Something went wrong while getting video id for like")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "No tweet found by this tweet Id")
    }

    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(new ApiResponse(200, "Tweet unliked successfully"))
    }



    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet liked Successfully"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.aggregate([

        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "userDetails"
                        }
                    },
                    {
                        $unwind: "$userDetails"
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideos"
        },
        {
            $sort: { createdAt: -1 } // Specify the field to sort on and the direction (descending)
        },
        {
            $project: {
                _id: 0,
                likedVideos: {
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    "videoFile.url": 1,
                    "thumbNail.url": 1,
                    userDetails: {
                        username: 1,
                        fullName: 1,
                        email: 1,
                        avatar: 1
                    }
                }
            }
        }
    ])

    if (likedVideos.length === 0) {
        return res.status(404).json(
            new ApiResponse(
                404,
                null,
                `No Liked video found for User`
            )
        );
    }
    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked Videos fetched successfully"))


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}