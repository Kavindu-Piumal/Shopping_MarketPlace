export const baseURL = import .meta.env.VITE_API_URL || "http://localhost:5000";

const summaryApi = {
  register: {
    url: `${baseURL}/api/user/register`, // Use full URL
    method: "post"
  },
  login: {
        url: `${baseURL}/api/user/login`, // Use full URL
        method: "post"
    },
  forgotPassword: {
        url: `${baseURL}/api/user/forgot-password`, // Use full URL
        method: "put"
    },
    forgot_password_otpverify:{
        url: `${baseURL}/api/user/verify-forgot-password-otp`, // Use full URL
        method: "put"
    },
  resetPassword: {
        url: `${baseURL}/api/user/reset-password`, // Use full URL
        method: "put"
    },
    refreshToken: {
        url: `${baseURL}/api/user/refresh-token`, // Use full URL
        method: "post"

    },
    userDetails: {
        url: `${baseURL}/api/user/user-details`, // Use full URL
        method: "get"
    },
    logout: {
        url: `${baseURL}/api/user/logout`, // Use full URL
        method: "get",
    },
    uploadAvatar: {
        url: `${baseURL}/api/user/upload-avatar`, // Use full URL
        method: "put"
    },
    updateUserDetails: {
        url: `${baseURL}/api/user/update-user`, // Use full URL
        method: "put"
    },
    addCategory: {
        url: `${baseURL}/api/category/add-category`, // Use full URL
        method: "post"
    },
    uploadImage: {
        url: `${baseURL}/api/file/upload`, // Use full URL
        method: "post",
    },
    getCategory: {
        url: `${baseURL}/api/category/get`, // Use full URL
        method: "get"
    },
    updateCategory: {
        url: `${baseURL}/api/category/update`, // Use full URL
        method: "put"
    },
    deleteCategory: {
        url: `${baseURL}/api/category/delete`, // Use full URL
        method: "delete"
    },
    createSubCategory: {
        url: `${baseURL}/api/subcategory/create`, // Use full URL
        method: "post"
    },
    getSubCategory: {
        url: `${baseURL}/api/subcategory/get`, // Use full URL
        method: "post"
    },
    updateSubCategory: {
        url: `${baseURL}/api/subcategory/update`, // Use full URL
        method: "put"
    },
    deleteSubCategory: {
        url: `${baseURL}/api/subcategory/delete`, // Use full URL
        method: "delete"
    },
    createProduct:{
        url: `${baseURL}/api/product/create`, // Use full URL
        method: "post"
    },
    getProduct:{
        url: `${baseURL}/api/product/get`, // Use full URL
        method: "post"
    },
    getProductbyCategory:{
        url: `${baseURL}/api/product/getproductby-category`, // Use full URL
        method: "post"
    },
    getproductbyCategoryandSubCategory:{
        url: `${baseURL}/api/product/getproductby-category-and-subcategory`, // Use full URL
        method: "post"
    },
    getProductDetails:{
        url: `${baseURL}/api/product/getproductdetails`, // Use full URL
        method: "post"
    },
    updateProductDetails:{
        url: `${baseURL}/api/product/update-product-details`, // Use full URL
        method: "put"
    },
    deleteProductDetails:{
        url: `${baseURL}/api/product/delete-product`, // Use full URL
        method: "delete"
    },
    searchProducts:{
        url: `${baseURL}/api/product/search-product`, // Use full URL
        method: "post"
    },
    addToCart: {
        url: `${baseURL}/api/cart/create`, // Use full URL
        method: "post"
    },
    getCartItem: {
        url: `${baseURL}/api/cart/get`, // Use full URL
        method: "get"
    },
    UpdateCartItem:{
        url: `${baseURL}/api/cart/update-qty`,
        method: "put"
    },
    deleteCartItem:{
        url:`${baseURL}/api/cart/delete-cart-item`,
        method: "delete"
    },
    createAddress:{
        url: `${baseURL}/api/address/create`, // Use full URL
        method: "post"
    },
    getAddress:{
        url: `${baseURL}/api/address/get`, // Use full URL
        method: "get"
    },
    updateAddress:{
        url: `${baseURL}/api/address/update`, // Use full URL
        method: "put"
    },
    disableAddress:{
        url: `${baseURL}/api/address/disable`, // Use full URL
        method: "delete"
    },
    Cashondelivery:{
        url: `${baseURL}/api/order/cash-on-delivery`, // Use full URL
        method: "post"
    },    getorderDetails :{
        url: `${baseURL}/api/order/order-list`, // Use full URL
        method: "get"
    },
    getSellerOrders: {
        url: `${baseURL}/api/order/seller-orders`, // Use full URL
        method: "get"
    },
    confirmOrder: {
        url: `${baseURL}/api/order/confirm`, // Use full URL + orderId
        method: "put"
    },
    updateOrderStatus: {
        url: `${baseURL}/api/order/status`, // Use full URL + orderId
        method: "put"
    },
    becomeSeller: {
        url: `${baseURL}/api/user/become-seller`,
        method: "post"
    },
    getMySubCategories: {
        url: `${baseURL}/api/subcategory/my-subcategories`,
        method: "get"
    },
    getMyProducts: {
        url: `${baseURL}/api/product/my-products`,
        method: "get"
    },    getMyCategories: {
        url: `${baseURL}/api/category/my-categories`,
        method: "get"
    },    // Chat APIs
    createChat: {
        url: `${baseURL}/api/chat/create`,
        method: "post"
    },
    createProductChat: {
        url: `${baseURL}/api/chat/create-product-chat`,
        method: "post"
    },
    getUserChats: {
        url: `${baseURL}/api/chat/user-chats`,
        method: "get"
    },
    sendMessage: {
        url: `${baseURL}/api/chat/send-message`,
        method: "post"
    },
    getChatMessages: {
        url: `${baseURL}/api/chat/messages`,
        method: "get"
    },    completeOrder: {
        url: `${baseURL}/api/chat/complete-order`,
        method: "post"
    },
    confirmChatOrder: {
        url: `${baseURL}/api/chat/confirm-order`,
        method: "post"
    },
    getOrderDetails: {
        url: `${baseURL}/api/chat/order-details`,
        method: "get"
    },
    deleteChat: {
        url: `${baseURL}/api/chat/delete`,
        method: "delete"
    },    getAdminChatHistory: {
        url: `${baseURL}/api/chat/admin/history`,
        method: "get"
    },
    // Review APIs
    addReview: {
        url: `${baseURL}/api/review/add`,
        method: "post"
    },
    getProductReviews: {
        url: `${baseURL}/api/review/product`,
        method: "get"
    },
    canUserReview: {
        url: `${baseURL}/api/review/can-review`,
        method: "get"
    },
    updateReview: {
        url: `${baseURL}/api/review/update`,
        method: "put"
    },    deleteReview: {
        url: `${baseURL}/api/review/delete`,
        method: "delete"
    },
    // Shop Review APIs
    addShopReview: {
        url: `${baseURL}/api/shop-review/add`,
        method: "post"
    },
    getShopReviews: {
        url: `${baseURL}/api/shop-review/shop`,
        method: "get"
    },
    canUserReviewShop: {
        url: `${baseURL}/api/shop-review/can-review`,
        method: "get"
    },
    updateShopReview: {
        url: `${baseURL}/api/shop-review/update`,
        method: "put"
    },
    deleteShopReview: {
        url: `${baseURL}/api/shop-review/delete`,
        method: "delete"
    },
    getShopReviewStats: {
        url: `${baseURL}/api/shop-review/stats`,
        method: "get"
    },
    // Shop APIs
    createShop: {
        url: `${baseURL}/api/shop/create`,
        method: "post"
    },
    getAllShops: {
        url: `${baseURL}/api/shop/all`,
        method: "get"
    },
    getShopById: {
        url: `${baseURL}/api/shop`,
        method: "get"
    },
    getMyShop: {
        url: `${baseURL}/api/shop/my/shop`,
        method: "get"
    },    updateShop: {
        url: `${baseURL}/api/shop/update`,
        method: "put"
    },
    updateShopStatus: {
        url: `${baseURL}/api/shop/update-status`,
        method: "put"
    },    getShopCategories: {
        url: `${baseURL}/api/shop/categories`,
        method: "get"
    },
    // New shop management APIs
    getShopLifecycleInfo: {
        url: `${baseURL}/api/shop/my/lifecycle`,
        method: "get"
    },
    uploadShopImage: {
        url: `${baseURL}/api/shop/upload-image`,
        method: "put"
    },
    deactivateShop: {
        url: `${baseURL}/api/shop/deactivate`,
        method: "put"
    },
    reactivateShop: {
        url: `${baseURL}/api/shop/reactivate`,
        method: "put"
    },
    deleteShop: {
        url: `${baseURL}/api/shop/delete`,
        method: "delete"
    },// Test endpoints
    testGetAllShops: {
        url: `${baseURL}/api/test/test-shops`,
        method: "get"
    },
    activateAllShops: {
        url: `${baseURL}/api/test/activate-all-shops`,
        method: "post"
    },
    
    // Debug endpoints
    debugShops: {
        url: `${baseURL}/api/debug/shops`,
        method: "get"
    },
    debugActivateAllShops: {
        url: `${baseURL}/api/debug/activate-all-shops`,
        method: "post"
    },

    // Notification endpoints
    getUserNotifications: {
        url: `${baseURL}/api/notifications`,
        method: "get"
    },
    markNotificationAsRead: {
        url: `${baseURL}/api/notifications/:id/read`,
        method: "patch"
    },
    markAllNotificationsAsRead: {
        url: `${baseURL}/api/notifications/mark-all-read`,
        method: "patch"
    }
}

export default summaryApi;