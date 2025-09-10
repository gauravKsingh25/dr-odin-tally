/**
 * Populate Employees from namestaff.json
 *
 * This script reads namestaff.json and populates the employeeInfo collection in MongoDB.
 * Only fills: empId, empName, designation, doj, companyid. All other fields are left empty/default.
 * empId format: EMP{FIRST 3 LETTERS OF NAME}{DATE OF JOINING DDMMYYYY}
 * companyid is set to: 68b9755e578bec07fd1ca54d
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EmployeeInfo = require('../models/employeeinfo.model');
const Designation = require('../models/designation.model');

const COMPANY_ID = '68b9755e578bec07fd1ca54d';
const STAFF_JSON_PATH = path.join(__dirname, 'namestaff.json');

function formatEmpId(name, doj) {
    // Get first 3 letters (uppercase, no spaces)
    const prefix = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    // Parse date
    let dateObj;
    if (doj.includes('-')) {
        // YYYY-MM-DD or YYYY-MM-DD HH:MM:SS
        dateObj = new Date(doj.split(' ')[0]);
    } else if (doj.includes('.')) {
        // DD.MM.YYYY
        const [dd, mm, yyyy] = doj.split('.');
        dateObj = new Date(`${yyyy}-${mm}-${dd}`);
    } else {
        dateObj = new Date(doj);
    }
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = String(dateObj.getFullYear());
    return `EMP${prefix}${dd}${mm}${yyyy}`;
}

async function getOrCreateDesignation(designationName) {
    if (!designationName) return null;
    let designation = await Designation.findOne({ designation: designationName });
    if (!designation) {
        designation = await Designation.create({ designation: designationName, companyid: COMPANY_ID });
    }
    return designation._id;
}

async function processStaffMember(member) {
    const empId = formatEmpId(member.Name, member["Date of Joining"]);
    const designationId = await getOrCreateDesignation(member.Designation);
    const empData = {
        empId,
        empName: member.Name,
        designation: designationId,
        doj: member["Date of Joining"],
        companyid: COMPANY_ID
        // All other fields left empty/default
    };
    await EmployeeInfo.create(empData);
    console.log(`Added: ${empData.empName} (${empData.empId})`);
}

async function main() {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const staffList = JSON.parse(fs.readFileSync(STAFF_JSON_PATH, 'utf8'));
    for (const member of staffList) {
        await processStaffMember(member);
        if (Array.isArray(member.Team)) {
            for (const teamMember of member.Team) {
                await processStaffMember(teamMember);
            }
        }
    }

    await mongoose.disconnect();
    console.log('Done!');
}

if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}

module.exports = main;
