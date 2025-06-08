export const PriceWithDiscount = (price, discount = 0) => {
    const numericPrice = Number(price) || 0;
    const numericDiscount = Number(discount) || 0;
    
    // If no discount, return original price
    if (numericDiscount <= 0) {
        return numericPrice;
    }
    
    const discountedPrice = numericPrice - (numericPrice * (numericDiscount / 100));
    return discountedPrice;
};