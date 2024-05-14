
import { FilePond, registerPlugin } from 'react-filepond'

import 'filepond/dist/filepond.min.css'
import "./index.css";
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
// Register the plugin
registerPlugin(FilePondPluginFileValidateType);


function Upload() {
  return <section className="upload_wrapper">
    <FilePond
      allowMultiple={false}
      server='http://localhost:8000/api/upload'
      name="file"
      labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      acceptedFileTypes={["application/pdf"]}
    />
  </section>
}

export default Upload;
