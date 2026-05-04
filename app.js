/**
 * @name view-groups
 * @description Returns scenario grouping data by scenarioId
 * @createdOn Apr 7th, 2026
 * @modifiedBy
 * @modifiedOn
 * @modificationSummary
 */

const {
  sendResponse,
  BadRequest,
  HTTP_RESPONSE_CODES,
} = require("utils/api_response_utils");
const { getActiveGroups } = require("./groupsService");
const { API_ERROR_MESSAGE } = require("constants/customConstants");

/**
 * @description Lambda handler for get groups API.
 * @param {Object} event: API event with query params:
    {
    "scenarioId": "uniqueScenarioId",
    "userEmail": "userEmail"
    }
 * @returns {Promise<Object>}: response sample is detailed below.
 *
 * Success response with status code 200:
 * {
   "scenarioId": "uniqueScenarioId",
   "data": [
      {
        "groupId": "uniqueGroupId",
        "groupScenarioMapId": "grp_scenario_mp_id uuid",
        "groupName": "Group 1",
        "vanningCenter": "TMH",
        "subSeriesList": ["NX Gas", "NX HV"]
      }
    ],
    "scenarioSteps": {
    "Line Level Inputs": {
      "Model Change Dates": "Completed",
      "NAMC Allocation Plan": "Completed",
      "NAMC Production Calendar": "Completed"
    },
    "Vanning Center Inputs": {
      "Shipping Pattern": "Completed",
      "Vanning Lead Time": "Completed",
      "TMC Working Day Calendar": "Completed"
    },
    "Grouping Settings": {
      "Grouping": "Completed",
      "Min Max DoH": "In Progress",
      "Fluctuation Allowance": "Not Started"
    },
    "other": [
      "Simulation",
      "Review",
      "Reports"
    ]
   }
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
     * @description Function to validate input and fetch groups response.
     * @param {Object} event: Input parameters
     * @returns {Promise<Object>} groupsData - groups details
     */
    const groupsData = await getActiveGroups(event);
    console.log("response:", groupsData);
    return sendResponse(HTTP_RESPONSE_CODES.SUCCESS, groupsData);
  } catch (err) {
    console.log("Handler Error - Get Groups API:", err);
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
      console.log("Validation error messages - Get Groups API: ", errorMessage);
    }
    return sendResponse(statusCode, { errorMessage: errorMessage });
  }
};
