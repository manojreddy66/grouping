/**
 * @description DB operations to fetch groups data and scenario step status
 */

const { dbConnect } = require("prismaORM/index");
const { groupingData } = require("prismaORM/services/groupingService");
const {
  getScenarioStepStatusData,
} = require("utils/scenario_step_status_utils");

/**
 * @description Function to fetch groups data and scenario steps status details
 * @param {String} scenarioId - scenarioId from input
 * @param {String} userEmail - userEmail from input
 * @returns {Promise<Array>} - groupsData & scenarioStepStatusData
 */
async function getGroupsNScenarioStepData(scenarioId, userEmail) {
  const rdb = await dbConnect();
  const groupingService = new groupingData(rdb);
  try {
    return await Promise.all([
      /**
       * @description Fetch groups data by scenarioId
       * Joins group_scenario_mapper, grouping, group_namc_line_series_mapper
       * and namc_line_subseries tables
       * @returns {Promise<Array>} groupsData - groups details for the given scenarioId
       */
      groupingService.getGroupsDataByScenarioId(scenarioId),
      /**
       * @description Fetch scenario steps data by scenarioId
       * @returns {Promise<Object>} scenarioStepStatusData - scenario steps data
       */
      getScenarioStepStatusData(scenarioId, userEmail, rdb),
    ]);
  } catch (err) {
    console.log("Error in getGroupsNScenarioStepData:", err);
    throw err;
  }
}

module.exports = {
  getGroupsNScenarioStepData,
};
