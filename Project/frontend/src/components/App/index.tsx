import logo from "../../assets/team-logo.svg";
import Upload from "../Upload";


import "./index.css";

function App() {
  return (
    <main className="main_wrapper">

      <header>
        <h2>AMOS Project SS24 - Knowledge Graph Extractor</h2>
      </header>
      <img className="logo" src={logo} alt="" />
      <Upload />
    </main>
  );
}

export default App;
