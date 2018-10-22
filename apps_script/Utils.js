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
 * Calls an API via http/UrlFetchApp requests and return the response.
 * @param {string} url The URL of the REST API call to make.
 * @param {string} methodType Value for the "method" option (GET/POST/...).
 * @param {!Object} requestBody The object containing the request parameters.
 * @param {?string} contentType The content type of the request.
 * @return {!Object} The API call response.
 * @private
 */
function callApi_(url, methodType, requestBody, contentType) {
  var type = contentType || 'application/json';
  var headers = {
      'Content-Type': type,
      'Accept' :'application/json',
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
  };
  var options = {
      method: methodType,
      headers : headers,
      muteHttpExceptions: true
  };
  if (requestBody) {
    options.payload = type == 'application/json' ?
        JSON.stringify(requestBody) : requestBody;
  }
  return UrlFetchApp.fetch(url, options);
}


/**
 * Clears the content of the provided sheet and sets it up for logging purposes.
 * @param {!Object} sheet The sheet to be initialized for loggin purposes.
 * @private
 */
function clearLog_(sheet) {
  sheet.clearContents();
  sheet.appendRow(['Timestamp', 'Message', 'Details']);
}


/**
 * Inserts a log entry/row with 2 messages and a timestamp.
 * @param {!Object} sheet Reference to the "log" sheet where to add the row.
 * @param {string} msg1 First (main) message to add.
 * @param {?string} msg2 Second (optional) message to add.
 * @private
 */
function customLog_(sheet, msg1, msg2) {
  sheet.appendRow([
      Utilities.formatDate(new Date(), "GMT+02:00", "yyyy-MM-dd' 'HH:mm:ss' '"),
      msg1,
      msg2
  ]);
}


/**
 * Converts a 2D array to a corresponding CSV-like string.
 * @param {!Array} data The input 2D array.
 * @return {string} The output CSV-like string.
 * @private
 */
function convertArrayToCsv_(data) {
  var csv = "";
  for (var row = 0; row < data.length; row++) {
    for (var col = 0; col < data[row].length; col++) {
      if (data[row][col].toString().indexOf(",") != -1) {
        data[row][col] = "\"" + data[row][col] + "\"";
      }
      if (data[row][col].toString().indexOf('"') != -1) {
        var str = data[row][col].replace(/"/g, '""');
        str = '"' + str + '"';
        data[row][col] = str;
      }
    }
    if (row < data.length-1) {
      csv += data[row].join(",") + "\r\n";
    } else {
      csv += data[row];
    }
  }
  return csv;
}
