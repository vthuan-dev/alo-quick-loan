const fetch = require('node-fetch');

async function testExportAPI() {
  try {
    console.log('🔍 Testing Export API...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGIxNTYwY2M2MmU0MWUxNmZiNjgyNzQiLCJ1c2VybmFtZSI6InZheTE1cyIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzU2NTQ2MjkxLCJleHAiOjE3NTcxNTEwOTF9.KgVfoBrc7El3JfMULrZlXKDvw2D1evDKyLlc--AeN1U';
    
    // Test với ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    const url = `http://localhost:3000/api/admin/loans/export?startDate=${today}&endDate=${today}`;
    
    console.log('📅 Today:', today);
    console.log('📡 URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('📄 Response type:', typeof data);
      console.log('📄 Is Array:', Array.isArray(data));
      console.log('📄 Length:', data.length || 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ SUCCESS: Found', data.length, 'loans for today!');
        console.log('📝 Sample item:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('⚠️ No data found for today');
      }
    } else {
      console.log('❌ Failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExportAPI();
