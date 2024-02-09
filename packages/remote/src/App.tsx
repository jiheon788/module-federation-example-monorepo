import "./App.css";
import RemotedImage from "./components/RemotedImage";
import reactLogo from "./assets/react.svg";

function App() {
  return (
    <>
      <h1>Remote app</h1>
      <RemotedImage src={reactLogo} />
    </>
  );
}

export default App;
