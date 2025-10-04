export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="container py-6 text-center text-white/60">
        HMPI • {new Date().getFullYear()}
      </div>
    </footer>
  );
}
