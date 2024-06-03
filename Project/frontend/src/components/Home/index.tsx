import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/team-logo.svg";
import Upload from "../Upload";
import "./index.css";
import { GENERATE_API_PATH } from "../../constant";


function Home() {
  const [disableGenerate, setDisableGenerate] = useState(true);
  const [fileId, setFileId] = useState("");

  const navigate = useNavigate();

  const handleAddFile = (error: any, file: any) => {
    // TODO: This needs to be changed once we have the CORS ready.
    console.log(file)

    if (!error) {
      const fileId = JSON.parse(file.serverId as any).id;
      setFileId(fileId);
      setDisableGenerate(false)
    }
  }

  const handleGenerateGraph = () => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${GENERATE_API_PATH.replace(":fileId", fileId)}`;   //TODO: vite
    fetch(API, {

      // Adding method type 
      method: "POST",

      // Adding body or contents to send 
      // body: JSON.stringify({ 
      //     title: "foo", 
      //     body: "bar", 
      //     userId: 1 
      // }), 

      // Adding headers to the request 
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })

      // Converting to JSON 
      .then(response => response.json())

      // Displaying results to console 
      .then(json => {
        console.log(json);
        //TODO: Check status generated
        navigate(`/graph/${fileId}`);
      })
      .catch(e => navigate(`/graph/${fileId}`) //TODO: console.log(e)
      )

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
          <button className="primary_btn" disabled={!fileId} onClick={handleGenerateGraph}>Generate Graph</button>
        </div>
      </div>
    </main>
  );
}

export default Home;
