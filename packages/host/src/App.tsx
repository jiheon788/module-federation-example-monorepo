import "./App.css";
import React from "react";
import reactLogo from "./assets/react.svg";

const RemotedComponent = React.lazy(() => import("remoteApp/RemotedComponent"));

function App() {
  return (
    <>
      <h1>Host app</h1>
      <RemotedComponent imgSrc={reactLogo} />
    </>
  );
}

export default App;
