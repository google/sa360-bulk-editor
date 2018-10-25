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
var CONFIG_SHEET_NAME='Config';
var CAMPAIGN_SHEET_NAME='Campaigns';
var LOG_SHEET_NAME='Log';
var configSheet = doc.getSheetByName(CONFIG_SHEET_NAME);
var campaignsSheet = doc.getSheetByName(CAMPAIGN_SHEET_NAME);
var logSheet = doc.getSheetByName(LOG_SHEET_NAME);
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
  init_();
}

/**
 * Initialization function to structure the spreadsheet, if needed.
 * @private
 */
function init_() {
  if (!configSheet || !campaignsSheet || !logSheet) {
    // We need setup and format the spreadsheet
    initSpreadsheet_();
  }
  doc.setActiveSheet(configSheet);
}

/**
 * Sets up and formats the needed sheets in the Spreadsheet: "Config" with the
 * configuration settings, "Campaigns" to host the advertisers' campaigns,
 * "Log" to host the appscript logs.
 * @private
 */
function initSpreadsheet_() {
  if (!configSheet) {
    doc.insertSheet(CONFIG_SHEET_NAME,0);
    configSheet = doc.getSheetByName(CONFIG_SHEET_NAME);
    configSheet.setTabColor("yellow");
    configSheet.getRange(1,1,1,2).setBackground("#FFE599");
    configSheet.getRange(1,1).setValue('Agency ID').setFontWeight('bold');
    configSheet.getRange(1,2).setValue('Advertiser ID').setFontWeight('bold');
  }
  if (!campaignsSheet) {
    doc.insertSheet(CAMPAIGN_SHEET_NAME,1);
    campaignsSheet = doc.getSheetByName(CAMPAIGN_SHEET_NAME);
    campaignsSheet.setTabColor("green");
    campaignsSheet.getRange(1,1,1,7).setBackground("#ADD6AD");
    campaignsSheet.getRange(1,8,1,1).setBackground("#FFE599");
    campaignsSheet.getRange(1,1).setValue('Agency ID').setFontWeight('bold');
    campaignsSheet.getRange(1,2).setValue('Agency').setFontWeight('bold');
    campaignsSheet.getRange(1,3).setValue('Advertiser ID').setFontWeight('bold');
    campaignsSheet.getRange(1,4).setValue('Advertiser').setFontWeight('bold');
    campaignsSheet.getRange(1,5).setValue('Account ID').setFontWeight('bold');
    campaignsSheet.getRange(1,6).setValue('Campaign ID').setFontWeight('bold');
    campaignsSheet.getRange(1,7).setValue('Campaign').setFontWeight('bold');
    campaignsSheet.getRange(1,8).setValue('Daily Budget').setFontWeight('bold');
  }
  if (!logSheet) {
    doc.insertSheet(LOG_SHEET_NAME,2);
    campaignsSheet = doc.getSheetByName(LOG_SHEET_NAME);
    campaignsSheet.setTabColor("black");
    campaignsSheet.getRange(1,1,1,3).setBackground("#778899");
    campaignsSheet.getRange(1,1).setValue('Timestamp').setFontWeight('bold');
    campaignsSheet.getRange(1,2).setValue('Message').setFontWeight('bold');
    campaignsSheet.getRange(1,3).setValue('Details').setFontWeight('bold');
  }
}
