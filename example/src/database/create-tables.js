import { connection, closeDatabaseConnection } from "./connection.js";

const db = connection();

// Function to create a table
function createTable(tableName, createTableSQL) {
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(`Error creating ${tableName} table: ${err.message}`);
    } else {
      console.log(`${tableName} table created successfully.`);
    }
  });
}

// Create tables one at a time
createTable('DNN', createDnnTable());
createTable('Drawing', createDrawingTable());
createTable('Fraction', createFractionTable());

// Close the database connection
closeDatabaseConnection();

function createDnnTable() {
    return `
      CREATE TABLE IF NOT EXISTS Dnn (
        name PRIMARY KEY VARCHAR(255) NOT NULL,
        description TEXT,
        creator VARCHAR(255) NOT NULL,
        source_code TEXT NOT NULL,
        size VARCHAR(255),
        version VARCHAR(50) UNIQUE NOT NULL
      );
    `;
  }


  function createDrawingTable() {
    return `
      CREATE TABLE IF NOT EXISTS Drawing
        name VARCHAR(255) PRIMARY KEY,
        dnn VARCHAR(255) NOT NULL,
      );
    `;
  }
  
  function createFractionTable() {
    return `
      CREATE TABLE IF NOT EXISTS Fraction (
        name VARCHAR(255) PRIMARY KEY,
        drawing VARCHAR(255),
      );
    `;
  }
  