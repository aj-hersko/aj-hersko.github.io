const http = require('http');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const express = require('express')
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname)); 

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })  

const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335_DB", collection:"bookWL"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri);

const portNumber = 80;

//MongoDB accessing functions START CODE HERE

// getting and posting functions
app.get("/", (request, response) => {response.render("index");});
// START CODE HERE

app.listen(portNumber);

/* NodeJS Command Line */
console.log(`Web server started and running at http://localhost:${portNumber}`);
process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage ${process.argv[1]} PortNumber`);
    process.exit(1);
}

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
      const command = dataInput.trim();
      if (command === "stop") {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
      }
    }
});