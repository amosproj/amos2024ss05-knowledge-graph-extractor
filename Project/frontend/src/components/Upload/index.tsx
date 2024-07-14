import React from 'react';

import { FilePond, registerPlugin, FilePondProps } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import {
  GRAPH_DELETE_API_PATH,
  UPLOAD_API_PATH,
  messageSeverity,
} from '../../constant';
import CustomizedSnackbars from '../Snackbar';
import { Notification } from '../GraphList';

import './index.css';

registerPlugin(FilePondPluginFileValidateType);

export interface IFile {
  id: string;
  file_location: string;
  file_name: string;
  status: string;
}

type UploadProps = {
  handleAddFile: FilePondProps['onprocessfile'];
  handleRemoveFile: FilePondProps['onremovefile'];
  handleDeleteFile: () => void;
  pondRef: React.RefObject<never>;
};

function Upload(props: UploadProps) {
  const [notification, setNotification] = React.useState<Notification>({
    show: false,
    severity: messageSeverity.SUCCESS,
    message: '',
  });

  const server: FilePondProps['server'] = {
    url: `${import.meta.env.VITE_BACKEND_HOST}`,
    process: {
      url: `${UPLOAD_API_PATH}`,
      method: 'POST',
      onload: (response) => {
        return JSON.parse(response).id;
      },
      onerror: (err) => {
        const parsedError = err ? JSON.parse(err).detail : '';
        const errMessage = parsedError.includes('already been uploaded')
          ? 'File name already exists'
          : 'Error during upload';
        return errMessage;
      },
    },
    revert: (fileId, load, error) => {
      const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_DELETE_API_PATH.replace(':fileId', fileId)}`;
      fetch(API, {
        method: 'DELETE',
      }).then((response) => {
        if (response.ok) {
          load();
          props.handleDeleteFile();
        } else {
          error('Error deleting file');
        }
      });
    },
  };

  const handleFileProcess: FilePondProps['onprocessfile'] = (error, file) => {
    console.log(error, file);
    props.handleAddFile?.(error, file);
  };

  const handleAddFile: FilePondProps['onaddfile'] = (error, file) => {
    if (error) {
      setNotification({
        show: true,
        severity: messageSeverity.ERROR,
        message: `${error.main}. ${error.sub}.`,
      });
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({
      show: false,
      severity: notification.severity,
      message: notification.message,
    });
  };

  const renderSnackbar = () => {
    return (
      <CustomizedSnackbars
        open={notification.show}
        handleClose={handleClose}
        message={notification.message}
        severity_value={notification.severity}
      />
    );
  };

  return (
    <section className="upload_wrapper">
      <FilePond
        allowMultiple={false}
        server={server}
        name="file"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={[
          'application/pdf',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/json',
        ]}
        credits={false}
        onprocessfile={handleFileProcess}
        onremovefile={props.handleRemoveFile}
        labelFileProcessingError={(error) => error.body}
        labelFileTypeNotAllowed="Invalid file type"
        fileValidateTypeLabelExpectedTypes="Kindly check the info"
        onaddfile={handleAddFile}
      />
      {renderSnackbar()}
    </section>
  );
}

export default Upload;
