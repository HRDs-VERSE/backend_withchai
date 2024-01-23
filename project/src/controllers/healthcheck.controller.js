import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
// import { User } from "../models/user.model.js";
// import { Tweet } from "../models/tweet.model.js";
// import mongoose, { isValidObjectId } from "mongoose";
// import ApiError from "../utils/apiError.js";

const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, { message: "Everything is O.K" }, "Ok"));
});

export { healthcheck };