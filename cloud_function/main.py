# Copyright 2018 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""SA360 Bulk Uploader.

Cloud Function forwarding bulk sheets from GCS to the SA360 SFTP endpoint.
"""

import os
import paramiko
from google.cloud import storage


def send_file(request):
  """Sends updated GCS object to an SFTP endpoint .

  Triggered with an HTTP call, this function collects details of
  the SFTP endpoint from the HTTP body and
  sends the corresponding object/file to the endpoint.

  Args:
    request: HTTP request payload.
  """
  client = storage.Client(project=os.environ['GCP_ID'])
  event = request.get_json()
  try:
    bucket = client.get_bucket(event['bucket'])
    filename = event['filename']
    blob = bucket.get_blob(filename)
    host = event['sftp-host']
    port = event['sftp-port']
    username = event['sftp-username']
    password = event['sftp-password']
  except:
    raise RuntimeError('Couldn\'t retrieve all the data from HTTP request')

  print ('Connecting.. {0} {1} {2} {3}'.format(host, port, username, password))
  file_path = '/tmp/' + filename
  blob.download_to_filename(file_path)
  transport = paramiko.Transport((host, int(port)))
  transport.connect(username=username, password=password)
  sftp = paramiko.SFTPClient.from_transport(transport)
  print('sftp connection with {0} started (port: {1}, username: {2}'
        .format(host, port, username))
  sftp.put(file_path, filename)
  sftp.close()
  os.remove(file_path)
  print ('SFTP transfer completed, local file removed ({0})'.format(file_path))
  blob.delete()
