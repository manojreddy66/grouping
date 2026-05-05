const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class groupNamcLineSeriesMapperData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to insert/activate mappings for a new group
   * @param {String} groupId - group UUID
   * @param {Array} namcLineSeriesIds - resolved namc_line_series_id values
   * @param {String} userEmail - user email for audit
   * @param {Object} tx - prisma transaction client
   * @returns {Promise<Number>} rows affected
   */
  async insertMappingsForNewGroup(
    groupId,
    namcLineSeriesIds,
    userEmail,
    tx = this.prisma,
  ) {
    try {
      if (!namcLineSeriesIds || namcLineSeriesIds.length === 0) {
        return 0;
      }

      return await tx.$executeRaw(Prisma.sql`
              INSERT INTO supply_planning.group_namc_line_series_mapper (
              group_id,
              namc_line_series_id,
              is_active,
              created_by
              )
              VALUES
              ${Prisma.join(
                namcLineSeriesIds.map(
                  (id) => Prisma.sql`(
                          ${groupId}::uuid,
                          ${id}::uuid,
                          TRUE,
                          ${userEmail}::text
                          )`,
                        ),
                      )
                }
              ON CONFLICT (group_id, namc_line_series_id)
              DO UPDATE SET
              is_active = TRUE,
              last_updated_timestamp = NOW(),
              updated_by = ${userEmail}::text;
              `);
    } catch (err) {
      console.log("Error in insertMappingsForNewGroup:", err);
      throw err;
    }
  }
}

module.exports.groupNamcLineSeriesMapperData = groupNamcLineSeriesMapperData;
