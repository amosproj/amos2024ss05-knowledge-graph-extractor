import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/team-logo.svg";
import Upload from "../Upload";
import "./index.css";


function Home() {
  const [disableGenerate, setDisableGenerate] = useState(true);
  const navigate = useNavigate();

  const handleAddFile = (error: any, file: File) => {
    // TODO: This needs to be changed once we have the CORS ready.
    if (error)
      setDisableGenerate(false)
  }

  const handleGenerateGraph = () => {
    navigate('/graph');
  }

  return (
    <main className="main_wrapper">
      <div><header>
        <h2>AMOS Project SS24 - Knowledge Graph Extractor</h2>
      </header>
        <img className="logo" src={logo} alt="" />
        <Upload
          handleAddFile={handleAddFile}
        />
        <div>
          <button className="primary_btn" disabled={disableGenerate} onClick={handleGenerateGraph}>Generate Graph</button>
        </div>
      </div>
    </main>
  );
}

export default Home;
