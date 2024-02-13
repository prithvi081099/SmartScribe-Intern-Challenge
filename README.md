### Stage I - Fix the problems
- Solution to this stage were straight forward and problems in this stage were noticeable when I ran the react code for the first time.

- The timer keeps going up after I press stop.
- Sol:- This was happening because progressInterval was not cleared when the stopRecording button was pressed, for this I just added clearInterval(progressInterval.current) in the stopRecording function.

- The app does not update the download status message after the user downloads the audio.
 - Sol:- For this I introduced state 'hasDownloadedRecording', that will dynamically change when download is pressed. Also the status of download was hardcoded to false which was change to the state 'hasDownloadedRecording'. And a callback 'handleDownloadRecording' was added to be passed down to RecordingComponent as a 'onDownloadRecording' prop. This was done to call 'handleDownloadRecording' function and update 'hasDownloadedRecording' when the download button was clicked.

### Stage II - Improve the UX

- Don't show the start recording button unless the user has granted microphone permissions.
 - Sol:- First I created a 'microphonePermissionGranted' state to track the permission. Then I used useEffect hook to check is the permission is granted or not and update the state accordingly. Also I conditionally render the start recoding button depending on the 'microphonePermissionGranted' state. 


- Don't let the user start the recording unless they have named the recording already.
 - Sol:- I just disbaled the button if 'recordingName' was empty.

- Make the name of downloaded file the name of the recording.
 - Sol:- This was done by setting the downloading file name to 'recordingName'.

### Stage III - Implement a new feature

- In addition to the download button, add an "Upload" button that implements the handleUpload function.
  This function simulates a transcription process whereby the audio is sent to a server and a transcript is returned.
  The function takes 5 seconds to run and can either fail or succeed.
 - Sol:- I have created a Upload button that implements 'handleUpload' when the button is clicked. 'handleUpload' function also updates the 'uploading' state. 'uploading' is disabled if there are no audio chunks to upload.

- Add UI to indicate a status while the audio is "uploading"
 - Sol:- The 'uploading' state is used to indicate the status. The button shows uploading or upload depending on the state.

- Add UI to handle the case where the upload fails.
 - Sol:- I created UploadError state which is set in handleUpload function. Conditionally I render the error message in calse of failure


- Add UI to handle the case where the upload succeeds, displaying the returned data.
 - Sol:- Similarly I created 'uploadSuccess', 'transcript', 'size'. All this information is conditionally rendered depending on the success of the upload. Also all this information is reset whenever upload button is pressed again. 

### BONUS: Stage IV - Indicate Microphone Input Volume

- OPTIONAL: Right now, when the user is recording, there is no feedback on the screen indicating that the microphone is working. Let's solve this.
 - Sol:- I render 'Recording...' whenever recording starts with the help of 'isRecording' state.
