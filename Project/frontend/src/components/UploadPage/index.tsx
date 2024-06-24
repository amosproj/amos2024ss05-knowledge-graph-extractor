import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Upload from '../Upload';
import './index.css';
import {
  GENERATE_API_PATH,
  GRAPH_DELETE_API_PATH,
  GraphStatus,
} from '../../constant';
import CustomizedSnackbars from '../Snackbar';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface UploadedFile {
  serverId: string;
}

interface FilePondError {
  message: string;
  code: number;
}

function UploadPage() {
  const [fileId, setFileId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pondRef = useRef(null);

  const handleAddFile = (error: FilePondError | null, file: UploadedFile) => {
    if (!error) {
      const fileId = JSON.parse(file.serverId).id;
      setFileId(fileId);
    } else {
      console.log('Error:', error.message);
    }
  };

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const notifySuccess = () => {
    handleClick();
  };

  const handleRemoveFile = () => {
    setFileId('');
    if (pondRef.current) {
      pondRef.current.removeFiles();
    }
  };

  const handleGenerateGraph = () => {
    setIsGenerating(true);

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
        setIsGenerating(false);
      });
  };

  const handleDeleteGraph = () => {
    setIsDeleting(true);

    const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_DELETE_API_PATH.replace(':fileId', fileId)}`;
    fetch(API, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.json())
      .then(() => {
        handleRemoveFile();
        notifySuccess();
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <main className="main_wrapper_upload">
      <Typography
        variant="h6"
        className="title"
        sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        Upload a PDF document to generate the graph
      </Typography>

      <Upload
        pondRef={pondRef}
        handleAddFile={handleAddFile}
        handleRemoveFile={handleRemoveFile}
      />
      <div className="buttons_container">
        <Button
          variant="outlined"
          color="error"
          disabled={!fileId || isDeleting}
          onClick={handleDeleteGraph}
        >
          {isDeleting ? (
            <>
              <CircularProgress size={15} />
              <Box sx={{ ml: 2 }}>Working...</Box>
            </>
          ) : (
            'Delete Graph'
          )}
        </Button>

        <Button
          variant="outlined"
          color="success"
          disabled={!fileId || isGenerating}
          onClick={handleGenerateGraph}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={15} />
              <Box sx={{ ml: 2 }}>Working...</Box>
            </>
          ) : (
            'Generate Graph'
          )}
        </Button>
      </div>
      <CustomizedSnackbars
        open={open}
        handleClick={handleClick}
        handleClose={handleClose}
      />
    </main>
  );
}

export default UploadPage;
