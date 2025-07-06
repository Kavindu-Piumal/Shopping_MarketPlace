import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddresscontroller = async (req, res) => {
    try{
        const userId= req.userId;
        const { address_line, city, state, pincode, country, mobile } = req.body;

        const newAddress = new AddressModel({
            address_line,
            city,
            state,
            pincode,
            country,
            mobile,
            userId : userId
        });

        const savedAddress = await newAddress.save();
        const addUserAddress = await UserModel.findByIdAndUpdate(
            userId,
            { $push: { address_details: savedAddress._id } }
        );

        return res.status(200).json({
            message: "Address added successfully",
            data: savedAddress,
            error: false,
            success: true
        });

       

    }catch(error){
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }

}

export const getAddressController = async (req, res) => {
    try{
        const userId = req.userId;
        const addressDetails = await AddressModel.find({ userId: userId });

        return res.status(200).json({
            message: "Address fetched successfully",
            data: addressDetails,
            error: false,
            success: true
        });

    }catch(error){
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const updateAddressController = async (req, res) => {
    try{
        const userId = req.userId;
        
        const { _id, address_line, city, state, pincode, country, mobile } = req.body;

        const updatedAddress = await AddressModel.updateOne({
            _id: _id , userId: userId},
            { address_line, city, state, pincode, country, mobile },
            
        );

        return res.status(200).json({
            message: "Address updated successfully",
            data: updatedAddress,
            error: false,
            success: true
        });

    }catch(error){
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const deleteAddressController = async (req, res) => {
    try{
        const userId = req.userId;
        const { _id } = req.body;

        

        const disableAddress = await AddressModel.updateOne({ _id: _id, userId },{
            status: false
        });

        return res.status(200).json({
            message: "Address Removed successfully",
            data: disableAddress,
            error: false,
            success: true
        });

    }catch(error){
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}