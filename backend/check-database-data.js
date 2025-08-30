const mongoose = require('mongoose');

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database data...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/alo-quick-loan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get the LoanApplication model
    const LoanApplication = mongoose.model('LoanApplication', new mongoose.Schema({}));
    
    // Check total count
    const totalCount = await LoanApplication.countDocuments();
    console.log('📊 Total loan applications:', totalCount);
    
    if (totalCount === 0) {
      console.log('❌ No data found in database!');
      return;
    }
    
    // Check recent data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCount = await LoanApplication.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    console.log('📅 Recent applications (last 30 days):', recentCount);
    
    // Check data for specific date range (2025-07-30 to 2025-08-30)
    const startDate = new Date('2025-07-30');
    const endDate = new Date('2025-08-30');
    endDate.setHours(23, 59, 59, 999); // End of day
    
    const rangeCount = await LoanApplication.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    console.log('📅 Applications from 2025-07-30 to 2025-08-30:', rangeCount);
    
    // Get sample data
    const sampleData = await LoanApplication.find().limit(3).sort({ createdAt: -1 });
    console.log('📝 Sample data:');
    sampleData.forEach((item, index) => {
      console.log(`  ${index + 1}. ID: ${item._id}`);
      console.log(`     Created: ${item.createdAt}`);
      console.log(`     Name: ${item.fullName || 'N/A'}`);
      console.log(`     Phone: ${item.phoneNumber || 'N/A'}`);
      console.log(`     Status: ${item.status || 'N/A'}`);
      console.log('');
    });
    
    // Check all dates
    const allDates = await LoanApplication.find({}, { createdAt: 1 }).sort({ createdAt: -1 });
    console.log('📅 All creation dates:');
    allDates.forEach((item, index) => {
      if (index < 10) { // Show first 10
        console.log(`  ${index + 1}. ${item.createdAt}`);
      }
    });
    
    if (allDates.length > 10) {
      console.log(`  ... and ${allDates.length - 10} more`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkDatabaseData();
