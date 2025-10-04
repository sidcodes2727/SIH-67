import UploadForm from '../components/UploadForm.jsx';

export default function Upload() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Data Input / Upload</h2>
      <UploadForm />
      <p className="text-white/70">Accepted formats: CSV, Excel (.xlsx). Required columns: metal_type, concentration, latitude, longitude, timestamp.</p>
    </div>
  );
}
