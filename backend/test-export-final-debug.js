const fetch = require('node-fetch');

async function testExportAPI() {
  try {
    console.log('🔍 Final Export API Test...');
    
    // Test với ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today:', today);
    
    const url = `http://localhost:3000/api/admin/loans?startDate=${today}&endDate=${today}`;
    console.log('📡 URL:', url);
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGIxNTYwY2M2MmU0MWUxNmZiNjgyNzQiLCJ1c2VybmFtZSI6InZheTE1cyIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzU2NTQ2MjkxLCJleHAiOjE3NTcxNTEwOTF9.KgVfoBrc7El3JfMULrZlXKDvw2D1evDKyLlc--AeN1U';
    
    console.log('🔑 Using token:', token.substring(0, 50) + '...');
    
    // Test 1: Without API key
    console.log('\n🧪 Test 1: Without API key');
    const response1 = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Status:', response1.status);
    console.log('📋 Headers:', response1.headers.get('content-type'));
    
    if (response1.status === 200) {
      const responseText = await response1.text();
      console.log('📄 Raw response:', responseText);
      console.log('📄 Response length:', responseText.length);
      
      try {
        const data1 = JSON.parse(responseText);
        console.log('📄 Parsed type:', typeof data1);
        console.log('📄 Is Array:', Array.isArray(data1));
        console.log('📄 Array length:', data1.length || 'N/A');
        console.log('📄 Full response:', JSON.stringify(data1, null, 2));
        console.log('✅ SUCCESS without API key!');
      } catch (parseError) {
        console.log('❌ JSON Parse Error:', parseError.message);
      }
    } else {
      console.log('❌ Failed without API key');
    }
    
    // Test 2: With API key
    console.log('\n🧪 Test 2: With API key');
    const response2 = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📊 Status:', response2.status);
    console.log('📋 Headers:', response2.headers.get('content-type'));
    
    if (response2.status === 200) {
      const data2 = await response2.json();
      console.log('📄 Response length:', data2.length || 'N/A');
      console.log('✅ SUCCESS with API key!');
      
      if (data2.length > 0) {
        console.log('📝 Sample item keys:', Object.keys(data2[0]));
        console.log('📝 Sample item:', JSON.stringify(data2[0], null, 2));
      }
    } else {
      console.log('❌ Failed with API key');
      const errorData = await response2.json();
      console.log('📄 Error response:', errorData);
    }
    
    // Test 3: Different date format
    console.log('\n🧪 Test 3: Different date format');
    const todayLocal = new Date().getFullYear() + '-' + 
                      String(new Date().getMonth() + 1).padStart(2, '0') + '-' + 
                      String(new Date().getDate()).padStart(2, '0');
    
    const urlLocal = `http://localhost:3000/api/admin/loans/export?startDate=${todayLocal}&endDate=${todayLocal}`;
    console.log('📡 URL Local:', urlLocal);
    
    const response3 = await fetch(urlLocal, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📊 Status:', response3.status);
    
    if (response3.status === 200) {
      const data3 = await response3.json();
      console.log('📄 Response length:', data3.length || 'N/A');
      console.log('✅ SUCCESS with local date format!');
    } else {
      console.log('❌ Failed with local date format');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExportAPI();
