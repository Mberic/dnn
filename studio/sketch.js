class DNN {
  constructor() {
    this.drawings = [];
    this.fractions = new Map();
  }

  getDrawings() {
    return this.drawings;
  }

  getFractions() {
    return this.fractions;
  }
}

class Circle {
  constructor(inX, inY) {
    this.x = inX;
    this.y = inY;
    this.r = 75;
    this.col = color(255, 150);
  }

  intersects(other) {
    // Check if the distance between the two circles is less
    // than both of radii added together, then they overlap
    return dist(this.x, this.y, other.x, other.y) < this.r + other.r;
  }

  display() {
    noStroke();
    fill(this.col);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
}

const dnn = new DNN();
const circles = [];

function setup() {
  createCanvas(600, 600);
  
  circles.push(new Circle(220, 150));
  circles.push(new Circle(100, 350));
  dnn.drawings = circles;
}

function draw() {
  background(90);
  
  for (let i = 0; i < circles.length; i++) {
    circles[i].display();
    for (let j = i + 1; j < circles.length; j++) {
      if (circles[i].intersects(circles[j])) {
        stroke(255, 0, 255);
        line(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
      }
    }
  }
}
