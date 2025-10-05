import Hero from '../components/Hero.jsx';
import RocksBackground from '../components/RocksBackground.jsx';

export default function Home({ onQuickNav }) {
  return (
    <div className="relative">
      {/* Full-page animated 3D rocks background */}
      <RocksBackground />
      <Hero onUpload={() => onQuickNav('upload')} onDashboard={() => onQuickNav('dashboard')} onAbout={() => onQuickNav('about')} />
    </div>
  );
}
