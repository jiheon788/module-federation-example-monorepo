import "./App.css";
import RemotedComponent from "./components/RemotedComponent";
import reactLogo from "./assets/react.svg";

function App() {
  return (
    <>
      <h1>Remote app</h1>
      <RemotedComponent imgSrc={reactLogo} />
    </>
  );
}

export default App;
