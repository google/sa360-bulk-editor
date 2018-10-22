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
 * @fileoverview Main script file with menu setup.
 */

// Global references to the main doc and sheets.
var doc = SpreadsheetApp.getActiveSpreadsheet();
var configSheet = doc.getSheetByName('Config');
var campaignsSheet = doc.getSheetByName('Campaigns');
var logSheet = doc.getSheetByName('Log');
var userProperties = PropertiesService.getUserProperties();


/**
 * Builds custom menu in the UI.
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('SA360 Bulk Editor')
      .addItem('Download current data from SA360', 'downloadData')
      .addItem('Send updated values to SA360', 'sendUpdate')
      .addItem('Delete advertiser config (current row)',
               'clearSavedAdvertiserConfig')
      .addToUi();
}
