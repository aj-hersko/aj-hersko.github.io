const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Templates')); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') });  

// 
// app.set("view engine", "ejs");

const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335_DB", collection:"bookWL"};
const { MongoClient, ServerApiVersion } = require('mongodb');
const { removeAllListeners } = require('process');
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

const portNumber = 80;

const libAPI = "https://openlibrary.org/search.json?";
app.use(express.urlencoded({ extended: false }));

//MongoDB accessing functions
async function connectMongo() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
}

async function addBook(data) {
  try {
    await connectMongo();
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(data);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function getAllBooks() {
  try {
    await connectMongo();
    const books = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({}).toArray();
    return books;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function removeAll() {
  try {
    await connectMongo();
    const num = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).countDocuments();
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
    return num;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

// getting and posting functions
app.get('/', (request, response) => {
  response.render('index');
});

app.get("/wishList", async (req, res) => {
  const allBooks = await getAllBooks();

  if (allBooks.length > 0) {
    const bookRows = allBooks
      .map(
        (book) => `
        <tr>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.rating || "N/A"}</td>
        </tr>`
      )
      .join("");

    const results = `
      <table style="border: 1px solid black; width: 80%; margin: auto;">
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Rating</th>
        </tr>
        ${bookRows}
      </table>`;
    res.render("wishList", { bookList: results });
  } else {
    res.render("wishList", { bookList: "<p>No books in your wishlist.</p>" });
  }
});

app.get("/clearWishlist", (request, response) => {
  response.render("clearWishlist")
})

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

app.post("/wishList", async (req, res) => {
  const { title, author, rating } = req.body;

  // Add the book to the wishlist collection
  await addBook({ title, author, rating });

  // Retrieve the wishlist
  const allBooks = await getAllBooks();

  if (allBooks.length > 0) {
    const bookRows = allBooks
      .map(
        (book) => `
        <tr>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.rating || "N/A"}</td>
        </tr>`
      )
      .join("");

    const results = `
      <table style="border: 1px solid black; width: 80%; margin: auto;">
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Rating</th>
        </tr>
        ${bookRows}
      </table>`;
    res.render("wishList", { bookList: results });
  } else {
    res.render("wishList", { bookList: "<p>No books in your wishlist.</p>" });
  }
});

app.post("/clearWishlist", async (req, res) => {
  const numBook = await removeAll();
  res.render("clearWishlist", { totalBooks: numBook})
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
