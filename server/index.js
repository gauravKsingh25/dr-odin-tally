express = require('express')
const path = require('path');
const app = express();
const cors = require("cors");
require('dotenv').config();
const config = require('./config/db.config')

var corsOptions = {
    origin: "*"
};


app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
var bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json({ limit: "50mb" }))
app.use("/uploads", express.static("uploads"));

// Serve React build files (static assets)
app.use(express.static(path.join(__dirname, '../client/build')));


// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/sales.routes')(app);
require("./routes/salary+expenses.routes")(app);
require("./routes/month.routes")(app);
require("./routes/employeeinfo.routes")(app);
require("./routes/designation.routes")(app);
require("./routes/credit.routes")(app);
require('./routes/usersingin.route')(app);
require("./routes/tally.routes")(app);
require("./routes/totalSale.routes")(app);
require("./routes/productReport.routes")(app);
require("./routes/revenue.routes")(app);
require("./routes/saleExecutive.routes")(app);

// Serve React app for any non-API routes (must be after all API routes)
app.get('*', (req, res) => {
    // Only serve React app for non-API routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    } else {
        res.status(404).json({ message: 'API endpoint not found' });
    }
});


// Tally cron job instance (FULL SYNC enabled - runs daily at 12:00 AM)
const TallyCronJob = require('./scripts/tally-cron');
const tallyCronJob = new TallyCronJob();

let port = process.env.PORT || 7010;

app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
    console.log('🔄 Tally integration with FULL SYNC enabled');
    
    // Start automatic Tally full sync scheduler
    tallyCronJob.start(); // Enables daily full sync at 12:00 AM
    console.log('⏰ Full sync scheduler activated - runs daily at 12:00 AM');
    console.log('💡 Excluding vouchers from full sync (manual sync required for vouchers)');
});

// function getLongestWorld(str) {
//     const words = str.split(' ')
//     let size = 0;
//     let longestwords = ['']
//     for (let word of words) {
//         if (size <= word.length) {
//             size = word.length;
//             if (longestwords[longestwords.length - 1].length < size) {
//                 longestwords = [];
//                 longestwords.push(word)
//             } else {
//                 longestwords = [...longestwords, word];
//             }
//         }

//     }
//     return longestwords;
// }


//  function checkArithmatic(arr){
//     const arith = [];
//     for(let i = 1; i < arr.length; i++){
//         const arithmatic = arr[i]- arr[i-1];
//         arith.push(arithmatic)
//     }
//     return arith;
//  }


// function checkGio(arr) {
//     const gio = new Set();
//     for (let i = 1; i < arr.length; i++) {
//         const giom = arr[i] / arr[i - 1];
//         gio.add(giom)
//     }
//     return gio;
// }

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Dr.Odin application." });
});

// const str = "I am Gaurav Singh";
// console.log(getLongestWorld(str));   