# SA360 Bulk Editor

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

Behind the scenes, CSV bulksheets, Google Cloud Storage and Google Cloud
functions are involved to make the user experience as easy/smooth as possible.
An internal setup for the Cloud piece is available for limited time testing,
but eventually clients should implement the solution in their own Google Cloud
project to keep using the tool.


## SETUP AND DETAILS

Please refer to the (internal) deck presenting the solution and the setup steps
at go/sa360-bulk-editor.


## ADDITIONAL NOTES

The code for the solution will be open-sourced in Q4 2018 after the first
official test with a real client. A new detailed README file will be included
with external-friendly information and setup steps.
