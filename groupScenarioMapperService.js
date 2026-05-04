const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class groupScenarioMapperData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to validate groupIds exist in group_scenario_mapper for a scenario
   * @param {String} scenarioId - scenario id
   * @param {Array} groupIds - unique group ids
   * @returns {Array} active groupIds [{ groupId }]
   */
  async getGroupScenarioMapperData(scenarioId, groupIds) {
    try {
      return await this.prisma.$queryRaw`
        SELECT group_id AS "groupId"
        FROM supply_planning.group_scenario_mapper
        WHERE scenario_id = ${scenarioId}::uuid
          AND group_id IN (${Prisma.join(
            groupIds.map((groupId) => Prisma.sql`${groupId}::uuid`)
          )})
          AND is_active = true;
      `;
    } catch (err) {
      console.log("Error in getGroupScenarioMapperData:", err);
      throw err;
    }
  }
  /**
   * @description Function to bulk deactivate scenario links in group_scenario_mapper for update rows
   * @param {String} scenarioId - scenario UUID
   * @param {Array} groupScenarioMapIds - existing grp_scenario_mp_id values
   * @param {Array} groupNames - group names from input
   * @param {String} userEmail - user email for audit
   * @param {Object} tx - prisma transaction client
   * @returns {Promise<Number>} rows affected
   */
  async deactivateScenarioLinks(
    scenarioId,
    groupScenarioMapIds,
    groupNames,
    userEmail,
    tx = this.prisma
  ) {
    try {
      if (!groupScenarioMapIds || groupScenarioMapIds.length === 0) {
        return 0;
      }

      return await tx.$executeRaw`
UPDATE supply_planning.group_scenario_mapper sgm
SET
is_active = FALSE,
last_updated_timestamp = NOW(),
updated_by = ${userEmail}::text
FROM (
VALUES
${Prisma.join(groupScenarioMapIds.map((id) => Prisma.sql`(${id}::uuid)`))}
) AS v(grp_scenario_mp_id)
WHERE sgm.grp_scenario_mp_id = v.grp_scenario_mp_id
AND sgm.scenario_id = ${scenarioId}::uuid
AND sgm.group_name IN (${Prisma.join(groupNames)})
AND sgm.is_active = TRUE
`;
    } catch (err) {
      console.log("Error in deactivateScenarioLinks:", err);
      throw err;
    }
  }

  /**
   * @description Function to bulk upsert scenario links into group_scenario_mapper
   * @param {Array} linksData - array of { scenarioId, groupId, groupName, userEmail }
   * @param {Object} tx - prisma transaction client
   * @returns {Promise<Number>} rows affected
   */
  async upsertScenarioLinksBulk(linksData, tx = this.prisma) {
    try {
      if (!linksData || linksData.length === 0) {
        return 0;
      }

      return await tx.$executeRaw`
INSERT INTO supply_planning.group_scenario_mapper (
scenario_id,
group_id,
group_name,
is_active,
created_by
)
VALUES
${Prisma.join(
  linksData.map(
    (item) => Prisma.sql`(
${item.scenarioId}::uuid,
${item.groupId}::uuid,
${item.groupName}::text,
TRUE,
${item.userEmail}::text
)`
  )
)}
ON CONFLICT (scenario_id, group_id, group_name)
DO UPDATE SET
is_active = TRUE,
last_updated_timestamp = NOW(),
updated_by = EXCLUDED.created_by
`;
    } catch (err) {
      console.log("Error in upsertScenarioLinksBulk:", err);
      throw err;
    }
  }
}

module.exports.groupScenarioMapperData = groupScenarioMapperData;
