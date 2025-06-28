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

  // No longer needed since we have cart buttons in:
  // - Header for desktop
  // - Mobile bottom navigation for mobile
  return null;
};

export default CartMobileLink;
