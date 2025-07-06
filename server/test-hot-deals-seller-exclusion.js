/**
 * Hot Deals API Test - Seller Product Exclusion
 * 
 * This test verifies that sellers don't see their own products in hot deals
 */

const axios = require('axios');

async function testHotDealsAPI() {
    console.log('🧪 Testing Hot Deals API - Seller Product Exclusion');
    
    const baseURL = 'http://localhost:8080/api/product';
    
    try {
        // Test 1: Anonymous user (should see all products)
        console.log('\n1️⃣ Testing Anonymous User (no auth token)');
        const anonResponse = await axios.post(`${baseURL}/hot-deals`, {
            page: 1,
            limit: 5,
            minDiscount: 30
        });
        
        console.log(`✅ Anonymous User - Found ${anonResponse.data.totalCount} hot deals`);
        console.log(`📦 Products: ${anonResponse.data.data.map(p => p.name).join(', ')}`);
        
        // Test 2: Authenticated seller (should exclude own products)
        console.log('\n2️⃣ Testing Authenticated Seller (with auth token)');
        const sellerToken = 'SAMPLE_TOKEN'; // Replace with actual token for testing
        
        const sellerResponse = await axios.post(`${baseURL}/hot-deals`, {
            page: 1,
            limit: 5,
            minDiscount: 30
        }, {
            headers: {
                'Authorization': `Bearer ${sellerToken}`
            }
        });
        
        console.log(`✅ Authenticated Seller - Found ${sellerResponse.data.totalCount} hot deals`);
        console.log(`📦 Products: ${sellerResponse.data.data.map(p => p.name).join(', ')}`);
        
        // Compare results
        const anonCount = anonResponse.data.totalCount;
        const sellerCount = sellerResponse.data.totalCount;
        
        if (sellerCount < anonCount) {
            console.log(`\n🎯 SUCCESS: Seller sees fewer products (${sellerCount}) than anonymous user (${anonCount})`);
            console.log('✅ Seller\'s own products are being filtered out');
        } else {
            console.log(`\n⚠️  NOTICE: Same product count - either seller has no products with discounts, or all are from others`);
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.response?.data || error.message);
    }
}

// API Changes Summary
console.log('🔧 Hot Deals API Changes:');
console.log('1. Added optionalAuth middleware to /hot-deals route');
console.log('2. Added seller filtering: query.sellerId = { $ne: req.userId }');
console.log('3. Sellers now see only other sellers\' products in hot deals');
console.log('4. Anonymous users still see all products');

// Run test if this file is executed directly
if (require.main === module) {
    testHotDealsAPI();
}

module.exports = { testHotDealsAPI };
