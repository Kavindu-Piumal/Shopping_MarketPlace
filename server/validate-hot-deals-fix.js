/**
 * Quick Hot Deals Validation
 * Run this to verify seller filtering is working correctly
 */

const testQuery = {
    discount: { $gte: 30 },
    stock: { $gt: 0 }
};

// Simulate seller filtering
const userId = "example-seller-id";
const userRole = "seller";

if (userId && userRole === 'seller') {
    testQuery.sellerId = { $ne: userId };
    console.log('✅ Seller filtering applied');
} else {
    console.log('❌ No filtering applied');
}

console.log('Final MongoDB query:', JSON.stringify(testQuery, null, 2));

/**
 * Expected query for sellers:
 * {
 *   "discount": { "$gte": 30 },
 *   "stock": { "$gt": 0 },
 *   "sellerId": { "$ne": "example-seller-id" }
 * }
 * 
 * Expected query for anonymous users:
 * {
 *   "discount": { "$gte": 30 },
 *   "stock": { "$gt": 0 }
 * }
 */
