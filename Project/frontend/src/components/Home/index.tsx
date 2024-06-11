import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/team-logo.svg';
import Upload from '../Upload';
import './index.css';
import { GENERATE_API_PATH, GRAPH_DELETE_API_PATH, GraphStatus } from '../../constant';
import {toast} from "react-toastify";

interface UploadedFile {
  serverId: string;
}

interface FilePondError {
  message: string;
  code: number;
}

function Home() {
  const [fileId, setFileId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const pondRef = useRef(null);


  const handleAddFile = (error: FilePondError | null, file: UploadedFile) => {
    if (!error) {
      const fileId = JSON.parse(file.serverId).id;
      setFileId(fileId);
    } else {
      console.log('Error:', error.message);
    }
  };
  const notifySuccess = () => {
    toast.success('Success!', {
      position: "bottom-right",
      autoClose: 3000, // Set the auto-close duration
      hideProgressBar: true, // Hide progress bar
      closeOnClick: true, // Close the notification when clicked
      draggable: true, // Make the notification draggable
    });
  };

  const handleRemoveFile = () => {

    setFileId('');
    if (pondRef.current) {
      pondRef.current.removeFiles();
    }
  };

  const handleGenerateGraph = () => {
    setIsLoading(true);

    const API = `${import.meta.env.VITE_BACKEND_HOST}${GENERATE_API_PATH.replace(':fileId', fileId)}`;
    fetch(API, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.status === GraphStatus.GRAPH_READY) {
          navigate(`/graph/${fileId}`);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleDeleteGraph = () => {
    setIsLoading(true);

    const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_DELETE_API_PATH.replace(":fileId", fileId)}`;
    fetch(API, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then(() => {
          handleRemoveFile();
          notifySuccess();
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
          pondRef={pondRef}
          handleAddFile={handleAddFile}
          handleRemoveFile={handleRemoveFile}
        />
        <div>
          <button
            className="primary_btn"
            disabled={!fileId || isLoading}
            onClick={handleGenerateGraph}
          >
            {isLoading ? (
              <span className="loading_spinner_home">Working...</span>
            ) : (
              'Generate Graph'
            )}
          </button>
        </div>

        <div>
          <button
            className="primary_btn red_btn"
            disabled={!fileId || isLoading}
            onClick={handleDeleteGraph}
          >
            {isLoading ? <span className="loading_spinner_home">Working...</span> : "Delete Graph"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Home;
