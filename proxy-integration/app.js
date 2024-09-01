const https = require('https');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

exports.lambdaHandler = async (event, context) => {

  try {

    const apiResponse =  await makeHttpRequest(event);

    // Construct API Gateway response
    const response = {
        statusCode: 200,
        isBase64Encoded: false,
        body: JSON.stringify(apiResponse) ,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    };
    console.log("Proxy Response:", JSON.stringify(response));
    return response;
} catch (error) {
    console.error("Error processing the event:", error);
    return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" })
    };
}
  };


  const makeHttpRequest = (requestBody) => {
    return new Promise((resolve, reject) => {
  
      var query = "?";
      var jsonInput = requestBody;
      console.log("INPUT JSON", jsonInput);

      if (jsonInput.multiValueQueryStringParameters !== null) {
        for (const [key, values] of Object.entries(jsonInput.multiValueQueryStringParameters)) {
            for (let i = 0; i < values.length; i++) {
                query = `${query}${key}=${values[i]}&`;
            }
        }
    }
    
    if (query.endsWith('&')) {
        query = query.slice(0, -1);
    }
    
    const baseURL = 'reqres.in'

    var path =  jsonInput.path + query;
          const options = {
              hostname: baseURL,
              port: 443,
              path: '/api/users?page=2',
              method: jsonInput.httpMethod
          };
  
  const req = https.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                  return reject(new Error('statusCode=' + res.statusCode));
              }
              var body = [];
              res.on('data', function(chunk) {
                  body.push(chunk);
              });
              res.on('end', function() {
                  try {
                      body = JSON.parse(Buffer.concat(body).toString());
                  } catch(e) {
                      reject(e);
                  }
                  resolve(body);
              });
          });
          req.on('error', (e) => {
            reject(e.message);
          });
          // send the request
         req.end();
      });
  };  
  