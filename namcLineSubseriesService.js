const { BaseService } = require("./BaseService");

class namcLineSubseriesData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to get all NAMC & Line details
   */
  async getAllNamcData() {
    try {
      return await this.prisma
        .$queryRaw`select * from supply_planning.namc_line_subseries where is_active = true;`;
    } catch (err) {
      console.log("Error in getAllNamcData:", err);
      throw err;
    }
  }

  /**
   * @description Function to fetch data by namc and line
   * @param {String} namc - NAMC from scenario data
   * @param {String} line - line from scenario data
   * @returns {Array} subseries rows
   */
  async getDataByNamcAndLine(namc, line) {
    try {
      return await this.prisma.$queryRaw`
        select *
        from supply_planning.namc_line_subseries
        where namc = ${namc}
          and line = ${line}
          and is_active = true
        order by sub_series_description;
      `;
    } catch (err) {
      console.log("Error in getDataByNamcAndLine:", err);
      throw err;
    }
  }
}

module.exports.namcLineSubseriesData = namcLineSubseriesData;
