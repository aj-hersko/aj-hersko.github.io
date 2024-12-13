const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates')); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'templates')));
app.use(bodyParser.json());

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') });  

// app.use(express.static(path.join(__dirname, 'templates')));
// app.set("view engine", "ejs");

const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335_DB", collection:"bookWL"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

const portNumber = 80;

//MongoDB accessing functions

const libAPI = "https://openlibrary.org/search.json?";
app.use(express.urlencoded({ extended: false }));


// getting and posting functions
app.get('/', (request, response) => {
  response.render('index');
});

app.post('/bookDisplay', async (request, response) => {
  const {title, author} = request.body;

  const plusTitle = title.replace(/\s+/g, '+');
  const plusAuthor = author.replace(/\s+/g, '+');
  

  bookUrl = libAPI + `title=${plusTitle}&author=${plusAuthor}`;
  
  fetch(bookUrl)
    .then(r => r.json())
    .then(jsonData => {
      if (jsonData.docs && jsonData.docs.length > 0) {
        const firstBook = jsonData.docs[0];
        
        response.render('bookDisplay', {
          title: title,
          author: author,
          bookUrl,
          rating: firstBook.ratings_average.toFixed(2), // formatting rating
          ratingCount: firstBook.ratings_count,
          coverImg: `https://covers.openlibrary.org/b/isbn/${firstBook.isbn[0]}-M.jpg`
        });
      }
      else {
        document.getElementById('display').innerHTML = `Please input a valid author and title <a href="/"> Go Home </a>`;
        alert(`Please input a valid author and title <a href="/"> Go Home </a>`);
      }
    })
    .catch(error => {
      response.status(500).send(`Please input a valid author and title <a href="/"> Go Home </a>`);
    });

});


app.listen(portNumber);

/* NodeJS Command Line */
console.log(`Web server started and running at http://localhost:${portNumber}`);
process.stdin.setEncoding("utf8");

if (process.argv.length != 2) {
    process.stdout.write(`Usage ${process.argv[1]}`);
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
