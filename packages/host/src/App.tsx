import "./App.css";
import React from "react";
const ReactLogo = React.lazy(() => import("remoteApp/ReactLogo"));

function App() {
  return (
    <>
      <h1>Host app</h1>
      <ReactLogo />
    </>
  );
}

export default App;
