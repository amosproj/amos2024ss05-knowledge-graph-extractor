import { FilePond, registerPlugin, FilePondProps } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import { GRAPH_DELETE_API_PATH, UPLOAD_API_PATH } from '../../constant';

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

  const handleFileProcess: FilePondProps['onprocessfile'] = (error, file) =>
    props.handleAddFile?.(error, file);

  return (
    <section style={{ width: '500px'}}>
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
      />
    </section>
  );
}

export default Upload;
