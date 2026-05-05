/**
 * @description DB operations to update/create groups, upsert scenario links,
 * and update scenario step status
 */

const { dbConnect } = require("prismaORM/index");
const { groupingData } = require("prismaORM/services/groupingService");
const {
  groupScenarioMapperData,
} = require("prismaORM/services/groupScenarioMapperService");
const {
  namcLineSubseriesData,
} = require("prismaORM/services/namcLineSubseriesService");
const {
  groupNamcLineSeriesMapperData,
} = require("prismaORM/services/groupNamcLineSeriesMapperService");
const {
  scenarioStepStatusData,
} = require("prismaORM/services/scenarioStepStatusService");
const { scenariosData } = require("prismaORM/services/scenariosService");
const { VALID_STEP_NAMES } = require("constants/customConstants");
const { updateScenarioNStepStatus } = require("utils/common_utils");
const {
  segregateUpdateAndNewGroupInput,
  prepareScenarioLinksData,
} = require("./utils");

/**
 * @description Function to create/update groups and update scenario step status
 * @param {Object} body - request payload
 * @param {Object} scenarioData - scenario row for the given scenarioId
 * @returns {Promise<void>}
 */
async function upsertGroupsNStepStatus(body, scenarioData) {
  const rdb = await dbConnect();
  const groupingService = new groupingData(rdb);
  const groupScenarioMapperService = new groupScenarioMapperData(rdb);
  const namcLineSubseriesService = new namcLineSubseriesData(rdb);
  const groupNamcLineSeriesMapperService = new groupNamcLineSeriesMapperData(
    rdb
  );
  const scenarioStepStatusDataService = new scenarioStepStatusData(rdb);
  const scenariosDataService = new scenariosData(rdb);
  try {
    await rdb.prisma.$transaction(async (tx) => {
      const { updateGroups, newGroups } = segregateUpdateAndNewGroupInput(body.data);
      const allInputGroups = [...updateGroups, ...newGroups];
      /**
       * @description Deactivate old scenario links for update rows only
       */
      if (updateGroups.length > 0) {
        await groupScenarioMapperService.deactivateScenarioLinks(
          body.scenarioId,
          updateGroups.map((item) => item.groupScenarioMapId),
          updateGroups.map((item) => item.groupName),
          body.userEmail,
          tx
        );
      }
      /**
       * @description Process each row and collect chosen group ids
       */
      const finalGroupsData = [];
      for (const item of allInputGroups) {
        const groupId = await fetchExistingOrCreateNewGroup(
          item,
          scenarioData,
          body.userEmail,
          groupingService,
          namcLineSubseriesService,
          groupNamcLineSeriesMapperService,
          tx
        );
        finalGroupsData.push({
          groupId: groupId,
          groupName: item.groupName,
        });
      }
      /**
       * @description Bulk upsert final scenario links
       */
      const scenarioLinksData = prepareScenarioLinksData(
        body.scenarioId,
        body.userEmail,
        finalGroupsData
      );
      await Promise.all([
        groupScenarioMapperService.upsertScenarioLinksBulk(
          scenarioLinksData,
          tx
        ),
        updateScenarioNStepStatus(
          body,
          scenarioData,
          VALID_STEP_NAMES[6],
          scenarioStepStatusDataService,
          scenariosDataService,
          tx
        ),
      ]);
    });
  } catch (err) {
    console.log("Error in upsertGroupsNStepStatus:", err);
    throw err;
  }
}

/**
 * @description Function to get reusable groupId or create a new group and mappings
 * @param {Object} item - current request row
 * @param {Object} scenarioData - scenario row
 * @param {String} userEmail - user email for audit
 * @param {Object} groupingService - grouping service instance
 * @param {Object} namcLineSubseriesService - namc line subseries service instance
 * @param {Object} groupNamcLineSeriesMapperService - group mapper service instance
 * @param {Object} tx - prisma transaction client
 * @returns {Promise<String>} finalized groupId
 */
async function fetchExistingOrCreateNewGroup(
  item,
  scenarioData,
  userEmail,
  groupingService,
  namcLineSubseriesService,
  groupNamcLineSeriesMapperService,
  tx
) {
  /**
   * @description First try to find reusable group by exact config
   */
  const reusableGroup = await groupingService.findReusableGroupId(
    scenarioData.namc,
    scenarioData.line,
    item.vanningCenter,
    item.subSeriesList,
    tx
  );
  /* If a group exists with exact config */
  if (reusableGroup && reusableGroup.length > 0) {
    return reusableGroup[0].groupId;
  }
  /**
   * @description No reusable group found, create new grouping row
   */
  const insertedGroup = await groupingService.insertGroupingData(
    item.vanningCenter,
    userEmail,
    tx
  );
  const groupId = insertedGroup[0].groupId;
  /**
   * @description Resolve namc_line_series_id values for subSeriesList
   */
  const resolvedSubSeries =
    await namcLineSubseriesService.getNamcLineSeriesIdsBySubSeriesList(
      scenarioData.namc,
      scenarioData.line,
      item.subSeriesList,
      tx
    );
  const namcLineSeriesIds = resolvedSubSeries.map(
    (row) => row.namcLineSeriesId
  );
  /**
   * @description Insert/activate mappings for the new group
   */
  await groupNamcLineSeriesMapperService.insertMappingsForNewGroup(
    groupId,
    namcLineSeriesIds,
    userEmail,
    tx
  );
  return groupId;
}

module.exports = {
  upsertGroupsNStepStatus,
};
