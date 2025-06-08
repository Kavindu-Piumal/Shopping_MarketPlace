import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalcontext } from "../provider/globaleProvider";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { PriceWithDiscount } from "../utils/PricewithDiscount";
import { FaRegHandPointRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import AddtoCartButton from "./addtoCartButton";
import emptycart from "../assets/emptycart.png";
import { useNotification } from "../context/NotificationContext";

const DisplayCartItem = ({ close }) => {
  const { showError } = useNotification();
  const { notdiscountTotalPrice, totalPrice, totalQty } = useGlobalcontext();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user=useSelector((state) => state.user);
  const navigate = useNavigate();
  const redirectToCheckOutPage=() => {
    if (user?._id) {      navigate("/checkout");
      if(close) {
        close();
      }
      return;
    }
    showError("Please login to continue");
    navigate("/login");
  }
  

  // Prevent body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <section
      className="z-[9999] fixed top-0 bottom-0 right-0 left-0"
      style={{ backgroundColor: "rgba(64, 64, 64, 0.8)" }}
    >
      <div className="w-full max-w-sm bg-white min-h-screen max-h-screen ml-auto">
        <div className="flex items-center justify-between gap-3 p-4 border-b">
          <h2 className="font-semibold">Cart</h2>

          <Link to={"/"} className="lg:hidden">
            <IoClose size={25} />
          </Link>
          <button onClick={close} className="hidden lg:block ml-auto">
            <IoClose size={25} />
          </button>
        </div>
        <div className="max-h-[calc(100vh-120px)] h-full min-h-[80vh] bg-blue-50 p-2">
          {/* display items */}          {cartItem.filter(item => item && item.productId).length > 0 ? (
            <>
              <div className="flex items-center rounded justify-between px-2 py-2 border-b text-blue-400">
                <p> Your Total Savings</p>
                <p>
                  {DisplayPriceInRupees(notdiscountTotalPrice - totalPrice)}
                </p>
              </div>              <div className="bg-white rounded-lg p-4 mt-2 grid gap-5 overflow-y-auto max-h-[40vh]">
                {cartItem.filter(item => item && item.productId).map((item, index) => {
                    return (
                      <div
                        className="flex items-center justify-between gap-4"
                        key={index}
                      >
                        <div className="w-20 h-20 min-h-16 min-w-16 rounded-lg p-2 grid gap-2">
                          <img
                            src={item?.productId?.image[0]}
                            className="object-scale-down"
                          />
                        </div>
                        <div className="w-full max-w-sm">
                          {" "}
                          <p className="text-xs text-ellipsis line-clamp-2 font-semibold">
                            {item?.productId?.name}
                          </p>
                          <p>{item?.productId?.unit}</p>
                          <p className="text-sm font-semibold">
                            {DisplayPriceInRupees(
                              PriceWithDiscount(
                                item?.productId?.price,
                                item?.productId?.discount
                              )
                            )}
                          </p>
                          {item?.productId?.discount && (
                            <p className="text-gray-500 line-through text-xs">
                              {DisplayPriceInRupees(item?.productId?.price)}
                            </p>
                          )}
                        </div>
                        <div>
                          <AddtoCartButton data={item?.productId} />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="bg-blue-200 p-4">
                <h3 className="font-semibold">Bill Details</h3>
                <div className="flex items-center justify-between gap-4 mt-2 ml-1">
                  <p>Items Total</p>
                  <p className="flex items-center gap-2">
                    <span className="line-through text-neutral-400">
                      {DisplayPriceInRupees(notdiscountTotalPrice)}
                    </span>
                    <span>{DisplayPriceInRupees(totalPrice)}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2 ml-1">
                  <p>Total Quantity</p>
                  <p className="flex items-center gap-2">
                    {totalQty} items
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2 ml-1">
                  <p>Delivery Process</p>
                  <p className="flex items-center gap-2">
                    COD </p>
                    
                </div>

                <div className="flex items-center justify-between gap-4 mt-2 ml-1">
                  <p className="font-semibold">Grand Total</p>
                  <p>{DisplayPriceInRupees(totalPrice)}</p>
                </div>


              </div>
            </>
          ) : (
            <div className="bg-white flex flex-col items-center justify-center">
              <img
                src={emptycart}
                alt="empty cart"
                className="w-full h-full object-scale-down"
              />
              <Link
                to={"/"}
                onClick={close}
                className="block bg-green-500 px-4 rounded py-2 text-white"
              >
                Shop Now
              </Link>
            </div>
          )}
        </div>        {cartItem.filter(item => item && item.productId).length > 0 && (
          <div className="p-2">
            <div className="bg-green-500 px-4 font-bold text-neutral-100 p-2 py-3 static bottom-3 justify-between flex items-center gap-4 ">
              <div>{DisplayPriceInRupees(totalPrice)}</div>
              {
                
              }
              <button onClick={redirectToCheckOutPage} className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
                Procced
                <span>
                  <FaRegHandPointRight className="inline ml-2" size={20} />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DisplayCartItem;
