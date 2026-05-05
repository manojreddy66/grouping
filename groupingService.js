const { BaseService } = require("./BaseService");

/**
 * @description Mock service for grouping API
 * This mock follows repo pattern (process.env based branching)
 */

class groupingData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to fetch groups data by scenarioId
   */
  async getGroupsDataByScenarioId(scenarioId) {
    try {
      console.log(
        "*********query***********",
        `SELECT gp.groupId, sgm.grp_scenario_mp_id, sgm.group_name, gp.vanning_center, nls.sub_series_description
         FROM supply_planning.group_scenario_mapper sgm
         JOIN supply_planning.grouping gp ON gp.group_id = sgm.group_id
         JOIN supply_planning.group_namc_line_series_mapper nlsm ON nlsm.group_id = gp.group_id
         JOIN supply_planning.namc_line_subseries nls ON nls.namc_line_series_id = nlsm.namc_line_series_id
         WHERE sgm.scenario_id = ${scenarioId}::uuid
         AND sgm.is_active = TRUE AND gp.is_active = TRUE AND nlsm.is_active = TRUE AND nls.is_active = TRUE;`
      );

      // Simulate DB error
      if (process.env.VALIDATION === "groupsdberror") {
        throw new Error("getGroupsDataByScenarioId DB error");
      }

      // No data case
      if (process.env.VALIDATION === "nodata") {
        return [];
      }

      // Default sample rows (flat rows before grouping)
      return [
        {
          groupId: "uniqueGroupId",
          groupScenarioMapId: "grp-uuid-0001",
          groupName: "Group 1",
          vanningCenter: "TMH",
          subSeries: "NX Gas",
        },
        {
          groupId: "uniqueGroupId",
          groupScenarioMapId: "grp-uuid-0001",
          groupName: "Group 1",
          vanningCenter: "TMH",
          subSeries: "NX HV",
        },
        {
          groupId: "uniqueGroupId",
          groupScenarioMapId: "grp-uuid-0001",
          groupName: "Group 1",
          vanningCenter: "TMH",
          subSeries: "NX HV",
        },
        {
          groupId: "uniqueGroupId",
          groupScenarioMapId: "grp-uuid-0002",
          groupName: "Group 2",
          vanningCenter: "TMK",
          subSeries: "Sienna",
        },
        {
          groupId: "uniqueGroupId",
          groupScenarioMapId: "grp-uuid-0002",
          groupName: "Group 2",
          vanningCenter: "TMK",
          subSeries: "Highlander",
        },
      ];
    } catch (err) {
      console.log("Error in getGroupsDataByScenarioId:", err);
      throw err;
    }
  }

  /**
   * @description Mock: Check if every sub-series has at least one valid mapped group
   * @param {String} scenarioId - scenario UUID
   * @param {Array} subSeriesList - expected sub-series description strings
   * @returns {boolean} true if all sub-series have groups
   */
  async isGroupsDataComplete(scenarioId, subSeriesList) {
    try {
      console.log(
        "*********query***********",
        `SELECT NOT EXISTS (...) AS is_complete for scenario_id = ${scenarioId}::uuid with subSeriesList = ${subSeriesList}`
      );
      if (process.env.COMPLETENESS === "nodata") {
        return false;
      }
      if (process.env.COMPLETENESS === "partialsubseries") {
        return false;
      }
      if (process.env.COMPLETENESS === "dberror") {
        throw new Error("isGroupsDataComplete DB error");
      }
      return true;
    } catch (error) {
      console.log("Error in isGroupsDataComplete:", error);
      throw error;
    }
  }
}

module.exports.groupingData = groupingData;
