import React, { useState, useEffect, useRef } from "react";
import { UploadManager } from "./UploadManager";

interface RecordingProps {
  onDownloadRecording: () => void;
}

interface UploadResult {
  transcript: string;
  size: number;
}

const RecordingComponent: React.FC<RecordingProps> = ({
  onDownloadRecording,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState<string>("");
  const [progressTime, setProgressTime] = useState<number>(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [microphonePermissionGranted, setMicrophonePermissionGranted] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [size, setSize] = useState<number>(0);

  const progressInterval = useRef<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleStartRecording = () => {
    if (!mediaRecorder.current) return;

    setAudioChunks([]);
    setAudioUrl("");
    mediaRecorder.current.start();
    setIsRecording(true);

    progressInterval.current = setInterval(() => {
      setProgressTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (!mediaRecorder.current || !progressInterval.current) return;

    mediaRecorder.current.stop();
    setIsRecording(false);
    clearInterval(progressInterval.current);
    progressInterval.current = null;
    setProgressTime(0);
  };

  const handleUpload = async (audioBlob: Blob) => {
    setUploading(true);
    setUploadError(""); 
    setUploadSuccess(false); 
    setTranscript(""); 
    setSize(0); 

    try {
      const response: UploadResult = await UploadManager.upload(audioBlob);
      console.log(
        `Upload successful. Transcript: ${response.transcript}, Size: ${response.size} bytes`
      );
      setTranscript(response.transcript);
      setSize(response.size);
      setUploadSuccess(true);
    } catch (error:any) {
      console.error("Upload failed:", error.message);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const initMediaRecorder = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error(
        "Media Devices or getUserMedia not supported in this browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        setAudioChunks((currentChunks) => [...currentChunks, event.data]);
      };
    } catch (err) {
      console.error("Failed to get user media", err);
    }
  };

  useEffect(() => {
    const checkMicrophonePermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophonePermissionGranted(true);
        stream.getTracks().forEach(track => track.stop());
        initMediaRecorder(); // Initialize MediaRecorder after checking permissions
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setMicrophonePermissionGranted(false);
      }
    };

    checkMicrophonePermissions();
  }, []);

  useEffect(() => {
    if (audioChunks.length > 0 && !isRecording) {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/webm;codecs=opus",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  }, [audioChunks, isRecording]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        height: "70vh",
        padding: "20px",
        boxSizing: "border-box",
        border: "2px solid",
      }}
    >
      <input
        type="text"
        value={recordingName}
        onChange={(e) => setRecordingName(e.target.value)}
        placeholder="Name your recording"
        style={{
          width: "80%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {microphonePermissionGranted && (
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!recordingName}
          style={{
            width: "80%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        
      )}
      <p style={{ color: "red", margin: "5px" }}>{isRecording ? "Recording..." : ""}</p>
      {!recordingName && (
        <p style={{ color: "red" }}>Please enter a name for your recording.</p>
      )}
      {!microphonePermissionGranted && (
        <p>Microphone permission not granted</p>
      )}
      <div style={{ marginBottom: "20px" }}>
        Progress Time: {progressTime} seconds
      </div>
      {audioUrl && (
        <div>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = audioUrl;
              link.download = `${recordingName || "recording"}.webm`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onDownloadRecording();
            }}
            style={{
              width: "80%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            Download Recording
          </button>
          <button
            onClick={() => handleUpload(new Blob(audioChunks))}
            disabled={!audioChunks.length || uploading || !recordingName || !microphonePermissionGranted}
            style={{
              width: "80%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: !audioChunks.length || uploading || !recordingName || !microphonePermissionGranted ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {uploadError && (
            <p style={{ color: "red" }}>Upload failed: {uploadError}</p>
          )}
          {uploadSuccess && (
            <div>
              <p style={{ color: "green" }}>Upload successful!</p>
              <p>Transcript: {transcript}</p>
              <p>Size: {size} bytes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordingComponent;
