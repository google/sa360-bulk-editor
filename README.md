# SA360 Bulk Editor

Disclaimer: This is not an official Google product.

## OVERVIEW

This tool enables SA360 clients to leverage the Bulk Upload functionality
to update search campaign details at scale directly from a Spreadsheet.
In fact, the user-facing part of the tool is a Google Spreadsheet powered by
custom AppsScript code, which enables two functionalities, meant to be used
sequentially:

*   collecting the current values from the platform, across different campaigns
    and advertisers (using the SA360 API)
*   after the user has applied the desired changes in the sheet, sending the
    updated values to be applied in SA360 (leveraging a previously configured
    SFTP endpoint).

The provided setup allows editing the daily budget for all the campaigns of
the selected advertisers in one place. It can be customized to handle changes
of different kind of values, as long as it's a change supported via Bulk
Uploads in SA360 (customization requires non trivial coding skills).

## REQUIREMENTS AND LIMITATIONS

#### 1. Authorizations

Each individual user needs to “install” the tool and to authorise access to the
SA360 API through his/her personal privileges.

Users of the tools need to have access to the SA360 Advertisers and Campaigns
they want to edit.

#### 2. Google Cloud Platform project

Behind the scenes, Google Cloud Platform tools such as Cloud Storage and Cloud
Functions are used, and therefore a active Google Cloud Platform project (with
an active Billing Account) is required.

Please note that Cloud costs are usage-based and this tool requires very low
amount of resources; monthly cost is therefore expected to be extremely low (a
few dollars), when not falling entirely in the free tier of operations that GCP
offers.

#### 3. Data size

Apps Script limitations, such as a maximum of 50MB for each downloaded report
apply. For more information on quotas and limitations, please check out this
[page](https://developers.google.com/apps-script/guides/services/quotas).

Consider choosing a different approach if you’re planning to use the tool for
hundreds of advertisers/thousands of campaigns.

## INITIAL SETUP

#### 1. Configure Google Cloud Platform: Cloud Function and Storage Bucket

1.  Create _**Cloud Function**_.
    -   Go to the Cloud Functions section (enable the API if prompted).
    -   Click on **Create Function**.
        *   Use a function name of your choice.
        *   Set memory allocated to **128MB**.
        *   Choose: **Trigger HTTP** (and take note of the URL that it is
            automatically generated).
        *   Source: **Inline editor**.
        *   Runtime: **Python 3.7**.
        *   In the inline editor, copy in **main.py** and in
            **requirements.txt** the code from the corresponding files you can
            find in the _cloud\_function_ folder.
        *   Function to execute: **send_file**.
        *   Select your preferred **region** (changing the region will change
            the URL, so be sure of taking note of the latest one).
        *   Click on _More_ to show more options, and then under _Environment
            variables_ click on **Add variable**:
            -   Insert a new variable with NAME **GCP_ID** and as VALUE the ID
                of your Cloud Project (can also be found after project= in the
                URL).
        *   Click on Create, and after a couple of minutes your Cloud Function
            should be up and running.
2.  Create a _**Cloud Storage bucket**_.
    -   Go to _Storage > Browser_.
    -   Click on **Create a new bucket**.
        *   Use a name of your choice and click on _Create_ ( take note of the
            name).
        *   Click on the 3-dots icon on the right.
        *   Select **Edit bucket permissions**.
        *   For each Google account (email) which will be pushing updates
            through the tool, add a new member with role **Storage Object
            Creator**.

#### 2. Create a new Spreadsheet

Create a new [Google Spreadsheet](https://sheets.google.com) and open its script
editor (from _Tools > Script Editor_)

-   Copy all the **.js files** in the _apps\_script_ folder(Code.js, Utils.js,
    DataDownload.js, DataUpload.js, ConfigDataHandler.js) in the corresponding
    .gs (Code.gs, Utils.gs, DataDownload.gs, DataUpload.gs,
    ConfigDataHandler.gs) files in your AppScript project.
-   Click on _View > Show manifest file_ to access file **appsscript.json**, and
    copy the content of file appsscript.json from this project (or even just the
    _oauthScopes_ object) into that file.
-   Click on _Resources > Cloud Platform Project_. In the following pop-up
    window, put your Cloud project id (you can find it on the _Home_ of your
    Google Cloud project, in the _Project Info_ section).
-   From the Cloud Platform console, open the left-side menu and select _API &
    Services > Library_. Search for **DoubleClick Search API**, select it, and
    click on "Enable". You can now close this tab and the Script Editor tab, and
    go back to the Spreadsheet.
-   If you reload the spreadsheet, the needed sheets ('Config', 'Campaigns' and
    'Log') will be automatically created.

#### 3. Create the Advertiser sFTP endpoint(s) in SA360

For each Advertiser in SA360, go to _Advertiser Settings > Integrations > sFTP
Connections_ and create a new sFTP Connection.

-   Choose a _sFTP connection name_ (e.g. “Bulk Budgets”).
-   Choose _Bulksheet Upload_ as “Purpose”.
-   Click on _Generate_.
-   After a few seconds, the platform will show the **Server, Port, Username and
    Password** assigned to your endpoint - take note of all four, as they’ll be
    needed in the next step.

For more information regarding sFTP for bulk edits in Search Ads please check
the
[SA360 Help Center page](https://support.google.com/searchads/answer/7409125?hl=en).

## USAGE

The followings are the steps needed to display and edit the budget data through
the bulk editor.

1.  Add the Agency Id and Advertiser Id in the **Config** sheet.
2.  From the toolbar, select _SA360 Bulk Editor > **Download data**_.
3.  In the **Campaigns** tab, you should now see the data corresponding to the
    campaigns of the newly added advertiser.
    *   You can see the detailed steps of the current/latest operation in the
        Log tab of the Spreadsheet.
4.  If you make any change, you can now push them to SA360 selecting in the
    toolbar _SA360 Bulk Editor > **Send updated values to SA360**_.
    *   The first time each user sends data for an advertiser, a series of
        dialog windows will ask to enter the configuration information:
        -   SFTP data obtained in step 3 (host, port, username, password).
        -   the Cloud Function URL and the Cloud Storage bucket name obtained in
            Step 1.
5.  If you want/need to cancel or modify the configuration data for an
    advertiser, select a cell on the corrisponding row in the Config sheet, and
    then select _SA360 Bulk Editor > Delete advertiser config (current row)_
    When launching a new upload, you will be asked to re-enter the configuration
    data.
