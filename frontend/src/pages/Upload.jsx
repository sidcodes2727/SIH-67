import UploadForm from '../components/UploadForm.jsx';

export default function Upload() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Heavy Metal Data Input</h2>
        <p className="text-white/70 mt-2">
          Add new heavy metal measurement data either manually or by uploading CSV/Excel files. 
          Each entry should contain all metal concentrations for a specific location and time.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
