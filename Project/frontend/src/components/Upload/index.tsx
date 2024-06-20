import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import './index.css';
import { GRAPH_DELETE_API_PATH, UPLOAD_API_PATH } from '../../constant';

registerPlugin(FilePondPluginFileValidateType);

export interface FilePondFile {
  id: string;
}

interface FilePondError {
  message: string;
  code: number;
}

type UploadProps = {
  handleAddFile: (error: FilePondError | null, file: FilePondFile) => void;
  handleRemoveFile: () => void;
  handleDeleteFile: () => void;
  pondRef: React.RefObject<any>;
};

function Upload(props: UploadProps) {
  
  const server= {
    url: `${import.meta.env.VITE_BACKEND_HOST}`,
    process: {
      url: `${UPLOAD_API_PATH}`,
      method: 'POST',
      onload: (response: FilePondFile) => {
        return response.id; // The server ID of the uploaded file
      },
      onerror: (response: FilePondError) => {
        console.error('Error uploading file:', response);
      }
    },
    revert: (fileId: string, load: any, error: any) => {
      const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_DELETE_API_PATH.replace(':fileId', fileId)}`;
      fetch(API, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          load();
          props.handleDeleteFile();
        } else {
          error('Error deleting file');
        }
      })
      .catch((err:FilePondError) => {
        error('Error deleting file');
      });
    }
  };

  return (
    <section className="upload_wrapper">
      <FilePond
        ref={props.pondRef}
        allowMultiple={false}
        server={server}
        name="file"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={['application/pdf']}
        credits={false}
        onprocessfile={(error: any, file: any) =>
    //      props.handleAddFile(error as FilePondError, file as FilePondFile)
        console.log()
        }
        onremovefile={props.handleRemoveFile}
      />
    </section>
  );
}

export default Upload;
