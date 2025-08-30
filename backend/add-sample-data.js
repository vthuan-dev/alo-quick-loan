const mongoose = require('mongoose');

async function addSampleData() {
  try {
    console.log('🔍 Adding sample data...');
    
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
    
    // Check if data already exists
    const existingCount = await LoanApplication.countDocuments();
    console.log('📊 Existing applications:', existingCount);
    
    if (existingCount > 0) {
      console.log('✅ Data already exists, skipping...');
      return;
    }
    
    // Add sample data for today
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon today
    
    const sampleData = [
      {
        loanApplicationId: 'loan_001',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0123456789',
        status: 'PENDING',
        loanAmount: 5000000,
        createdAt: today,
        updatedAt: today,
      },
      {
        loanApplicationId: 'loan_002',
        fullName: 'Trần Thị B',
        phoneNumber: '0987654321',
        status: 'APPROVED',
        loanAmount: 10000000,
        createdAt: today,
        updatedAt: today,
      },
      {
        loanApplicationId: 'loan_003',
        fullName: 'Lê Văn C',
        phoneNumber: '0369852147',
        status: 'COMPLETED',
        loanAmount: 7500000,
        createdAt: today,
        updatedAt: today,
      },
    ];
    
    const result = await LoanApplication.insertMany(sampleData);
    console.log('✅ Added', result.length, 'sample applications for today');
    
    // Verify data
    const totalCount = await LoanApplication.countDocuments();
    console.log('📊 Total applications now:', totalCount);
    
    // Check today's data
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayCount = await LoanApplication.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    console.log('📅 Applications for today:', todayCount);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addSampleData();
