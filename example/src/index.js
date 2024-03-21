import { ethers } from "ethers";

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

async function action_proxy(payload, address){

  const obj = JSON.parse(payload);

  let action = obj.action;
  let params = obj.params;

  let result;

  switch(action){
    case "registerDNN":
      result = await registerDNN(...params);

      let a = await registerDrawing(...params);
      let b = registerFraction(...params);
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

// This is an internal function UNLIKE action_proxy which must be accessed externally
function _action_proxy(actionObject){

  let action = actionObject.action;
  let params = actionObject.params;

  let result;

  switch(action){
    case "addAddresses":
        result = addAddresses(...params);
        console.log("Execution of add address request :" + result);
        break;
    case "removeAddresses":
      result = removeAddresses(...params);
      console.log("Execution of remove address request :" + result);
      break;
    default:
        console.log("Failed to execute any action");
    }
}


function hexToText(hexString){
  // Remove the "0x" prefix if present
  const hexWithoutPrefix = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
     
  // Convert hex to Uint8Array
  const byteArray = new Uint8Array(hexWithoutPrefix.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  // Create a TextDecoder
  const textDecoder = new TextDecoder("utf-8");

  // Convert the Uint8Array to text
  const text = textDecoder.decode(byteArray);

  return text;

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