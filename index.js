import express from "express";
import http from "http";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();
let signingSecret = "YOURSIGNINGSECRETHERE"

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);

app.post("/subscribe", function (req, res) {
	console.log("Subscribe endpoint called: ", req.body)
	res.send(res.body);
  });
  
  app.post("/unsubscribe", function (req, res) {
	console.log("Unsubscribe endpoint called: ", req.body)
	res.send(req.body);
  });

app.post("/getFields", function(req, res) {
	console.log("Get fields called: ", req.body);
	// In the next listeners, I am stating the fields from my 3rd party object that are to be mapped with my monday board's columns
	return res.status(200).send([
		{ id: 'name', title: 'Name', outboundType: 'text', inboundTypes: ['text', 'empty_value'] },
		{ id: 'age', title: 'Age', outboundType: 'numeric', inboundTypes: ['empty_value', 'numeric'] },
		{ id: 'id', title: 'ID', outboundType: 'numeric', inboundTypes: ['empty_value', 'numeric'] },
	  ]);
	}
);

// When adding a new item into my board, I will use a call that includes this:
// {
// 	"trigger": {
// 	  "outputFields": { 
// 		  "objectFromMyOtherPlatform": {
// 			  "name": "Matias",
// 			  "age": 31,
// 			  "id": 12345
// 			  }
// 		  }
// 	  }
//   }
// And the HTTP request will be sent as a POST request to the webhook URL I got in my subscribe endpoint when the recipe was added into the board. The Authorization in the headers must be the app's signing secret.

app.post("/updateMyThirdPartyObject", function (req, res) {
	console.log("Action run URL called: ", req.body)
	// In the next line, I am using my app's signing secret to get a shortLivedToken from the authorization field in the headers
	const {shortLivedToken} = jwt.verify(req.headers.authorization, signingSecret);
	// In the next line, I am setting the shortLivedToken I got for my API call
	monday.setToken(shortLivedToken)
	// In the next line, I am using monday's SDK to make a query
	monday.api(`{items(ids: ${req.body.payload.inputFields.itemId}) {name column_values {title id value text } } }`).then(res => console.log("Item data: ", res.data.items[0], "Then, I would take this data, and update my object in my other platform with it"))
	// After this step, I would send this information over to my object in the 3rd party platform
	res.status(200).send(req.body)	
  });

server.listen(process.env.PORT || 3000, function() {
	console.log('Express server listening on port 3000.');

})