const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Convert Excel serial date to ISO format
function excelDateToISO(serial) {
    if (typeof serial !== 'number') return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
}

// Clean and parse amount values
function parseAmount(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[₹,\s]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    return null;
}

// Process single Excel file
function processExcelFile(filePath) {
    console.log(`\nProcessing: ${path.basename(filePath)}`);
    
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    const vouchers = [];
    let currentVoucher = null;
    
    // Find where data starts (skip header rows)
    let dataStartIndex = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i][0] === 'Date' && data[i][1] === 'Particulars') {
            dataStartIndex = i + 2; // Skip header and sub-header
            break;
        }
    }
    
    if (dataStartIndex === -1) {
        console.log('Could not find data header row');
        return [];
    }
    
    for (let i = dataStartIndex; i < data.length; i++) {
        const row = data[i];
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell === '')) continue;
        
        // Check if this row starts a new voucher (has date in first column)
        if (typeof row[0] === 'number' && row[0] > 40000) {
            // Save previous voucher
            if (currentVoucher) {
                vouchers.push(currentVoucher);
            }
            
            // Create new voucher
            const date = excelDateToISO(row[0]);
            const party = row[1] || 'Unknown Party';
            const vchType = row[4] || 'Sales';
            const voucherNumber = row[5] || `ODIN/${vouchers.length + 1}`;
            const debitAmount = parseAmount(row[6]);
            const creditAmount = parseAmount(row[7]);
            
            currentVoucher = {
                Voucher_Number: voucherNumber,
                Date_iso: date,
                Date_serial: row[0],
                Party: party,
                Vch_Type: vchType,
                Debit_Amount: debitAmount,
                Credit_Amount: creditAmount,
                Details: []
            };
            
        } else if (currentVoucher && row[1]) {
            // This is a detail row for current voucher
            const particulars = row[1];
            const amount1 = parseAmount(row[2]);
            const type = row[3];
            const amount2 = parseAmount(row[7]);
            
            if (particulars) {
                if (type === 'Dr' || type === 'Cr') {
                    // Staff entry
                    currentVoucher.Details.push({
                        Staff: particulars,
                        Type: type,
                        Amount: amount1 || 0
                    });
                } else if (amount2 !== null) {
                    // Account entry with credit amount
                    currentVoucher.Details.push({
                        Account: particulars,
                        Amount: amount2
                    });
                } else if (amount1 !== null) {
                    // Other account entry
                    currentVoucher.Details.push({
                        Account: particulars,
                        Amount: amount1
                    });
                }
            }
        }
    }
    
    // Don't forget the last voucher
    if (currentVoucher) {
        vouchers.push(currentVoucher);
    }
    
    console.log(`Found ${vouchers.length} vouchers`);
    return vouchers;
}

// Main conversion function
function convertAllExcelFiles() {
    const excelDir = path.join(__dirname, 'excel upload');
    const convertedDir = path.join(__dirname, 'converted');
    
    // Create converted directory if it doesn't exist
    if (!fs.existsSync(convertedDir)) {
        fs.mkdirSync(convertedDir, { recursive: true });
    }
    
    try {
        const files = fs.readdirSync(excelDir);
        const excelFiles = files.filter(file => 
            file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls')
        );
        
        console.log(`Found ${excelFiles.length} Excel files to convert:`);
        excelFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });
        
        excelFiles.forEach((file, index) => {
            const filePath = path.join(excelDir, file);
            const vouchers = processExcelFile(filePath);
            
            // Save as excel1.json, excel2.json, etc.
            const outputFileName = `excel${index + 1}.json`;
            const outputPath = path.join(convertedDir, outputFileName);
            
            fs.writeFileSync(outputPath, JSON.stringify(vouchers, null, 2), 'utf8');
            console.log(`✅ Saved: ${outputFileName} (${vouchers.length} vouchers)`);
        });
        
        console.log('\n🎉 All Excel files converted successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    console.log('Excel to JSON Converter');
    console.log('========================');
    convertAllExcelFiles();
}

module.exports = { convertAllExcelFiles };