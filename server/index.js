express = require('express')
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


// app.use('/', (req, res) => {
//     res.send('dr_ordin BE working')
// })

let port = process.env.PORT || 7010;

app.listen(port, () => {
    console.log(`listening on ${port}`)
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

