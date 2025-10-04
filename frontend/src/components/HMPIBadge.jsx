export default function HMPIBadge({ value, category }) {
  const color = category === 'Hazardous' ? 'bg-red-500' : category === 'Moderate' ? 'bg-yellow-400 text-black' : 'bg-green-500';
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${color}`}>
      <span className="font-semibold">HMPI: {value}</span>
      <span className="opacity-80">{category}</span>
    </span>
  );
}
