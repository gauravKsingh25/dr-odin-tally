const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to convert Excel serial date to ISO date string
function excelSerialToDate(serial) {
    const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
    const daysOffset = serial - 2; // Excel incorrectly treats 1900 as a leap year
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Function to parse date from different formats
function parseDate(dateValue) {
    if (typeof dateValue === 'number') {
        return {
            iso: excelSerialToDate(dateValue),
            serial: dateValue
        };
    }
    
    if (typeof dateValue === 'string') {
        // Try to parse common date formats
        const formats = [
            /(\d{2})-(\w{3})-(\d{2})/,  // DD-MMM-YY format
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/  // MM/DD/YYYY or DD/MM/YYYY
        ];
        
        for (let format of formats) {
            const match = dateValue.match(format);
            if (match) {
                let date;
                if (format === formats[0]) { // DD-MMM-YY
                    const monthMap = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                    };
                    const day = parseInt(match[1]);
                    const month = monthMap[match[2]];
                    const year = 2000 + parseInt(match[3]); // Assuming 20xx
                    date = new Date(year, month, day);
                } else { // MM/DD/YYYY or DD/MM/YYYY
                    date = new Date(dateValue);
                }
                
                if (!isNaN(date.getTime())) {
                    return {
                        iso: date.toISOString().split('T')[0],
                        serial: Math.floor((date - new Date(1900, 0, 1)) / (24 * 60 * 60 * 1000)) + 2
                    };
                }
            }
        }
    }
    
    // Fallback
    return {
        iso: new Date().toISOString().split('T')[0],
        serial: Math.floor((new Date() - new Date(1900, 0, 1)) / (24 * 60 * 60 * 1000)) + 2
    };
}

// Function to clean and format amount values
function parseAmount(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Remove currency symbols, commas, and extra spaces
        const cleaned = value.replace(/[₹,\s]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }
    return 0;
}

// Function to determine if a row starts a new voucher (has date)
function isNewVoucher(row) {
    // Check if first column contains a date
    const firstCell = row[0];
    if (!firstCell) return false;
    
    // Check for date patterns
    if (typeof firstCell === 'number' && firstCell > 40000 && firstCell < 60000) {
        return true; // Excel serial date
    }
    
    if (typeof firstCell === 'string') {
        const datePatterns = [
            /^\d{2}-\w{3}-\d{2}$/,  // DD-MMM-YY
            /^\d{1,2}\/\d{1,2}\/\d{4}$/,  // MM/DD/YYYY
            /^\d{2}-\w{3}-\d{4}$/,  // DD-MMM-YYYY
            /^\d{4}-\d{2}-\d{2}$/   // YYYY-MM-DD
        ];
        return datePatterns.some(pattern => pattern.test(firstCell.toString().trim()));
    }
    
    return false;
}

// Function to process Excel file and convert to vouchers JSON
function processExcelFile(filePath) {
    console.log(`Processing ${filePath}...`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to array of arrays
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
    
    const vouchers = [];
    let currentVoucher = null;
    let voucherCounter = 1;
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Skip completely empty rows
        if (!row || row.every(cell => !cell || cell === '' || cell === null || cell === undefined)) continue;
        
        // Check if this row starts a new voucher (contains a date in first column)
        if (isNewVoucher(row)) {
            // Save previous voucher if exists
            if (currentVoucher) {
                vouchers.push(currentVoucher);
            }
            
            // Start new voucher
            const dateInfo = parseDate(row[0]);
            
            // Extract voucher information from the row
            // Assuming structure: Date | Particulars | ... | Vch Type | Vch No. | Debit Amount | Credit Amount
            let party = '';
            let vchType = 'Sales';
            let voucherNumber = '';
            let debitAmount = null;
            let creditAmount = null;
            
            // Look for party name in the row (usually in column 1 or where we find company names)
            for (let j = 1; j < row.length; j++) {
                if (row[j] && typeof row[j] === 'string' && row[j].trim().length > 0) {
                    // Check if this looks like a company name (contains alphabets and possibly special chars)
                    if (/[A-Za-z]/.test(row[j]) && !row[j].match(/^(Sales|Purchase|Receipt|Payment)$/i)) {
                        if (!party) {
                            party = row[j].trim();
                        }
                    }
                    
                    // Check for voucher type
                    if (row[j].match(/^(Sales|Purchase|Receipt|Payment)$/i)) {
                        vchType = row[j].trim();
                    }
                    
                    // Check for voucher number pattern (like ODIN/01, etc.)
                    if (row[j].match(/^[A-Z]+\/\d+/)) {
                        voucherNumber = row[j].trim();
                    }
                }
                
                // Check for amounts (usually in last columns)
                const cellValue = parseAmount(row[j]);
                if (cellValue > 0) {
                    if (!debitAmount) {
                        debitAmount = cellValue;
                    } else if (!creditAmount && cellValue !== debitAmount) {
                        creditAmount = cellValue;
                    }
                }
            }
            
            // Generate voucher number if not found
            if (!voucherNumber) {
                voucherNumber = `ODIN/${String(voucherCounter).padStart(3, '0')}`;
            }
            
            // Use filename info for party if not found
            if (!party) {
                party = `Party ${voucherCounter}`;
            }
            
            currentVoucher = {
                Voucher_Number: voucherNumber,
                Date_iso: dateInfo.iso,
                Date_serial: dateInfo.serial,
                Party: party,
                Vch_Type: vchType,
                Debit_Amount: debitAmount,
                Credit_Amount: creditAmount,
                Details: []
            };
            
            voucherCounter++;
        } else if (currentVoucher) {
            // Add details to current voucher
            // Look for particulars (usually in column 1) and amounts
            let particulars = '';
            let amount = 0;
            let isDebitEntry = false;
            
            // Find the particulars (first non-empty text column)
            for (let j = 1; j < row.length; j++) {
                if (row[j] && typeof row[j] === 'string' && row[j].trim().length > 0) {
                    if (!particulars && /[A-Za-z]/.test(row[j])) {
                        particulars = row[j].trim();
                    }
                }
                
                // Find amounts
                const cellAmount = parseAmount(row[j]);
                if (cellAmount !== 0 && !amount) {
                    amount = cellAmount;
                    // Check if this is in a debit column (usually earlier columns) vs credit column
                    isDebitEntry = j < row.length - 2; // Simple heuristic
                }
            }
            
            if (particulars && amount) {
                // Determine if this is a staff entry or account entry based on patterns
                if (particulars.includes(' Dr') || particulars.includes(' Cr') || 
                    particulars.match(/^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]/)) {
                    // Likely a staff/person name
                    const type = particulars.includes(' Dr') ? 'Dr' : 
                               particulars.includes(' Cr') ? 'Cr' : 
                               (isDebitEntry ? 'Dr' : 'Cr');
                    
                    currentVoucher.Details.push({
                        Staff: particulars.replace(/\s*(Dr|Cr)\s*$/i, '').trim(),
                        Type: type,
                        Amount: type === 'Cr' ? -Math.abs(amount) : amount
                    });
                } else {
                    // Account entry
                    currentVoucher.Details.push({
                        Account: particulars,
                        Amount: amount
                    });
                }
            }
        }
    }
    
    // Don't forget the last voucher
    if (currentVoucher) {
        vouchers.push(currentVoucher);
    }
    
    return vouchers;
}

// Main function to convert all Excel files
async function convertAllExcelFiles() {
    const excelDir = path.join(__dirname, 'excel upload');
    const convertedDir = path.join(__dirname, 'converted');
    
    // Ensure converted directory exists
    if (!fs.existsSync(convertedDir)) {
        fs.mkdirSync(convertedDir, { recursive: true });
    }
    
    try {
        const files = fs.readdirSync(excelDir);
        const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
        
        console.log(`Found ${excelFiles.length} Excel files to convert...`);
        
        for (let i = 0; i < excelFiles.length; i++) {
            const file = excelFiles[i];
            const filePath = path.join(excelDir, file);
            
            try {
                const vouchers = processExcelFile(filePath);
                
                // Generate output filename
                const outputFileName = `excel${i + 1}.json`;
                const outputPath = path.join(convertedDir, outputFileName);
                
                // Write JSON file
                fs.writeFileSync(outputPath, JSON.stringify(vouchers, null, 2), 'utf8');
                
                console.log(`✅ Converted ${file} -> ${outputFileName} (${vouchers.length} vouchers)`);
            } catch (error) {
                console.error(`❌ Error processing ${file}:`, error.message);
            }
        }
        
        console.log('\n🎉 Conversion completed!');
    } catch (error) {
        console.error('Error reading Excel directory:', error.message);
    }
}

// Run the conversion
if (require.main === module) {
    convertAllExcelFiles();
}

module.exports = { convertAllExcelFiles, processExcelFile };