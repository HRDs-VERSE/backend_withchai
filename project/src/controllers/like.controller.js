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
            $group: {
                _id: "$video"
            }
        },
        {
            $unwind: "$_id"
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "_id",
                as: "videoData"
            }
        },
        {
            $unwind: "$videoData"
        },
        {
            $project: {
                _id: 1,
                videoData: {
                    videoFile: 1,
                    title: 1,
                    description: 1,
                    isPublished: 1,
                    duration: 1,
                    thumbNail: 1
                }
            }
        }
    ])

    if (likedVideos.length === 0) {
        return res.status(404).json(
            new ApiResponse(
                404,
                null,
                `No Liked found for User`
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