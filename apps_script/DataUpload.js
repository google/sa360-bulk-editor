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
 * @fileoverview Functions to send the updated campaign data to the Google Cloud
 * Storage folder (so that it can be forwarded to the SA360 SFTP endpoint).
 */

var GCS_API_UPLOAD_URL = 'https://www.googleapis.com/upload/storage/v1/b/' +
    'BUCKET/o?uploadType=media&name=FILE';
var ACTION = 'edit';
var BULK_HEADERS = [ 'Row Type', 'Action', 'Campaign', 'Daily budget',
    'Advertiser ID', 'Advertiser', 'Account ID', 'Campaign ID' ];
var ROW_TYPE = 'campaign';


/**
 * Starts the worflow to upload the bulksheet to Google Cloud Storage.
 * This needs to be adapted if the values to be updated do not include [only]
 * the daily campaign budget.
 */
function sendUpdate() {
  clearLog_(logSheet);
  var newData = campaignsSheet.getDataRange().getValues();
  customLog_(logSheet, 'Starting generating bulk sheets for all the campaigns',
      (newData.length - 1) + ' total campaigns');
  var previousAdvertiserId, advertiserIdIdx, advertiserIdx, campaignIdx,
      dailyBudgetIdx, accountIdIdx, campaignIdIdx, advertiser, advertiserId;
  var bulkData = [BULK_HEADERS];
  for (var row in newData) {
    if (row == 0) {
      advertiserIdIdx = newData[row].indexOf('advertiserId');
      advertiserIdx = newData[row].indexOf('advertiser');
      campaignIdx = newData[row].indexOf('campaign');
      dailyBudgetIdx = newData[row].indexOf('dailyBudget');
      accountIdIdx = newData[row].indexOf('accountId');
      campaignIdIdx = newData[row].indexOf('campaignId');
      previousAdvertiserId = 0;
      continue;
    }
    advertiserId = newData[row][advertiserIdIdx];
    if (advertiserId != previousAdvertiserId) {
      // Send the bulk sheet for the previous advertiser.
      if (bulkData.length > 1) {
        sendBulkSheet_(bulkData, advertiser, previousAdvertiserId);
      }
      // Reset the bulk data object for the new advertiser.
      bulkData = [ BULK_HEADERS ];
      previousAdvertiserId = advertiserId;
    }
    advertiser = newData[row][advertiserIdx];
    var bulkRow = [ROW_TYPE, ACTION, newData[row][campaignIdx],
        newData[row][dailyBudgetIdx], advertiserId, advertiser,
        newData[row][accountIdIdx], newData[row][campaignIdIdx]];
    bulkData.push(bulkRow);
  }
  sendBulkSheet_(bulkData, advertiser, advertiserId);
  customLog_(logSheet,
      'Job completed: the values will be updated in SA360 in 1/2 minutes',
      'Goodbye!');
}


/**
 * Sends a CSV bulk sheet file to the required Google Cloud Storage bucket.
 * GCS and SFTP details are requested to the user.
 * @param {!Object} data The 2D array of values to be sent as CSV file.
 * @param {string} advertiser The name of the Advertiser the data refers to.
 * @param {string} advertiserId The ID of the Advertiser the data refers to.
 * @private
 */
function sendBulkSheet_(data, advertiser, advertiserId) {
  // Gets Google Cloud Storage and SFTP details corresponding to the Advertiser.
  getConfigDataForAdvertiser_(advertiser, advertiserId);
  var host = userProperties.getProperty(advertiserId + 'Host');
  var port = userProperties.getProperty(advertiserId + 'Port');
  var username = userProperties.getProperty(advertiserId + 'Username');
  var password = userProperties.getProperty(advertiserId + 'Password');
  var gcsBucket = userProperties.getProperty(advertiserId + 'Bucket');
  var cloudFunctionURL = userProperties.getProperty(advertiserId + 'Url');

  if (!(host && port && username && password)) {
    customLog_(logSheet, 'No SFTP access information found for advertiser ' +
        advertiser + ' [' + advertiserId + ']', 'Check config tab');
    return;
  }

  // First API call: sends the CSV file to GCS.
  var csvFile = convertArrayToCsv_(data);
  var currentDate = new Date();
  var fileName = advertiserId + '-' + currentDate.getTime() + '.csv';
  var url = GCS_API_UPLOAD_URL.replace("BUCKET", gcsBucket)
      .replace("FILE", encodeURIComponent(fileName));
  var response = JSON.parse(callApi_(url, 'POST', csvFile, 'text/csv'));
  if (!response.id) {
    throw('Error while sending the CSV file to GCS - check permissions?');
  }

  // Second call: send HTTP POST request (which triggers the Cloud Function).
  // The payload includes the SFTP details to be used by the Cloud Functions to
  // transfer the CSV file to the SA360 SFTP endpoint.
  var payload = {
    'filename': fileName,
    'bucket': gcsBucket,
    'sftp-host': host,
    'sftp-port': parseInt(port),
    'sftp-username': username,
    'sftp-password': password
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(payload)
  };
  var response = UrlFetchApp.fetch(cloudFunctionURL, options);
  if (response.getResponseCode()!=200) {
    throw('Error during HTTP call - check URL?');
  }
  customLog_(logSheet, 'Bulk sheet for advertiser ' + advertiser + ' [' +
      advertiserId + '] sent to GCS/SFTP',
      (data.length - 1) + ' campaigns, filename ' + fileName);
}
