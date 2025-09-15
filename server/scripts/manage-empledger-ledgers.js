const { exec } = require('child_process');
const path = require('path');

console.log('🚀 EMPLEDGER Ledger Management Tool');
console.log('=====================================\n');

console.log('Choose an action:');
console.log('1. Check EMPLEDGER ledgers (view only)');
console.log('2. Remove EMPLEDGER ledgers (delete)');
console.log('3. Check first, then remove (recommended)');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your choice (1-3): ', (choice) => {
    rl.close();
    
    switch (choice.trim()) {
        case '1':
            console.log('\n🔍 Running EMPLEDGER ledger check...');
            runScript('check-empledger-ledgers.js');
            break;
        case '2':
            console.log('\n⚠️  WARNING: This will permanently delete EMPLEDGER ledgers!');
            console.log('Are you sure you want to proceed? (This action cannot be undone)');
            const confirmRl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            confirmRl.question('Type "DELETE" to confirm: ', (confirm) => {
                confirmRl.close();
                if (confirm.trim() === 'DELETE') {
                    console.log('\n🗑️  Running EMPLEDGER ledger removal...');
                    runScript('remove-empledger-ledgers.js');
                } else {
                    console.log('❌ Operation cancelled. No ledgers were deleted.');
                    process.exit(0);
                }
            });
            break;
        case '3':
            console.log('\n🔍 First checking EMPLEDGER ledgers...');
            runScript('check-empledger-ledgers.js', () => {
                console.log('\n⏳ Waiting 3 seconds before showing removal option...');
                setTimeout(() => {
                    const removeRl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    removeRl.question('\nDo you want to remove these EMPLEDGER ledgers? (y/N): ', (answer) => {
                        removeRl.close();
                        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                            console.log('\n🗑️  Running EMPLEDGER ledger removal...');
                            runScript('remove-empledger-ledgers.js');
                        } else {
                            console.log('✅ Operation completed. No ledgers were deleted.');
                            process.exit(0);
                        }
                    });
                }, 3000);
            });
            break;
        default:
            console.log('❌ Invalid choice. Please run the script again and choose 1, 2, or 3.');
            process.exit(1);
    }
});

function runScript(scriptName, callback) {
    const scriptPath = path.join(__dirname, scriptName);
    
    console.log(`\n📝 Executing: ${scriptName}`);
    console.log('=====================================');
    
    const child = exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error running ${scriptName}:`, error);
            return;
        }
        
        if (stderr) {
            console.error(`⚠️  Warnings from ${scriptName}:`, stderr);
        }
        
        console.log(`\n✅ ${scriptName} completed successfully!`);
        
        if (callback) {
            callback();
        } else {
            console.log('\n🎉 Operation completed!');
            process.exit(0);
        }
    });
    
    // Stream output in real-time
    child.stdout.on('data', (data) => {
        process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
}

