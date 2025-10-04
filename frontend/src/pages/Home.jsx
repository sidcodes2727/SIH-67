import Hero from '../components/Hero.jsx';

export default function Home({ onQuickNav }) {
  return (
    <div>
      <Hero onUpload={() => onQuickNav('upload')} onDashboard={() => onQuickNav('dashboard')} onAbout={() => onQuickNav('about')} />
    </div>
  );
}
