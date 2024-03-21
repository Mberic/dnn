import sqlite3 from 'sqlite3';
import path from 'path';

const currentModuleUrl = new URL(import.meta.url);
const currentModulePath = path.dirname(currentModuleUrl.pathname);
const absolutePath = path.resolve(currentModulePath, './dao.db');

let dbInstance = null;

function connection(){
  const db = new sqlite3.Database(absolutePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    } else {
    }
  });

  return db;
}

// Close the database connection
function closeDatabaseConnection(db) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error(`Error closing database connection: ${err.message}`);
          reject(err);
        } else {
          console.log('Closed the database connection');
          resolve();
        }
      });
    } else {
      // Resolve if there is no database connection to close
      resolve();
    }
  });
}

export { connection, closeDatabaseConnection };
