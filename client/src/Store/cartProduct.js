import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cartItem",
  initialState: initialState,
  reducers: {
    handleAdditemCart: (state, action) => {
      state.cart = [...action.payload];
    },
  },
});

export const { handleAdditemCart } = cartSlice.actions;
export default cartSlice.reducer;
