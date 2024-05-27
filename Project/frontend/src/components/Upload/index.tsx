
import { FilePond, registerPlugin, File } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import "./index.css";

registerPlugin(FilePondPluginFileValidateType);

type UploadProps = {
  handleAddFile: (error: any, file: File) => void;
}

function Upload(props: UploadProps) {
  return (
    <section className="upload_wrapper">
      <FilePond
        allowMultiple={false}
        server={`${import.meta.env.VITE_BACKEND_HOST}/api/upload`}
        name="file"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={["application/pdf"]}
        credits={false}
        onprocessfile={props.handleAddFile}
      />
    </section>
  )
}

export default Upload;
