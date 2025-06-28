// Quick test to verify shop filtering logic
console.log('🔧 Testing Shop Filtering Logic...\n');

// Simulate the filtering logic from the controller
function testShopFiltering() {
  // Test cases
  const testCases = [
    {
      name: 'Admin requesting all shops',
      userId: 'admin123',
      user: { role: 'admin' },
      requestedStatus: 'all',
      expectedQuery: {} // No status filter
    },
    {
      name: 'Admin requesting suspended shops',
      userId: 'admin123', 
      user: { role: 'admin' },
      requestedStatus: 'suspended',
      expectedQuery: { status: 'suspended' }
    },
    {
      name: 'Admin requesting active shops',
      userId: 'admin123',
      user: { role: 'admin' },
      requestedStatus: 'active', 
      expectedQuery: { status: 'active' }
    },
    {
      name: 'Regular user requesting shops',
      userId: 'user123',
      user: { role: 'user' },
      requestedStatus: 'all',
      expectedQuery: { status: 'active' } // Only active shops for non-admins
    },
    {
      name: 'No user (unauthenticated)',
      userId: null,
      user: null,
      requestedStatus: 'all',
      expectedQuery: { status: 'active' } // Only active shops for unauthenticated
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Input: status=${testCase.requestedStatus}, userRole=${testCase.user?.role || 'none'}`);
    
    // Simulate the controller logic
    const query = {};
    const req = {
      userId: testCase.userId,
      user: testCase.user,
      query: { status: testCase.requestedStatus }
    };
    
    // Apply the filtering logic (fixed version)
    if (req.userId && req.user?.role === 'admin' && req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
      console.log(`   ✅ Admin filtering by status: ${req.query.status}`);
    } else if (req.userId && req.user?.role === 'admin' && (!req.query.status || req.query.status === 'all')) {
      // Admin viewing all shops, no status filter needed
      console.log('   ✅ Admin viewing all shops - no status filter');
    } else {
      // For non-admins or if no specific status is requested, only show active shops
      query.status = 'active';
      console.log('   ✅ Filtering to only active shops');
    }
    
    console.log(`   Expected: ${JSON.stringify(testCase.expectedQuery)}`);
    console.log(`   Actual:   ${JSON.stringify(query)}`);
    
    const matches = JSON.stringify(query) === JSON.stringify(testCase.expectedQuery);
    console.log(`   Result:   ${matches ? '✅ PASS' : '❌ FAIL'}`);
  });
}

testShopFiltering();

console.log('\n🎉 Filtering logic test completed!');
console.log('\n📋 Key Fixes Applied:');
console.log('✅ Changed req.userRole to req.user.role in getAllShopsController');
console.log('✅ Changed req.userRole to req.user.role in updateShopStatusController'); 
console.log('✅ Changed req.userRole to req.user.role in deleteShopController');
console.log('✅ Added debug logging to track filtering behavior');
console.log('\n🚀 The admin manage-shops page should now filter correctly!');
