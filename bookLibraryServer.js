const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname)); 

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
  // console.log(`${author} ${title}`);

  bookUrl = libAPI + `title=${plusTitle}&author=${plusAuthor}`;

  const urlRes = await fetch(bookUrl);
  const books = await urlRes.json();

  if (books.length === 0) {
    return response.status(404).send("That book does not exist, try again");
  }

  const firstBook = books[0];

  response.render('bookDisplay', {
    title, 
    author, 
    bookUrl,
    // book: {
    //   rating: firstBook.ratings_average.toFixed(2),
    //   coverImg: 'https://covers.openlibrary.org/b/isbn/'+firstBook.isbn[0] + '-M.jpg'
    // }
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
