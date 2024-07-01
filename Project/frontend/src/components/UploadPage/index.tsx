import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePondProps } from 'react-filepond';
import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info'; // Import InfoIcon for hint button

import { GENERATE_API_PATH, GraphStatus } from '../../constant';
import CustomizedSnackbars from '../Snackbar';
import Upload from '../Upload';
import './index.css';

function UploadPage() {
  const [fileId, setFileId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleAddFile: FilePondProps['onprocessfile'] = (error, file) => {
    if (!error) {
      setFileId(file.serverId);
    } else {
      console.log('Error:', error);
    }
  };

  const handleClick = () => {
    setShowSnackbar(true);
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowSnackbar(false);
  };

  const notifySuccess = () => {
    handleClick();
  };

  const handleRemoveFile = () => {
    setFileId('');
  };

  const handleDeleteGraph = () => {
    handleRemoveFile();
    notifySuccess();
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
  const hintText = `
    Formats: .pdf .pptx .docx .txt .json
  `;

  return (
    <main className="main_wrapper_upload">
      <Typography
        variant="h6"
        className="title"
        sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        Upload a document to generate the graph
        <Tooltip title={<Typography>{hintText}</Typography>}>
          <InfoIcon color="action" sx={{ mr: 1, cursor: 'pointer' }} />
        </Tooltip>
      </Typography>

      <Upload
        handleAddFile={handleAddFile}
        handleRemoveFile={handleRemoveFile}
        handleDeleteFile={handleDeleteGraph}
      />
      <div className="buttons_container">
        <Button
          variant="outlined"
          color="success"
          disabled={!fileId || isGenerating}
          onClick={handleGenerateGraph}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={15} />
              <Box sx={{ ml: 2 }}>Generating...</Box>
            </>
          ) : (
            'Generate Graph'
          )}
        </Button>
      </div>
      <CustomizedSnackbars
        open={showSnackbar}
        handleClick={handleClick}
        handleClose={handleClose}
      />
    </main>
  );
}

export default UploadPage;
