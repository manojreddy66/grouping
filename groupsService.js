/**
 * @description this file contains get groups service methods
 */

const { validateInput } = require("./validateRequest");
const { prepareResponse } = require("./utils");
const { getGroupsNScenarioStepData } = require("./groups");
const { BadRequest } = require("utils/api_response_utils");

/**
 * @description Function to validate input request, fetch data from DB and prepare final response
 * @param {Object} event - Lambda event object
 * @returns {Promise<Object>} formatted response object
 */
async function getActiveGroups(event) {
  try {
    const queryParams = event?.queryStringParameters || {};
    console.log("queryParams:", queryParams);
    /**
     * @description Validate request query params
     * @param {Object} queryParams - request query params
     * @returns {Promise<Object>} response object containing validation errors if any
     */
    const { errorMessages } = await validateInput(queryParams);
    if (errorMessages.length > 0) {
      throw new BadRequest(errorMessages);
    }
    /* Extract scenarioId & userEmail from input */
    const { scenarioId, userEmail } = queryParams;
    /**
     * @description Fetch groups data and scenario steps data
     * @param {String} scenarioId - scenarioId from input
     * @param {String} userEmail - userEmail from input
     * @returns {Promise<Array>} groupsData & scenarioStepStatusData
     */
    const [ groupsData, scenarioStepStatusData ] =
      await getGroupsNScenarioStepData(
        scenarioId,
        userEmail
      );
    /**
     * @description Prepare and return response
     * @returns {Object} formatted response containing scenarioId, groups data and scenario steps
     */
    return prepareResponse(
      scenarioId,
      groupsData,
      scenarioStepStatusData
    );
  } catch (err) {
    console.log("Error in getActiveGroups:", err);
    throw err;
  }
}

module.exports = {
  getActiveGroups,
};
