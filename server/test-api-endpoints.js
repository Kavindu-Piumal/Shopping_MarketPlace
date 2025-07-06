// Simple API test for product visibility
console.log('🧪 Testing Product Visibility API Endpoints');
console.log('============================================');

// Test the API endpoints with and without authentication
const testUrls = [
    'http://localhost:5000/api/product/getproductby-category',
    'http://localhost:5000/api/product/search-product'
];

async function testProductAPI() {
    try {
        // Test category-based product fetch
        console.log('\n🏷️ Testing category-based product fetch...');
        
        const categoryResponse = await fetch('http://localhost:5000/api/product/getproductby-category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: ['675b7d1a9e35d47f2fd1d03c'] // Replace with actual category ID
            })
        });
        
        if (categoryResponse.ok) {
            const data = await categoryResponse.json();
            console.log(`✅ Category API: ${data.success ? 'Success' : 'Failed'}`);
            console.log(`📦 Products returned: ${data.data?.length || 0}`);
        } else {
            console.log('❌ Category API failed:', categoryResponse.status);
        }
        
        // Test search endpoint
        console.log('\n🔍 Testing search endpoint...');
        
        const searchResponse = await fetch('http://localhost:5000/api/product/search-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                search: 'product',
                page: 1,
                limit: 10
            })
        });
        
        if (searchResponse.ok) {
            const data = await searchResponse.json();
            console.log(`✅ Search API: ${data.success ? 'Success' : 'Failed'}`);
            console.log(`📦 Products returned: ${data.data?.length || 0}`);
        } else {
            console.log('❌ Search API failed:', searchResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testProductAPI();
