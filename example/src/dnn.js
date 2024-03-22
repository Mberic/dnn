import { connection, closeDatabaseConnection } from "./database/connection.js";

async function registerDNN(input){
    return new Promise((resolve, reject) => {
        const db = connection();
    
        db.run('INSERT INTO Dnn (name, creator, description, source_code) VALUES (?, ?, ?, ?)', [input.name, input.creator, input.description, input.source_code], (err) => {
          closeDatabaseConnection(db);
    
          if (err) {
            console.error(`Error in vote: ${err.message}`);
            reject(err);
          } else {
            resolve();
          }
        });
      });
}

async function registerDrawing(name, dnn){
    return new Promise((resolve, reject) => {
        const db = connection();
    
        db.run('INSERT INTO Drawing (name, dnn) VALUES (?, ?)', [name, dnn], (err) => {
          closeDatabaseConnection(db);
    
          if (err) {
            console.error(`Error in vote: ${err.message}`);
            reject(err);
          } else {
            resolve();
          }
        });
      });
}

async function registerFraction(name, drawing){
    return new Promise((resolve, reject) => {
        const db = connection();
    
        db.run('INSERT INTO Fraction (name, drawing) VALUES (?, ?)', [name, drawing], (err) => {
          closeDatabaseConnection(db);
    
          if (err) {
            console.error(`Error in vote: ${err.message}`);
            reject(err);
          } else {
            resolve();
          }
        });
      });
}

async function transferDrawing(to){

}

async function transferFraction(to){

}

export { registerDNN, registerDrawing, registerFraction, transferDrawing, transferFraction};