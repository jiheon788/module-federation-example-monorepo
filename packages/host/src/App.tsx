import "./App.css";
import React from "react";
import reactLogo from "./assets/react.svg";

const RemotedImage = React.lazy(() => import("remoteApp/RemotedImage"));

function App() {
  return (
    <>
      <h1>Host app</h1>
      <RemotedImage src={reactLogo} />
    </>
  );
}

export default App;
