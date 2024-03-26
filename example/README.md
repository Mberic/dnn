Let's see how to create a simple DNN.

## Step 1

First, sketch your DNN using the `p5.js` library. You can go to the `studio/` directory to do this. The sketch.js file hold the code for your DNN. 

To run the sketch in `studio/`, start a local Javascript server. See the Tools section.

## Step 2

After creating your drawing, it's time to register it to the blockchain. For this we use the registerDNN API. See the API.md in project root for description.

Each request to advance the DApp state is sent as a JSON string with the following format:

```
{ "action": "methodName", "params": [ ] }
```
**NOTE**: Ensure that you're using straight quotes and not curved quotes. Otherwise, you'll get a parsing error.

The `action` field contains the function identifier. The `params` field contains all the arguments of a given function, in the order of its function signature.

For interactions that inspect the DApp, we make an HTTP call in the link format below:

```
http://127.0.0.1:8080/inspect/action

```

## Installing dependencies

Go to both `example/` and `example/src/database` and run:

```
npm install
```

In  `example/`, we are installing Puppeteer, ethersJs and p5.js
In  `example/src/database`, we are installing sqlite3

You also need to install a browser for Puppeteer:
 
 ```
 npx puppeteer browsers install chrome
 ```

We'll also need to install a tool called `uglify`. It minifies our Js source code before sending it to the blockchain.

```
npm install uglify-js -g
```

## Running the DApp 

Finally, let's see some things in action. Build the DApp's docker image using (ensure that you have Docker running):

```
# run this from the project root i.e `example/`
sunodo build
```

Next, run the DApp. For testing purposes, it's good to first run the backend on the host machine before running it in a node. To achieve this, run the DApp with the `--no-backend` flag on sunodo:

```
sunodo run --no-backend
```

Next set the HTTP server env variable (this is used by `index.js`):

```
export ROLLUP_HTTP_SERVER_URL=http://127.0.0.1:8080/host-runner
```

Now open a new terminal window and run the `index.js` file.

```
node src/index.js

```
Once again, open a new terminal window (this is the 3rd one). In this window, is where we will be interacting with our DApp (i.e. sending inputs ). Run the command below:

```
sunodo send generic 
```

Your selection should be as follows:

```
? Chain Foundry
? RPC URL http://127.0.0.1:8545
? Wallet Mnemonic
? Mnemonic test test test test test test test test test test test junk
? Account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 9999.969241350387558666 ETH
? DApp address (0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C)
? Input String encoding
```

In the input field, enter: 

```
{ "action" : "registerDNN", "params": { "name": "Expample1", "creator": "erick", "description": " Circle drawings", "source_code" : "class DNN{constructor(){this.drawings=[];this.fractions=new Map}getDrawings(){return this.drawings}getFractions(){return this.fractions}}class Circle{constructor(inX,inY){this.x=inX;this.y=inY;this.r=75;this.col=color(255,150)}intersects(other){return dist(this.x,this.y,other.x,other.y)<this.r+other.r}display(){noStroke();fill(this.col);ellipse(this.x,this.y,this.r*2,this.r*2)}}const dnn=new DNN;const circles=[];function setup(){createCanvas(600,600);circles.push(new Circle(220,150));circles.push(new Circle(100,350));dnn.drawings=circles}function draw(){background(90);for(let i=0;i<circles.length;i++){circles[i].display();for(let j=i+1;j<circles.length;j++){if(circles[i].intersects(circles[j])){stroke(255,0,255);line(circles[i].x,circles[i].y,circles[j].x,circles[j].y)}}}}" } }

```

You can check the output on the terminal running `index.js`.

To know whether everything is running as it should, you can check the dao.db file to know if the input reached:

```
sqlite3 src/core/database/dao.db
```
Inside the SQLite terminal run, **SELECT * FROM Dnn**;

Viola! You should be able to see the input.

## What happens at the backend ?

Let's briefly discuss what happens at the backend when you call the registerDNN API. The following is a high-level overview:

- When you `registerDNN`, two other internal functions are called: `registerDrawing` and `registerFraction`. 
- `registerDrawing` checks the following before recording it in the database: 
If the drawing object is an instance of a valid shape ( for the PoC we only use a circle. Later, we'll includes checks for more advanced geometries such as polygons & curves ). 
If there's an area intersection between any 2 drawings 
- `registerFraction`.  This also works similarly to `registerDrawing`. Though, it checks for the intersection between ALL fractions on the canvas/DNN.
