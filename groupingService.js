const { BaseService } = require("./BaseService");

class groupingData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to fetch groups data by scenarioId
   * Joins group_scenario_mapper, grouping, group_namc_line_series_mapper and namc_line_subseries
   * @param {String} scenarioId - scenario id
   * @returns {Array} groups data rows with groupScenarioMapId, groupName, vanningCenter, subSeries
   */
  async getGroupsDataByScenarioId(scenarioId) {
    try {
      return await this.prisma.$queryRaw`
        SELECT
          gp.group_id as "groupId",
          sgm.grp_scenario_mp_id as "groupScenarioMapId",
          sgm.group_name AS "groupName",
          gp.vanning_center AS "vanningCenter",
          nls.sub_series_description AS "subSeries"
        FROM supply_planning.group_scenario_mapper sgm
        JOIN supply_planning.grouping gp
          ON gp.group_id = sgm.group_id
        JOIN supply_planning.group_namc_line_series_mapper nlsm
          ON nlsm.group_id = gp.group_id
        JOIN supply_planning.namc_line_subseries nls
          ON nls.namc_line_series_id = nlsm.namc_line_series_id
        WHERE sgm.scenario_id = ${scenarioId}::uuid
          AND sgm.is_active = TRUE
          AND gp.is_active = TRUE
          AND nlsm.is_active = TRUE
          AND nls.is_active = TRUE;
      `;
    } catch (err) {
      console.log("Error in getGroupsDataByScenarioId:", err);
      throw err;
    }
  }

  /**
   * @description Check if every sub-series has at least one valid mapped group in the scenario
   * @param {String} scenarioId - scenario UUID
   * @param {Array} subSeriesList - expected sub-series description strings
   * @returns {boolean} true if all sub-series have groups
   */
  async isGroupsDataComplete(scenarioId, subSeriesList) {
    try {
      if (!subSeriesList || subSeriesList.length === 0) return false;
      const result = await this.prisma.$queryRaw`SELECT NOT EXISTS (
          SELECT 1
          FROM unnest(${subSeriesList}::text[]) AS inp(sub_series_description)
          WHERE NOT EXISTS (
            SELECT 1
            FROM supply_planning.group_scenario_mapper gsm
            INNER JOIN supply_planning.grouping g
              ON g.group_id = gsm.group_id
            INNER JOIN supply_planning.group_namc_line_series_mapper gnlsm
              ON gnlsm.group_id = g.group_id
            INNER JOIN supply_planning.namc_line_subseries nls
              ON nls.namc_line_series_id = gnlsm.namc_line_series_id
            WHERE gsm.scenario_id = ${scenarioId}::uuid
              AND nls.sub_series_description = inp.sub_series_description
              AND gsm.is_active = true
              AND g.is_active = true
              AND gnlsm.is_active = true
              AND nls.is_active = true
              AND g.effective_in <= CURRENT_DATE
              AND (g.effective_out IS NULL OR g.effective_out >= CURRENT_DATE)
          )
        ) AS is_complete;`;
      return result && result.length > 0 && result[0].is_complete === true;
    } catch (error) {
      console.log("Error in isGroupsDataComplete:", error);
      throw error;
    }
  }
}

module.exports.groupingData = groupingData;
