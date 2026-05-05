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
      if (process.env.EXECUTION === "error") {
        throw new Error("DB Error");
      }
      if (process.env.EXECUTION === "noData") {
        return [];
      }
      return [
        {
          namc: "TMMI",
          line: "Line1",
          sub_series_description: "subSeries1",
        },
        {
          namc: "TMMI",
          line: "Line1",
          sub_series_description: "subSeries2",
        },
        { namc: "TMMI", line: "Line2", sub_series_description: "subSeries3" },
        { namc: "TMMK", line: "Line3", sub_series_description: "subSeries4" },
      ];
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
      if (process.env.VALIDATION === "namclinesubserieserror") {
        throw new Error("DB Error while fetching NAMC line subseries");
      }
      if (process.env.VALIDATION === "emptynamclinesubseries") {
        return [];
      }
      if (process.env.VALIDATION === "noprepopulateddata") {
        return [
          {
            sub_series_description: null,
          },
          {
            sub_series_description: "RAV4",
          },
        ];
      }
      if (namc === "Error") {
        throw new Error("DB Error");
      }
      return [
        {
          namc: "TMMI",
          line: "Line1",
          sub_series_description: "CAMRY",
        },
        {
          namc: "TMMI",
          line: "Line1",
          sub_series_description: "RAV4",
        },
        { namc: "TMMI", line: "Line2", sub_series_description: "NX Gas" },
      ];
    } catch (err) {
      console.log("Error in getDataByNamcAndLine:", err);
      throw err;
    }
  }
}

module.exports.namcLineSubseriesData = namcLineSubseriesData;
