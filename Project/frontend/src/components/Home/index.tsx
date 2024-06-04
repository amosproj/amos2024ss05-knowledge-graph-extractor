import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/team-logo.svg";
import Upload from "../Upload";
import "./index.css";
import { GENERATE_API_PATH, GraphStatus } from "../../constant";

function Home() {
  const [fileId, setFileId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddFile = (error: any, file: any) => {
    if (!error) {
      const fileId = JSON.parse(file.serverId as any).id;
      setFileId(fileId);
    }
  };

  const handleRemoveFile = () => { setFileId(""); }

  const handleGenerateGraph = () => {
    setIsLoading(true);

    const API = `${import.meta.env.VITE_BACKEND_HOST}${GENERATE_API_PATH.replace(":fileId", fileId)}`;
    fetch(API, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((res) => {

        if (res.status === GraphStatus.GRAPH_READY) {
          navigate(`/graph/${fileId}`);
        }
      })
      .catch((e) => {
        console.log(e)
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="main_wrapper">
      <div>
        <header>
          <h2>AMOS Project SS24 - Knowledge Graph Extractor</h2>
        </header>
        <img className="logo" src={logo} alt="" />
        <Upload
          handleAddFile={handleAddFile}
          handleRemoveFile={handleRemoveFile}
        />
        <div>
          <button
            className="primary_btn"
            disabled={!fileId || isLoading}
            onClick={handleGenerateGraph}
          >
            {isLoading ? <span className="loading_spinner_home">Generating graph...</span> : "Generate Graph"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Home;
