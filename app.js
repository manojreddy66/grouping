/**
 * @name update-groups
 * @description Returns success message after creating/updating groups for a scenario
 * @createdOn Apr 30th, 2026
 * @author Priyadarshini Gangone
 * @modifiedBy
 * @modifiedOn
 * @modificationSummary
 */

const {
  sendResponse,
  BadRequest,
  HTTP_RESPONSE_CODES,
} = require("utils/api_response_utils");
const { upsertGroupData } = require("./groupsService");
const { API_ERROR_MESSAGE } = require("constants/customConstants");

/**
 * @description Lambda handler for POST Groups API.
 * @param {Object} event: API event with request body:
  {
    "scenarioId": "uniqueScenarioId",
    "userEmail": "user@toyota.com",
    "data": [
      {
        "groupScenarioMapId": "grp_scenario_mp_id uuid",
        "groupName": "Group1",
        "vanningCenter": "TMK",
        "subSeriesList": ["CAMRY", "RAV4 Gas"]
      },
      {
        "groupScenarioMapId": 1,
        "groupName": "Group2",
        "vanningCenter": "TMH",
        "subSeriesList": ["HighLander"]
      }
    ]
  }
 * @returns {Promise<Object>}: response sample is detailed below.
 * Success response with status code 200:
 * {
    "message": "Successfully updated data."
   }
 * In-valid input error with status 400:
  {
    "errorMessage": [<"ValidationError: validation error message">]
  }
 * Internal server error with status code 500:
  {
    "errorMessage": "Internal Server Error"
  }
 */
exports.handler = async (event) => {
  try {
    /**
     * @description Function to validate input and create/update groups.
     * @param {Object} event: Input parameters
     * @returns {Object} result - success response
     */
    const result = await upsertGroupData(event);
    console.log("Update Groups Response:", result);
    return sendResponse(HTTP_RESPONSE_CODES.SUCCESS, result);
  } catch (err) {
    console.log("Update Groups Handler Error:", err);
    let errorMessage = API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    let statusCode = HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR;
    /**
     * @description If error is BadRequest, return 400 with validation messages
     */
    if (err instanceof BadRequest) {
      statusCode = HTTP_RESPONSE_CODES.BAD_REQUEST;
      errorMessage = err.message
        .split(/,(?=ValidationError:)/)
        .map((e) => e.trim());
      console.log(
        "Validation error messages - Update Groups API:",
        errorMessage
      );
    }
    return sendResponse(statusCode, { errorMessage });
  }
};