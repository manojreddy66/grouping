/**
 * @description this file contains get groups common utils
 */

/**
 * @description Function to prepare groups response
 * @param {String} scenarioId - scenarioId from input
 * @param {Array} groupsData - groups details (flat rows from DB join)
 * @param {Object} scenarioStepStatusData - scenario step status details
 * @returns {Object} response - Formatted response
 */
function prepareResponse(scenarioId, groupsData, scenarioStepStatusData) {
  return {
    scenarioId,
    data: formatGroupsData(groupsData),
    scenarioSteps: scenarioStepStatusData,
  };
}

/**
 * @description Function to format flat groups rows into grouped response
 * Groups flat DB rows by groupScenarioMapId and aggregates subSeries into subSeriesList
 * @param {Array} groupsData - flat rows from DB query with groupScenarioMapId, groupName, vanningCenter, subSeries
 * @returns {Array} formatted groups array with subSeriesList
 */
function formatGroupsData(groupsData) {
  if (!groupsData || groupsData.length === 0) {
    return [];
  }

  /**
   * @description Group flat rows by groupScenarioMapId
   * and collect subSeries into subSeriesList array
   */
  const groupMap = {};
  groupsData.forEach((row) => {
    if (!groupMap[row.groupScenarioMapId]) {
      groupMap[row.groupScenarioMapId] = {
        groupId: row.groupId,
        groupScenarioMapId: row.groupScenarioMapId,
        groupName: row.groupName,
        vanningCenter: row.vanningCenter,
        subSeriesList: new Set(),
      };
    }
    groupMap[row.groupScenarioMapId].subSeriesList.add(row.subSeries);
  });

  /**
   * @description Convert grouped object into response array format
   * and convert Set to Array for subSeriesList
   */
  return Object.values(groupMap).map((group) => ({
    ...group,
    subSeriesList: [...group.subSeriesList],
  }));
}

module.exports = {
  prepareResponse,
};
