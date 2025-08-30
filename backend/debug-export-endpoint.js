const fetch = require('node-fetch');

async function debugExportEndpoint() {
  try {
    console.log('🔍 Debugging Export Endpoint...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGIxNTYwY2M2MmU0MWUxNmZiNjgyNzQiLCJ1c2VybmFtZSI6InZheTE1cyIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzU2NTQ2MjkxLCJleHAiOjE3NTcxNTEwOTF9.KgVfoBrc7El3JfMULrZlXKDvw2D1evDKyLlc--AeN1U';
    
    // Test 1: Export endpoint với ngày hôm nay
    console.log('\n🧪 Test 1: Export endpoint với ngày hôm nay');
    const today = new Date().toISOString().split('T')[0];
    const exportUrl = `http://localhost:3000/api/admin/loans/export?startDate=${today}&endDate=${today}`;
    
    const response1 = await fetch(exportUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📡 URL:', exportUrl);
    console.log('📊 Status:', response1.status);
    
    if (response1.status === 200) {
      const data1 = await response1.json();
      console.log('📄 Response type:', typeof data1);
      console.log('📄 Is Array:', Array.isArray(data1));
      console.log('📄 Length:', data1.length || 'N/A');
      console.log('📄 Full response:', JSON.stringify(data1, null, 2));
    }
    
    // Test 2: Loans endpoint với ngày hôm nay
    console.log('\n🧪 Test 2: Loans endpoint với ngày hôm nay');
    const loansUrl = `http://localhost:3000/api/admin/loans?startDate=${today}&endDate=${today}`;
    
    const response2 = await fetch(loansUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📡 URL:', loansUrl);
    console.log('📊 Status:', response2.status);
    
    if (response2.status === 200) {
      const data2 = await response2.json();
      console.log('📄 Response type:', typeof data2);
      console.log('📄 Has loans field:', !!data2.loans);
      console.log('📄 Loans length:', data2.loans?.length || 'N/A');
      console.log('📄 Total:', data2.total);
      console.log('📄 Full response:', JSON.stringify(data2, null, 2));
    }
    
    // Test 3: Export endpoint không có date filter
    console.log('\n🧪 Test 3: Export endpoint không có date filter');
    const exportUrlNoFilter = `http://localhost:3000/api/admin/loans/export`;
    
    const response3 = await fetch(exportUrlNoFilter, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📡 URL:', exportUrlNoFilter);
    console.log('📊 Status:', response3.status);
    
    if (response3.status === 200) {
      const data3 = await response3.json();
      console.log('📄 Response type:', typeof data3);
      console.log('📄 Is Array:', Array.isArray(data3));
      console.log('📄 Length:', data3.length || 'N/A');
      console.log('📄 Full response:', JSON.stringify(data3, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugExportEndpoint();
