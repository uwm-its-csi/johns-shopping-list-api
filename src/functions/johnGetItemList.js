// Import required modules
const { app } = require("@azure/functions"); // Azure Functions module
const mongodb = require("mongodb"); // MongoDB driver for Node.js

// Define an HTTP-triggered function named 'johnGetItemList'
app.http("johnGetItemList", {
  methods: ["GET"], // The function responds to HTTP GET requests
  authLevel: "anonymous", // No authentication required to access this function
  handler: async (request, context) => { // Asynchronous handler function
    // Logs a message to the Azure Function console for debugging purposes
    context.log("Function to fetch all items from shopping list.");

    // Retrieves the Cosmos DB connection string from environment variables
    // This is a secure way to access sensitive information without hardcoding it in your source code
    const mongoUrl = process.env["COSMOSDB_CONNECTION_STRING"];

    // The name of the database and collection in Cosmos DB that you want to access
    const dbName = "shoppinglist";
    const collectionName = "itemlist";

    try {
      // Connects to the Cosmos DB using the MongoDB driver
      // 'await' pauses the function execution until the connection is established
      const client = await mongodb.MongoClient.connect(mongoUrl, {
        useNewUrlParser: true, // Use the new URL parser for MongoDB connection strings
        useUnifiedTopology: true, // Enables the new unified topology layer for MongoDB
      });

      // Once connected, access the specific database by its name
      const database = client.db(dbName);

      // Access the specific collection within the database
      const collection = database.collection(collectionName);

      // Find all documents in the collection
      // '{}' is a query that matches all documents
      // 'toArray' converts the result to an array format
      const items = await collection.find({}).toArray();

      // Close the connection to the database
      // This is important to free up resources
      await client.close();

      // Return a successful response containing the items
      return {
        body: JSON.stringify(items), // The items in JSON format
        status: 200, // HTTP status code 200 means "OK"
        headers: { "Content-Type": "application/json" }, // Set the content type of the response
      };
    } catch (error) {
      // If an error occurs in the try block, this catch block is executed
      // Here, we prepare an error response with status code 500, which means
      // "Internal Server Error", and include the error message
      return {
        body: `Error occurred: ${error.message}`, // The error message
        status: 500, // HTTP status code 500 means "Internal Server Error"
        headers: { "Content-Type": "application/json" }, // Set the content type of the response
      };
    }
  },
});
