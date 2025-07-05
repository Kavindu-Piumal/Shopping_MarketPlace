/**
 * Utility function to format price in LKR (Sri Lankan Rupees)
 * @param {number} price - The price amount to format
 * @param {boolean} includeSymbol - Whether to include LKR symbol (default: true)
 * @returns {string} Formatted price string
 */
export const displayPriceInRupees = (price, includeSymbol = true) => {
  try {
    // Handle null, undefined, or invalid prices
    if (price === null || price === undefined || isNaN(price)) {
      return includeSymbol ? 'LKR 0.00' : '0.00';
    }

    // Convert to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Handle invalid conversion
    if (isNaN(numericPrice)) {
      return includeSymbol ? 'LKR 0.00' : '0.00';
    }

    // Format with 2 decimal places and add thousands separators
    const formattedPrice = numericPrice.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return includeSymbol ? `LKR ${formattedPrice}` : formattedPrice;
  } catch (error) {
    console.error('Error formatting price in rupees:', error);
    return includeSymbol ? 'LKR 0.00' : '0.00';
  }
};

/**
 * Format price for notifications specifically
 * @param {number} price - The price amount to format
 * @returns {string} Formatted price for notifications
 */
export const formatNotificationPrice = (price) => {
  return displayPriceInRupees(price, true);
};

// Default export
export default displayPriceInRupees;
