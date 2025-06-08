export const DisplayPriceInRupees = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}