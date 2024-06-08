
import { FilePond, registerPlugin, File } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import "./index.css";
import { UPLOAD_API_PATH } from '../../constant';

registerPlugin(FilePondPluginFileValidateType);

type UploadProps = {
  handleAddFile: (error: any, file: File) => void;
  handleRemoveFile: () => void;
  pondRef: React.RefObject<any>;
}


function Upload(props: UploadProps) {
  return (
    <section className="upload_wrapper">
      <FilePond
        ref={props.pondRef}
        allowMultiple={false}
        server={`${import.meta.env.VITE_BACKEND_HOST}${UPLOAD_API_PATH}`}
        name="file"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={["application/pdf"]}
        credits={false}
        onprocessfile={props.handleAddFile}
        onremovefile={props.handleRemoveFile}
      />
    </section>
  )
}

export default Upload;
