/**
 * @description this file contains request validation methods
 */

const { dbConnect } = require("prismaORM/index");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  getValidationSchema,
} = require("schemaValidator/supplyPlanning/grouping/getGroupsSchema");

/**
 * @description Function to validate input request query params
 * @param {Object} inputParams: API input query params
 * @returns {Promise<Array>} errorMessages - Validation errors if any
 */
async function validateInput(inputParams) {
  const errorMessages = [];
  /**
   * @description Validate request query params using Joi schema
   * @param {Object} inputParams - request query params
   * @param {Array} errorMessages - array of validation errors
   */
  validateParams(inputParams, errorMessages);
  /* If Joi input validation was successful, check if scenario exists or not*/
  if (errorMessages.length === 0) {
    /**
     * @description Function to check if a scenario exists
     * @param {Object} inputParams: Input request payload
     * @param {Array} errorMessages: array to collect validation errors
     * @returns {Promise<boolean>} Throws error if scenario doesn't exist
     */
    await checkForInvalidScenario(inputParams, errorMessages);
  }
  return { errorMessages };
}

/**
 * @description Function to validate request params using Joi schema
 * @param {Object} inputParams - request query params
 * @param {Array} errorMessages - array to collect validation errors
 */
function validateParams(inputParams, errorMessages) {
  // Validation options to collect all error messages
  const options = { abortEarly: false };
  const schema = getValidationSchema();
  const { error } = schema.validate(inputParams, options);
  if (error) {
    error.details.forEach((detail) => {
      errorMessages.push(detail.message);
    });
  }
}

/**
 * @description Function to check if a scenario exists
 * @param {Object} inputParams: Input request query params
 * @param {Array} errorMessages: array to collect validation errors
 * @returns {Promise<boolean>} Throws error if scenario doesn't exist
 */
async function checkForInvalidScenario(inputParams, errorMessages) {
  /* Connecting to DB instance */
  const rdb = await dbConnect();
  const scenariosDataService = new scenariosData(rdb);
  try {
    /**
     * @description Get scenario data by scenarioId
     */
    const scenarioData = await scenariosDataService.getScenarioDataById(
      inputParams.scenarioId
    );
    /* Check if scenario doesn't exist */
    if (!scenarioData || scenarioData.length === 0) {
      errorMessages.push(`ValidationError: Scenario doesn't exist.`);
    }
  } catch (err) {
    console.log("Error in checkForInvalidScenario:", err);
    throw err;
  }
}

module.exports = {
  validateInput,
};
