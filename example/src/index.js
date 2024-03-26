import { ethers } from "ethers";
import puppeteer from 'puppeteer';

import { registerDNN, registerDrawing, registerFraction, transferDrawing, transferFraction } from "./dnn.js";
import fs from 'fs';

function readFileContents(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const filePath = 'node_modules/p5/lib/p5.js';
let p5Module;

readFileContents(filePath)
  .then(contents => {
    p5Module = contents;
    // Use the file contents as needed
  })
  .catch(error => {
    console.error('Error reading file:', error);
  });

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  let checksumAddress = ethers.getAddress( data.metadata.msg_sender );
  action_proxy(hexToText(data.payload), checksumAddress );
  return "accept";
}

async function handle_inspect(data) {
  
  console.log("Received inspect request data " + JSON.stringify(data));
  
  const payload = hexToText(data["payload"]);
  const report = await inspect_proxy(payload.toString());
  const utf8Bytes = new TextEncoder().encode(report);
  const hexString = ethers.hexlify(utf8Bytes);

  const inspect_req = await fetch(rollup_server + '/report', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "payload": hexString })
  });
  
  return "accept";
}


async function action_proxy(payload, address){

  const obj = JSON.parse(payload);

  const action = obj.action;
  const params = obj.params;

  let result;

  switch(action){
    case "registerDNN":

    (async () => {
      // Launch a headless browser instance
      const browser = await puppeteer.launch({ headless: true });
    
      // Create a new page
      const page = await browser.newPage();
    
      // Set the viewport size
      await page.setViewport({ width: 600, height: 600 });
    
      // Define your JavaScript code as a string
      const jsCode = params.source_code;
      
      // Create the HTML content with the JavaScript code injected
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>p5.js Code</title>
          <script>${p5Module}</script>
          <script>${jsCode}</script>
        </head>
        <body>
        </body>
        </html>
      `;
    
      // Set the content of the page to the HTML content
      await page.setContent(htmlContent);

      const dnn_name = params.name;
      const fractionsValues = [];

      // Evaluate the JavaScript code in the page context to call getDrawings function
      const drawings = await page.evaluate(() => {
        return dnn.getDrawings();
      });
      
            // Evaluate the JavaScript code in the page context to call getDrawings function
      const fractionsMap = await page.evaluate(() => {
        return dnn.getFractions();
      });

      if ( fractionsMap.size > 0 ){
        for (const x of fractionsMap.values()) {
          fractionsValues.push(x);
        }
        await registerFraction (fractionsValues, drawings);
      } {
        console.log("\nNo fractions\n")
      }
     
      await registerDrawing (drawings, dnn_name);
      result = await registerDNN(params);

      // Wait for the page to render
      await new Promise(resolve => setTimeout(resolve, 2000)); // Adjust the timeout as needed
    
      // Capture a screenshot of the rendered page
      await page.screenshot({ path: 'output.png' });
    
      // Close the headless browser instance
      await browser.close();
    })();
    
      break;
    case "transferDrawing":
      result = transferDrawing(...params);
      break;
    case "transferFraction":
      result = transferFraction(...params);
      break;
    default:
      console.log("\nFailed to execute any action\n");
  }
}

function hexToText(hexString){
  
  const hexWithoutPrefix = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  const byteArray = new Uint8Array(hexWithoutPrefix.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const textDecoder = new TextDecoder("utf-8");
  const text = textDecoder.decode(byteArray);

  return text;
}

async function inspect_proxy(payload) {
  
  let report;

  switch (payload) {
    case 'protocol-version':
      report = await protocolVersion();
      break;
    default:
      report = 'Inspect action failed';
  }

  return report;
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();