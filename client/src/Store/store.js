import { configureStore } from '@reduxjs/toolkit'
import userReducer from './UserSlice'
import productReducer from './ProductSlice'
import cartReducer from './cartProduct'
import addressReducer from './Address.slice'
import orderReducer from './OrderSlice'


export const store = configureStore({
  reducer: {
    user: userReducer,
    product : productReducer,
    cartItem:cartReducer,
    addresses :addressReducer,
    orders:orderReducer

    
  },
})

export default store