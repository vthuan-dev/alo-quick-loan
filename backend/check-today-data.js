const mongoose = require('mongoose');

async function checkTodayData() {
  try {
    console.log('🔍 Checking today\'s data...');
    
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
    
    // Check total count
    const totalCount = await LoanApplication.countDocuments();
    console.log('📊 Total applications:', totalCount);
    
    // Check today's data
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    console.log('📅 Start of day:', startOfDay);
    console.log('📅 End of day:', endOfDay);
    
    const todayCount = await LoanApplication.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    console.log('📅 Applications for today:', todayCount);
    
    // Get sample data from today
    const todayData = await LoanApplication.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).limit(5);
    
    console.log('📝 Today\'s data:');
    todayData.forEach((item, index) => {
      console.log(`  ${index + 1}. ID: ${item.loanApplicationId}`);
      console.log(`     Name: ${item.fullName}`);
      console.log(`     Phone: ${item.phoneNumber}`);
      console.log(`     Status: ${item.status}`);
      console.log(`     Created: ${item.createdAt}`);
      console.log('');
    });
    
    // Get all data with dates
    const allData = await LoanApplication.find({}, { createdAt: 1, loanApplicationId: 1 }).sort({ createdAt: -1 }).limit(10);
    console.log('📅 Recent applications:');
    allData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.loanApplicationId} - ${item.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkTodayData();
