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
 * @fileoverview Functions to handle the SFTP and
 * GCS bucket configuration information.
 */

/**
* Deletes the stored config data for the selected advertiser.
* The method must be called in the config tab.
* Only the advertiser's config data in the active row is selected to be deleted.
*/
function clearSavedAdvertiserConfig() {
  clearLog_(logSheet);
  customLog_(logSheet, 'Started script to delete the config (GCS/SFTP)' +
      ' data for one advertiser...', '');
  var rowIdx = doc.getCurrentCell().getRow();
  var status = 'KO';
  if (doc.getActiveSheet().getName() == configSheet.getName() && rowIdx>1) {
    var advertiserId = configSheet.getRange(rowIdx, 2).getValue();
    deleteStoredConfigForAdvertiser_(advertiserId);
  } else {
    customLog_(logSheet, 'Error: Please be sure to be in a valid row in the ' +
        configSheet.getName() + ' tab when calling the function', '');
  }
  customLog_(logSheet, 'Script finished', 'Status: '+status);
}

/**
* Deletes the stored config data for the advertiserId in input.
* @param {string} AdvertiserId The ID of the Advertiser.
* @return {string} AdvertiserId if data is found and deleted, null otherwise.
* @private
*/
function deleteStoredConfigForAdvertiser_(advertiserId){
  if (isAdvertiserConfigStored_(advertiserId)) {
      userProperties.deleteProperty(advertiserId + 'Host');
      userProperties.deleteProperty(advertiserId + 'Port');
      userProperties.deleteProperty(advertiserId + 'Username');
      userProperties.deleteProperty(advertiserId + 'Password');
      userProperties.deleteProperty(advertiserId + 'Bucket');
      userProperties.deleteProperty(advertiserId + 'Url');
      status = 'OK';
      customLog_(logSheet, 'Deleted config (GCS/SFTP) data for advertiserid ' +
          advertiserId , '');
      return advertiserId;
    } else {
      customLog_(logSheet, 'Warning: there is no stored config (GCS/SFTP) data'
          +' for advertiserId ' + advertiserId, '');
      return;
    }
  }

/**
* Retrieves SFTP and GCP config data for an advertiser.
* If not already available, prompts the user to insert them.
* @param {string} advertiser The name of the Advertiser the data refers to.
* @param {string} advertiserId The ID of the Advertiser the data refers to.
* @return {!array} The config data if available, empty array otherwise.
* @private
*/
function getConfigDataForAdvertiser_(advertiser, advertiserId) {
  //Input is needed only if the config data for the advertiser is not available
  if (!isAdvertiserConfigStored_(advertiserId)) {
    customLog_(logSheet, 'Saving SFTP configuration for advertiser ' +
        advertiser, 'AdvertiserId: ' + advertiserId);
    var userResponse = [];
    var requiredFields = ['SFTP Host:',
        'SFTP Port:',
        'SFTP Username:',
        'SFTP Password:',
        'GCS Bucket:',
        'Cloud Function URL:'];

    for(i = 0; i < requiredFields.length; i++) {
      userResponse[i] = getUserInput_(advertiser,
          advertiserId,
          requiredFields[i]);
      if (userResponse[i] == null) {
        userResponse = [];
        break;
      }
    }
    if (userResponse.length == requiredFields.length) {
      userProperties.setProperty(advertiserId + 'Host', userResponse[0]);
      userProperties.setProperty(advertiserId + 'Port', userResponse[1]);
      userProperties.setProperty(advertiserId + 'Username', userResponse[2]);
      userProperties.setProperty(advertiserId + 'Password', userResponse[3]);
      userProperties.setProperty(advertiserId + 'Bucket', userResponse[4]);
      userProperties.setProperty(advertiserId + 'Url', userResponse[5]);
    }
    return userResponse;
  }
  return [
      userProperties.getProperty(advertiserId + 'Host'),
      userProperties.getProperty(advertiserId + 'Port'),
      userProperties.getProperty(advertiserId + 'Username'),
      userProperties.getProperty(advertiserId + 'Password'),
      userProperties.getProperty(advertiserId + 'Bucket'),
      userProperties.getProperty(advertiserId + 'Url')];
}

/**
* The method is displaying a UI for inserting the required config data
* @param {string} advertiser The name of the Advertiser the data refers to.
* @param {string} advertiserId The ID of the Advertiser the data refers to.
* @param {string} requestedField The data the user is required to provide.
* @return {string} The config data if provided, null otherwise.
* @private
*/
function getUserInput_(advertiser, advertiserId, requestedField) {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
      'Info required for advertiser ' + advertiser +' (' + advertiserId + ')',
      requestedField,
      ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.OK) {
    return response.getResponseText();
  }
  return;
}

/**
* Checks if the config data for the given advertiserId is available or not.
* @param {string} advertiserId The ID of the Advertiser the data refers to.
* @return {boolean} True if the data is available, false otherwise.
* @private
*/
function isAdvertiserConfigStored_(advertiserId) {
  return userProperties.getProperty(advertiserId + 'Host') != null &&
      userProperties.getProperty(advertiserId + 'Port') != null &&
      userProperties.getProperty(advertiserId + 'Username') != null &&
      userProperties.getProperty(advertiserId + 'Password') != null &&
      userProperties.getProperty(advertiserId + 'Bucket') != null &&
      userProperties.getProperty(advertiserId + 'Url') != null;
}
