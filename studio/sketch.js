
const dnn = new DNN();
const circles = [];
const numCircles = 10;

function setup() { 
  createCanvas(600, 600);
  
  circles[0] = new Circle(220, 300);
  circles[1] = new Circle(100, 350);
} 

function draw() { 
  background(90);
  // check each circle...
  for (let i = 0; i < circles.length; i++) {
   
    circles[i].display();
    //... against every other circle
    for (let j = 0; j < circles.length; j++) {
      if (i != j  &&  circles[i].intersects(circles[j])) {
        // draw a line between the circles if they intersect,
        // excluding the case where the circle is compared to itself
        stroke(255, 0, 255);
        line(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
      }
    }
  }
}

function Circle(inX, inY) {
  this.x = inX;
  this.y = inY;
  this.r = 75;
  this.col = color(255, 150);
  
  this.intersects = function (other) {
    // if the distance between the two circles is less
    // than both of radii added together, then they overlap
    return dist(this.x, this.y, other.x, other.y) < this.r + other.r;
  }

  this.display = function () {
    noStroke(0);
    fill(this.col);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
}

function DNN(){
  this.drawings = [];
  this.fractions = new Map();

  this.getDrawings = function() {
    return this.drawings;
  }
  
  this.getFractions = function(){
    return this.fractions;
  }
}
