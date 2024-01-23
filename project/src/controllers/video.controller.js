import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // for using Full Text based search u need to create a search index in mongoDB atlas
    // you can include field mapppings in search index eg.title, description, as well
    // Field mappings specify which fields within your documents should be indexed for text search.
    // this helps in seraching only in title, desc providing faster search results
    // here the name of search index is 'search-videos'
    if (query) {
        pipeline.push({
            $search: {
                index: "searchVideos",
                text: {
                  query: query,
                  path: ["description", "title"]
                }
              }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // fetch videos only that are set isPublished as true
    pipeline.push({ $match: { isPublished: true } });

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});  

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbNailLocalPath = req.files?.thumbNail[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFileLocalPath is required");
    }
    
    if (!thumbNailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbNail = await uploadOnCloudinary(thumbNailLocalPath);
    
    if (!videoFile) {
        throw new ApiError(400, "Video file not found");
    }

    if (!thumbNail) {
        throw new ApiError(400, "Thumbnail not found");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbNail: {
            url: thumbNail.url,
            public_id: thumbNail.public_id
        },
        owner: req.user?._id,
        isPublished: true
    });

    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
      throw new ApiError(404, "video Id not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video find by this Id")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Founded successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"invalid video Id")
    }

    if (!(title && description)) {
        throw new ApiError(400, "title and description is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    // console.log(video.owner.toString())

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Unauthorized to update data of video")
    }

    const thumbNailToDelete = video.thumbNail?.public_id

    const thumbNailLocalPath = req.file?.path


    if (!thumbNailLocalPath) {
        throw new ApiError(400, "thumNail missing")
    }

    const thumbNail = await uploadOnCloudinary(thumbNailLocalPath);

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbNail:{
                    url: thumbNail.url,
                    public_id: thumbNail.public_id
                }
            }
        },
        {new: true}
    )

    if (!updateVideo) {
        throw new ApiError(500, "Something went wrong while updating document")
    }

    if (updateVideo) {
        await deleteFromCloudinary(thumbNailToDelete)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(500, "videoId missing")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No video found by this Id")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Unauthorized to update data of video")
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new ApiError(500, "Something went wrong while deleting Video")
    }
    await deleteFromCloudinary(video.videoFile.public_id)
    await deleteFromCloudinary(video.thumbNail.public_id)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Something went wrong while getting videoId")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError("Video not found by this Id")
    }

    if (video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only video owner allowed to do this change")
    }

    const toggeledVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video?.isPublished
            }
        },
        {new: true}
    )

    if (!toggeledVideo) {
        throw new ApiError(500, "Somwthing went wrong while toggeling the video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {isPublished: video.isPublished} ,"Video toggeled"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}