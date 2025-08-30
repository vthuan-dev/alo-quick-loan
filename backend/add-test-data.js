const mongoose = require('mongoose');

async function addTestData() {
  try {
    console.log('🔍 Adding test data...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/alo-quick-loan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
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
    
    // Add test data
    const testData = [
      {
        loanApplicationId: 'loan_test_001',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0123456789',
        status: 'PENDING',
        loanAmount: 5000000,
        createdAt: new Date('2025-08-25'),
        updatedAt: new Date('2025-08-25'),
      },
      {
        loanApplicationId: 'loan_test_002',
        fullName: 'Trần Thị B',
        phoneNumber: '0987654321',
        status: 'APPROVED',
        loanAmount: 10000000,
        createdAt: new Date('2025-08-28'),
        updatedAt: new Date('2025-08-28'),
      },
      {
        loanApplicationId: 'loan_test_003',
        fullName: 'Lê Văn C',
        phoneNumber: '0369852147',
        status: 'COMPLETED',
        loanAmount: 7500000,
        createdAt: new Date('2025-08-30'),
        updatedAt: new Date('2025-08-30'),
      },
      {
        loanApplicationId: 'loan_test_004',
        fullName: 'Phạm Thị D',
        phoneNumber: '0521478963',
        status: 'PENDING',
        loanAmount: 3000000,
        createdAt: new Date('2025-07-30'),
        updatedAt: new Date('2025-07-30'),
      },
      {
        loanApplicationId: 'loan_test_005',
        fullName: 'Hoàng Văn E',
        phoneNumber: '0147852369',
        status: 'REJECTED',
        loanAmount: 8000000,
        createdAt: new Date('2025-08-15'),
        updatedAt: new Date('2025-08-15'),
      },
    ];
    
    const result = await LoanApplication.insertMany(testData);
    console.log('✅ Added', result.length, 'test applications');
    
    // Verify data
    const totalCount = await LoanApplication.countDocuments();
    console.log('📊 Total applications now:', totalCount);
    
    // Check recent data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCount = await LoanApplication.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    console.log('📅 Recent applications (last 30 days):', recentCount);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addTestData();
