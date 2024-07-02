import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePondProps } from 'react-filepond';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

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

  return (
    <Stack flex={1} justifyContent={'center'} alignItems={'center'} spacing={2}>
      <Typography
        variant="h6"
        className="title"
        sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        Upload a PDF document to generate the graph
      </Typography>

      <Upload
        handleAddFile={handleAddFile}
        handleRemoveFile={handleRemoveFile}
        handleDeleteFile={handleDeleteGraph}
      />
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

      <CustomizedSnackbars
        open={showSnackbar}
        handleClick={handleClick}
        handleClose={handleClose}
      />
    </Stack>
  );
}

export default UploadPage;
