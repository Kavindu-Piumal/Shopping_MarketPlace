import React from "react";
import { useForm } from "react-hook-form"
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { useNotification } from "../context/NotificationContext";
import { IoClose } from "react-icons/io5";
import { useGlobalcontext } from "../provider/globaleProvider";

const AddAddress = ({close}) => {
    const { register, handleSubmit,reset } = useForm();
    const {fetchAddress} = useGlobalcontext();
    const { showSuccess, axiosNotificationError } = useNotification();

    const onSubmit=async(data) => {
        console.log("data", data);
        try{
            const response = await Axios({
                url: summaryApi.createAddress.url,
                method: summaryApi.createAddress.method,
                data: {
                    address_line: data.addressLine,
                    city: data.city,
                    state: data.state,
                    pincode: data.postalcode,
                    country: data.country,
                    mobile: data.mobile
                }
            });

            const { data: responseData } = response;            if(responseData.success){
                //console.log("responseData", responseData);
                showSuccess(responseData.message);
                if(close){
                    close();
                    reset();
                    fetchAddress();
                }
                //fetchAddress();
            }

        }catch(error){
            //console.log("error", error);
            axiosNotificationError(error);
        }
    }
    
  return (
    <section className="bg-neutral-800 h-screen fixed top-0 left-0 right-0 bottom-0 z-50 bg opacity-90 overflow-auto">
      <div className="bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h2 className=" font-semibold">Add Address</h2>
          <button className="cursor-pointer" onClick={close}><IoClose size={27}/></button>
        </div>
        <form className="mt-4 p-3 grid-gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="addressLine">Address Line :</label>
            <input
              type="text"
              id="addressLine"
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              {
                ...register("addressLine",{required:true })
              }
            />
          </div>
          <div>
            <label htmlFor="city">City :</label>
            <input
              type="text"
              id="city"
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              {
                ...register("city",{required:true })
              }
            />
          </div>
          <div>
            <label htmlFor="state">State :</label>
            <input
              type="text"
              id="state"
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              {
                ...register("state",{required:true })
              }
            />
          </div>
          <div>
            <label htmlFor="country">Country :</label>
            <input
              type="text"
              id="country"
              className="w-full border border-gray-300 rounded p-2 mt-1 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              {
                ...register("country",{required:true })
              }
            />
          </div>
          <div>
            <label htmlFor="postalcode">Postal Code:</label>
            <input
              type="text"
              id="postalcode"
              className="w-full border border-gray-300 rounded p-2 mt-4 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              {
                ...register("postalcode",{required:true })
              }
            />
          </div>
          <div>
            <label htmlFor="mobile">Mobile Number :</label>
            <input
              type="text"
              id="mobile"
              className="w-full border border-gray-300 rounded p-2 mt-4 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              {
                ...register("mobile",{required:true })
              }
            />
          </div>
          <button type="submit" className="bg-primary-200 w-full py-2 font-semibold bg-green-500 text-white rounded mt-4">Submit</button>
        </form>
      </div>
    </section>
  );
};

export default AddAddress;
