"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "react-toastify/dist/ReactToastify.css";
import { storage } from "../firebaseConfig";

const MAX_FILE_SIZE_MB = 20;
const supportedMimeTypes = [
  "video/x-flv",
  "video/quicktime",
  "video/mpeg",
  "video/mpegps",
  "video/mpg",
  "video/mp4",
  "video/webm",
  "video/wmv",
  "video/3gpp",
];

const formatList = supportedMimeTypes.map((type) =>
  type.split("/")[1].toUpperCase()
);

const VideoUpload: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [firebaseURL, setFireBaseURL] = useState<string | null>(null);
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (!supportedMimeTypes.includes(file.type)) {
        toast.error("Unsupported file format. Please select a valid video.");
        setVideoFile(null);
      } else if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast.error(
          `File is too large. Maximum size allowed is ${MAX_FILE_SIZE_MB} MB.`
        );
        setVideoFile(null);
      } else {
        setVideoFile(file);
      }
    }
  };

  const handleUploadToGCS = async () => {
    if (!videoFile || isUploading) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const response = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload file");

      const data = await response.json();
      setDownloadURL(data.fileUri);
      // toast.success("Video uploaded successfully!");

      // Upload to Firebase
      const storageRef = ref(storage, `videos/${videoFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      uploadTask.on(
        "state_changed",
        () => {
        },
        (error) => {
          toast.error("Failed to upload video to Firebase. Please try again.");
          console.error("Error uploading file to Firebase:", error);
        },
        async () => {
          const firebaseURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFireBaseURL(firebaseURL);
          toast.success("Video uploaded and ready to view!");
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessVideo = async () => {
    if (!downloadURL || isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/processVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: downloadURL,
          videoMimeType: videoFile?.type,
        }),
      });

      if (!response.ok) throw new Error("Failed to process the video");

      const data = await response.json();
      setProcessedText(data.text);
      toast.success("Video processed successfully!");
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process the video. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!processedText || !question || isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/askQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processedText,
          question,
        }),
      });

      if (!response.ok) throw new Error("Failed to get an answer");

      const data = await response.json();
      setAnswer(data.answer);
      toast.success("Question processed successfully!");
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to process the question. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewUpload = () => {
    setVideoFile(null);
    setDownloadURL(null);
    setProcessedText(null);
    setQuestion("");
    setAnswer(null);
    setIsUploading(false);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
      {!downloadURL && (
        <>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="w-full text-sm text-gray-700">
            Supported File Formats
          </div>
          <div className="flex flex-wrap mt-2">
            {formatList.map((format, index) => (
              <span
                key={index}
                className="m-1 px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded"
              >
                {format}
              </span>
            ))}
          </div>
          <button
            onClick={handleUploadToGCS}
            disabled={!videoFile || isUploading}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              !videoFile || isUploading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
        </>
      )}
      {downloadURL && (
        <div className="space-y-4">
          {firebaseURL ? (
            <div>
              <p className="text-gray-700 pb-2 pl-2">Video Preview </p>
              <video controls className="w-full max-w-md mx-auto">
                <source src={firebaseURL} type={videoFile?.type} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="text-gray-700 pb-2 pl-2">Previewing your Video ...</div>
          )}
          <div className="flex space-x-4">
            <button
              onClick={handleProcessVideo}
              disabled={isProcessing}
              className={`w-full py-2 px-4 rounded-lg text-white ${
                isProcessing
                  ? "bg-green-200 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isProcessing ? "Processing..." : "Process Video"}
            </button>
            <button
              onClick={handleNewUpload}
              disabled={isUploading || isProcessing}
              className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-700 text-white rounded-lg"
            >
              Upload New Video
            </button>
          </div>
          {processedText && (
            <div className="mt-4 p-4 bg-gray-800 rounded text-white">
              <h2 className="text-lg font-semibold mb-2">
                Processing Results:
              </h2>
              <p>{processedText}</p>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Ask a question about the video..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question || isProcessing}
                  className={`w-full py-2 px-4 rounded-lg text-white ${
                    isProcessing || !question
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Ask Question
                </button>
              </div>
              {answer && (
                <div className="mt-4 p-4 bg-gray-700 rounded text-white">
                  <h3 className="font-semibold mb-2">Answer:</h3>
                  <p>{answer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        pauseOnHover
      />
    </div>
  );
};

export default VideoUpload;
