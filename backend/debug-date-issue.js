const mongoose = require('mongoose');

async function debugDateIssue() {
  try {
    console.log('🔍 Debugging date issue...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://thuanhero1:100103@loan.5zl1m5s.mongodb.net/alo_quick_loan?retryWrites=true&w=majority&appName=loan');
    console.log('✅ Connected to MongoDB');
    
    // Define schema
    const loanSchema = new mongoose.Schema({
      loanApplicationId: String,
      fullName: String,
      phoneNumber: String,
      status: String,
      loanAmount: Number,
      createdAt: Date,
      updatedAt: Date,
    });
    
    const LoanApplication = mongoose.model('LoanApplication', loanSchema);
    
    // Get all data with dates
    const allData = await LoanApplication.find({}, { createdAt: 1, loanApplicationId: 1, fullName: 1 }).sort({ createdAt: -1 }).limit(5);
    
    console.log('📅 Sample data from database:');
    allData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.loanApplicationId} - ${item.fullName}`);
      console.log(`     Created: ${item.createdAt}`);
      console.log(`     Created ISO: ${item.createdAt.toISOString()}`);
      console.log(`     Created Date: ${item.createdAt.toDateString()}`);
      console.log(`     Created Time: ${item.createdAt.toTimeString()}`);
      console.log('');
    });
    
    // Test different date ranges
    const today = new Date();
    console.log('📅 Today:', today);
    console.log('📅 Today ISO:', today.toISOString());
    console.log('📅 Today Date:', today.toDateString());
    
    // Method 1: Using toISOString().split('T')[0]
    const todayISO = today.toISOString().split('T')[0];
    console.log('📅 Today ISO split:', todayISO);
    
    // Method 2: Using local date
    const todayLocal = today.getFullYear() + '-' + 
                      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(today.getDate()).padStart(2, '0');
    console.log('📅 Today Local:', todayLocal);
    
    // Test queries with different date formats
    console.log('\n🔍 Testing different date queries:');
    
    // Query 1: Using ISO date
    const startISO = new Date(todayISO + 'T00:00:00.000Z');
    const endISO = new Date(todayISO + 'T23:59:59.999Z');
    console.log('📅 ISO Start:', startISO);
    console.log('📅 ISO End:', endISO);
    
    const countISO = await LoanApplication.countDocuments({
      createdAt: { $gte: startISO, $lte: endISO }
    });
    console.log('📊 Count with ISO dates:', countISO);
    
    // Query 2: Using local date
    const startLocal = new Date(todayLocal + 'T00:00:00.000Z');
    const endLocal = new Date(todayLocal + 'T23:59:59.999Z');
    console.log('📅 Local Start:', startLocal);
    console.log('📅 Local End:', endLocal);
    
    const countLocal = await LoanApplication.countDocuments({
      createdAt: { $gte: startLocal, $lte: endLocal }
    });
    console.log('📊 Count with Local dates:', countLocal);
    
    // Query 3: Using UTC date
    const startUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const endUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));
    console.log('📅 UTC Start:', startUTC);
    console.log('📅 UTC End:', endUTC);
    
    const countUTC = await LoanApplication.countDocuments({
      createdAt: { $gte: startUTC, $lte: endUTC }
    });
    console.log('📊 Count with UTC dates:', countUTC);
    
    // Query 4: Using local timezone
    const startLocalTZ = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endLocalTZ = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    console.log('📅 LocalTZ Start:', startLocalTZ);
    console.log('📅 LocalTZ End:', endLocalTZ);
    
    const countLocalTZ = await LoanApplication.countDocuments({
      createdAt: { $gte: startLocalTZ, $lte: endLocalTZ }
    });
    console.log('📊 Count with LocalTZ dates:', countLocalTZ);
    
    // Get data from the working query
    if (countLocalTZ > 0) {
      const workingData = await LoanApplication.find({
        createdAt: { $gte: startLocalTZ, $lte: endLocalTZ }
      }).limit(3);
      
      console.log('\n✅ Working query data:');
      workingData.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.loanApplicationId} - ${item.fullName}`);
        console.log(`     Created: ${item.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugDateIssue();
