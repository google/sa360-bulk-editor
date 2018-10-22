/***********************************************************************
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Note that these code samples being shared are not official Google
products and are not formally supported.
************************************************************************/

/**
 * @fileoverview Functions to download report data from SA360.
 */

var DS_REPORTS_URL = 'https://www.googleapis.com/doubleclicksearch/v2/reports';
// Lookback window for active campaigns data to be downloaded.
var LOOKBACK_WINDOW = 60;
var MAX_RETRIES = 20;
// Columns requested in the report (daily budget at campaign level).
// Can be edited if different values need to be bulk-edited.
var REPORT_COLUMNS = [ 'agencyId', 'agency', 'advertiserId', 'advertiser',
                      'accountId', 'campaignId', 'campaign', 'dailyBudget' ];

var isFirstReport = true;


/**
 * Starts the worflow to download data from the platform.
 */
function downloadData() {
  clearLog_(logSheet);
  var configIds = configSheet.getDataRange().getValues();
  var reportIds = [];
  // Creating reports:
  for (row in configIds) {
    if (row == 0) {
      continue;
    }
    var reportId = createReport_(configIds[row][0], configIds[row][1]);
    reportIds.push(reportId);
  }
  // Downloading report data:
  for (i in reportIds) {
    checkAndDownloadReport_(reportIds[i], 0);
  }
  customLog_(logSheet, 'Job completed, goodbye!', '');
}


/**
 * Creates a report for the campaigns of the provided advertiser via SA360 API.
 * @param {string} agencyId ID of the Agency of the Advertiser.
 * @param {string} advertiserId ID of the Advertiser.
 * @return {string} The ID of the created report.
 * @private
 */
function createReport_(agencyId, advertiserId) {
  var body = createReportRequestObject_(agencyId, advertiserId);
  var response = JSON.parse(callApi_(DS_REPORTS_URL, 'POST', body));
  if (!response.id) {
    throw Error('Can\'t correctly create report. Have you enabled DS/SA360 ' +
        'API in the Cloud Project?');
  }
  customLog_(logSheet, 'Created report for advertiser [agency]: ' +
      advertiserId + ' [' + agencyId + ']', response.id);
  return response.id;
}


/**
 * Creates the body for API request for the report to be created.
 * @param {string} agencyId ID of the Agency of the Advertiser.
 * @param {string} advertiserId ID of the Advertiser.
 * @return {!Object} The body object for the API request.
 * @private
 */
function createReportRequestObject_(agencyId, advertiserId) {
  var columnNames = [];
  for (i in REPORT_COLUMNS) {
    columnNames.push({ "columnName": REPORT_COLUMNS[i] });
  }
  var today = new Date();
  var endDate = today.toISOString().substr(0,10);
  var startDay = new Date();
  startDay.setDate(startDay.getDate() - LOOKBACK_WINDOW);
  var startDate = startDay.toISOString().substr(0,10);
  var requestObject = {
    "downloadFormat": "csv",
    "maxRowsPerFile": 1000000,
    "reportType": "campaign",
    "statisticsCurrency": "advertiser",
    "columns": columnNames,
    "reportScope": {
      "agencyId": agencyId,
      "advertiserId": advertiserId
    },
    "timeRange": {
      "startDate": startDate,
      "endDate": endDate
    }
  };
  return requestObject;
}


/**
 * Checks status of a report and calls the function to download it when ready.
 * @param {string} reportId ID of the report to check and download.
 * @param {?number} retries Number of times the check has been done.
 * @return {?number} The number of rows in the report (null if not available).
 * @private
 */
function checkAndDownloadReport_(reportId, retries) {
  var url = DS_REPORTS_URL + '/' + reportId;
  var response = JSON.parse(callApi_(url, 'GET', null));
  retries++;
  if (response.isReportReady) {
    customLog_(logSheet, 'Campaign report with ID ' + reportId + ' is ready',
        response.rowCount + ' rows');
    return collectReportData_(reportId);
  } else {
    if (retries < MAX_RETRIES) {
      var seconds = retries * 10;
      customLog_(logSheet, 'Campaign report with ID ' + reportId + ' not ready',
          'retrying in ' + seconds + ' seconds');
      Utilities.sleep(seconds * 1000);
      return checkAndDownloadReport_(reportId, retries);
    } else {
      customLog_(logSheet, 'Campaign report with ID ' + reportId + ' still ' +
         'not ready, giving up!', url);
      return null;
    }
  }
}


/**
 * Downloads a report from SA360 and pastes the content in the Campaigns sheet.
 * @param {string} reportId ID of the report to download.
 * @return {number} The number of rows in the report result.
 */
function collectReportData_(reportId) {
  var url = DS_REPORTS_URL + '/' + reportId + '/files/0';
  var response = callApi_(url, 'GET', null);
  var respArray = Utilities.parseCsv(response);
  customLog_(logSheet, 'File for report ' + reportId + ' added to the ' +
      'Campaigns sheet', '');
  var startingRow = 1;
  if (isFirstReport) {
    campaignsSheet.clearContents();
  } else {
    // Remove headers.
    respArray.shift();
    startingRow = campaignsSheet.getDataRange().getLastRow() + 1;
  }
  campaignsSheet.getRange(startingRow,1, respArray.length, respArray[0].length)
      .setValues(respArray);
  isFirstReport = false;
  return respArray.length;
}
