import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from  "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) =>{
    // res.status(200).json({
    //     message: "ok"
    // })

    const {fullName, email, username, password} = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "all fields are required")
    }

    if (!email.includes('@')) {
        throw new ApiError(400, 'Enter a valid email');
    }   

    const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        
    if (existedUser){
        throw new ApiError(409, "User already existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImagePath = req.files?.coverImage[0]?.path
    console.log('done')

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const  avatar = await uploadOnCloudinary(avatarLocalPath)
    const  coverImage = await uploadOnCloudinary(coverImagePath)
    
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(400, "something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


})

export {registerUser}