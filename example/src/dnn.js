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

async function _registerDrawing(name, dnn){
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

async function _registerFraction(name, drawing){
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

function Circle(inX, inY) {
  this.x = inX;
  this.y = inY;
  this.r = 75;
  this.col = color(255, 150);
    
  this.display = function () {
    noStroke(0);
    fill(this.col);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
}


async function registerDrawing(drawings, dnn){

  const numberOfDrawings = drawings.length;

  if (numberOfDrawings > 0) {

    const allInstancesOfCircle = drawings.every (element => element instanceof Circle);
    
    if (allInstancesOfCircle) {
      if (checkCircleIntersect(drawings)){
        console.log("Intersection in one or more Circle instances!");
      } else {
        for (const element of drawings) {
          await _registerFraction(element, dnn);
        }
      }
    } else {
      console.log("One or more objects NOT a Circle instance");
    }
  } 

}

async function registerFraction(fractions, drawing){

  const numberOfFractions = fractions.length;

  if (numberOfFractions > 0) {

    const allInstancesOfCircle = fractions.every (element => element instanceof Circle);
    
    if (allInstancesOfCircle) {
      if (checkCircleIntersect(fractions)){
        console.log("Intersection in one or more Circle instances!");
      } else {
        for (const element of fractions) {
          await _registerFraction(element, drawing);
        }
      }
    } else {
      console.log("One or more objects NOT a Circle instance");
    }
  } 

}


function checkCircleIntersect(circles) {
  for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
          const circle1 = circles[i];
          const circle2 = circles[j];
          const distance = Math.sqrt(Math.pow(circle2.x - circle1.x, 2) + Math.pow(circle2.y - circle1.y, 2));
          if (distance <= circle1.radius + circle2.radius) {
              return true; // Circles intersect
          }
      }
  }
  return false; // No intersection found
}

export { 
  registerDNN, 
  registerDrawing, 
  registerFraction, 
  transferDrawing, 
  transferFraction
};