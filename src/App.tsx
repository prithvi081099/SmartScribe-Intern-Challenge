import "./App.css";
import RecordingComponent from "./Recorder";
import React, { useState } from "react";

function App() {

  const [hasDownloadedRecording, setHasDownloadedRecording] = useState(false);

  const handleDownloadRecording = () => {
    setHasDownloadedRecording(true);
  };

  return (
    <>
      <div>User has downloaded recording: {hasDownloadedRecording.toString()}</div>
      <RecordingComponent onDownloadRecording={handleDownloadRecording}/>
    </>
  );
}

export default App;
