import React from "react";
import { useGlobalcontext } from "../provider/globaleProvider";
import { MdAddShoppingCart } from "react-icons/md";
import { DisplayPriceInRupees } from "../utils/displaypriceinrupees";
import { Link } from "react-router-dom";
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from "react-redux";

const CartMobileLink = () => {
  const { totalPrice, totalQty } = useGlobalcontext();
  const cartItem = useSelector((state) => state.cartItem.cart);
  // console.log("totalQty:", totalQty, "totalPrice:", totalPrice);

  return (
    <>
      {cartItem[0] && (
        <div className="sticky bottom-4 p-2">
          <div className="bg-green-400 p-6 rounded flex items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white p-2 bg-green-300 rounded w-fit">
                <MdAddShoppingCart />
              </div>
              <div className="text-xs">
                <p>{totalQty} items</p>
                <p>{DisplayPriceInRupees(totalPrice)}</p>
              </div>
            </div>

            <Link
              to={"/cart"}
              className="flex items-center justify-between mt-2 text-white"
            >
              <span>View Cart</span>
              <FaCaretRight className="inline ml-2" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default CartMobileLink;
