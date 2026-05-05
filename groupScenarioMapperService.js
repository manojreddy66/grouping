const { BaseService } = require("./BaseService");

class groupScenarioMapperData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Mock - validate groupIds in group_scenario_mapper
   */
  async getGroupScenarioMapperData(scenarioId, groupIds) {
    try {
      console.log(
        "******query******",
        `SELECT group_id AS "groupId" FROM supply_planning.group_scenario_mapper
         WHERE scenario_id = ${scenarioId}::uuid AND group_id IN (...) AND is_active = true;`
      );
      if (process.env.VALIDATION === "invalidgroupids") {
        return [];
      }
      if (process.env.VALIDATION === "groupmapperfetcherror") {
        throw new Error("Error in getGroupScenarioMapperData");
      }
      return groupIds.map((id) => ({ groupId: id }));
    } catch (err) {
      console.log("Error in getGroupScenarioMapperData:", err);
      throw err;
    }
  }
}

module.exports.groupScenarioMapperData = groupScenarioMapperData;
