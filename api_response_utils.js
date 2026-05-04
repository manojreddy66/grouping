/* API response common module */
const HTTP_RESPONSE_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  ACCESS_DENIED: 403,
};

/**
 * Util method to prepare and send the API response from the Lambda.
 * @param {number} status HTTP Status code of response. One of the values from HTTP_RESPONSE_CODES.
 * @param {object} responseBody The response object
 * @param {function} cb Callback function for the Lambda
 */
const sendResponse = (status, responseBody) => {
  const response = {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
      "Strict-Transport-Security":
        "max-age=63072000; includeSubDomains; preload", // HSTS header
    },
    body: JSON.stringify(responseBody),
    isBase64Encoded: false,
  };
  return response;
};

class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequest";
  }
}

class AccessDenied extends Error {
  constructor(message) {
    super(message);
    this.name = "AccessDenied";
  }
}

module.exports = {
  HTTP_RESPONSE_CODES,
  sendResponse,
  BadRequest,
  AccessDenied,
};
