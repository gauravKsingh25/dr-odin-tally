const { convertAllExcelFiles } = require('./convertExcelToJson');

console.log('🚀 Starting Excel to JSON conversion...');
console.log('=====================================');

convertAllExcelFiles()
    .then(() => {
        console.log('=====================================');
        console.log('✅ All conversions completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Conversion failed:', error);
        process.exit(1);
    });