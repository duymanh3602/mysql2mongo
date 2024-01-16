// Import the required libraries
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

// Define the MySQL connection details
const mysqlConfig = {
  host: '',
  port: 3306,
  user: '',
  password: '',
  database: '',
};

// Define the MongoDB connection details
const mongoConfig = {
  url: 'mongodb+srv://manhdd362:EgEN59Z9hScyxSf3@hoclieu.1ewdo68.mongodb.net/test?retryWrites=true&w=majority',
  database: 'hoclieu',
  collection: 'questions',
};

// Define the Cloudflare Worker event listener
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

// Handle the incoming request
async function handleRequest(request) {
  try {
    // Establish a connection to the MySQL database
    const connection = await mysql.createConnection(mysqlConfig);

    // Execute the SQL query to retrieve data
    const [rows] = await connection.execute('SELECT * FROM questions');

    // Close the MySQL database connection
    await connection.end();

    // Format the retrieved data as desired (e.g., JSON)
    const data = JSON.stringify(rows);

    // Connect to the MongoDB database
    const client = new MongoClient(mongoConfig.url);
    await client.connect();
    const db = client.db(mongoConfig.database);

    // Save the data to the MongoDB collection
    await db.collection(mongoConfig.collection).insert(data);

    // Close the MongoDB database connection
    await client.close();

    // Return a success response
    // const response = new Response('Hello, World!', {
    //     status: 200,
    //     headers: { 'Content-Type': 'text/plain' },
    // });
    console.log('Done!',);
  } catch (error) {
    console.error('Error: ', error);
    // return new Response('Internal Server Error', { status: 500 });
  }
}

function addEventListener(arg0: string, arg1: (event: any) => void) {
    throw new Error("Function not implemented.");
}
