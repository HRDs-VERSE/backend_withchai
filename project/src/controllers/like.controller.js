import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(400, "Something went wrong while getting video id for like")
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
    const {commentId} = req.params
    
    if (!commentId) {
        throw new ApiError(400, "Something went wrong while getting video id for like")
    }

    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully"))
    }

    
        
    await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

    return res 
        .status(200)
        .json(new ApiResponse(200, "tweet liked Successfully"))
    

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    if (!tweetId) {
        throw new ApiError(400, "Something went wrong while getting video id for like")
    }

    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully"))
    }

    
        
    await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

    return res 
        .status(200)
        .json(new ApiResponse(200, "tweet liked Successfully"))
    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}