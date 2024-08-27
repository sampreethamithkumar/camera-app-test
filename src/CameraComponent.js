import React, { useState, useEffect, useRef } from "react";

function CameraComponent() {
  const videoRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedResolution, setSelectedResolution] = useState("1920x1080");
  const [stream, setStream] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);

  useEffect(() => {
    listCameras();
  }, []);

  // Function to list available cameras
  const listCameras = async () => {
    let cameraList = [];
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    allDevices.forEach((device) => {
      if (device.kind === "videoinput") {
        cameraList.push(device);
      }
    });
    setCameras(cameraList);
    if (cameraList.length > 0) {
      setSelectedCamera(cameraList[0].deviceId);
    }
  };

  // Function to start the camera
  const startCamera = async () => {
    if (videoRef.current) {
      closeStream(videoRef.current.srcObject);
    }

    let [width, height] = selectedResolution.split("x").map(Number);

    const videoConstraints = {
      video: { width, height, deviceId: selectedCamera },
      audio: false,
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        videoConstraints
      );
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      console.log("Camera capabilities:", capabilities);

      if (capabilities.zoom) {
        setMaxZoom(capabilities.zoom.max);
        setZoom(track.getSettings().zoom || 1);
      } else {
        console.log("Zoom capability not supported by this camera.");
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  // Function to close the camera stream
  const closeStream = (stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Function to apply zoom
  const applyZoom = (newZoom) => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const constraints = {
        advanced: [{ zoom: newZoom }],
      };
      track.applyConstraints(constraints);
    }
  };

  // Handle Zoom In
  const handleZoomIn = () => {
    if (zoom < maxZoom) {
      const newZoom = Math.min(zoom + 0.1, maxZoom);
      setZoom(newZoom);
      applyZoom(newZoom);
    }
  };

  // Handle Zoom Out
  const handleZoomOut = () => {
    if (zoom > 1) {
      const newZoom = Math.max(zoom - 0.1, 1);
      setZoom(newZoom);
      applyZoom(newZoom);
    }
  };

  return (
    <div>
      <h2>Camera Zoom Demo</h2>
      <label>
        Camera:
        <select
          onChange={(e) => setSelectedCamera(e.target.value)}
          value={selectedCamera}
        >
          {cameras.map((camera, index) => (
            <option key={index} value={camera.deviceId}>
              {camera.label || `Camera ${index + 1}`}
            </option>
          ))}
        </select>
      </label>
      <label>
        Resolution:
        <select
          onChange={(e) => setSelectedResolution(e.target.value)}
          value={selectedResolution}
        >
          <option value="640x480">640x480</option>
          <option value="1280x720">1280x720</option>
          <option value="1920x1080">1920x1080</option>
          <option value="3840x2160">3840x2160</option>
        </select>
      </label>
      <button onClick={startCamera}>Start Camera</button>
      <br />
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{ maxWidth: "100%" }}
      ></video>
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleZoomOut} disabled={zoom <= 1 || maxZoom === 1}>
          Zoom Out
        </button>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom || maxZoom === 1}
        >
          Zoom In
        </button>
      </div>
    </div>
  );
}

export default CameraComponent;
