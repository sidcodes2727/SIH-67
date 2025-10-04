export default function DataTable({ rows }) {
  return (
    <div className="card overflow-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Metal</th>
            <th className="p-3">Conc (µg/L)</th>
            <th className="p-3">Lat</th>
            <th className="p-3">Lng</th>
            <th className="p-3">Time</th>
            <th className="p-3">HMPI</th>
            <th className="p-3">Category</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-white/10">
              <td className="p-3">{r.id}</td>
              <td className="p-3">{r.metal_type}</td>
              <td className="p-3">{r.concentration}</td>
              <td className="p-3">{r.latitude}</td>
              <td className="p-3">{r.longitude}</td>
              <td className="p-3">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="p-3">{r.hmpi ?? '-'}</td>
              <td className="p-3">{r.category ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
