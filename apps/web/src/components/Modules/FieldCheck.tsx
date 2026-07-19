import React, { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const FieldCheckView: React.FC = () => {
  const [workerId, setWorkerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [permitId, setPermitId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setScanning(true);

    try {
      const res = await fetch(`${apiUrl}/api/checkpoint/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, zoneId, permitId: permitId || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Scan failed');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-background text-on-surface">
      <h2 className="font-headline-md text-headline-md mb-6 uppercase text-primary border-b border-primary pb-2 flex items-center gap-2">
        <span className="material-symbols-outlined">qr_code_scanner</span>
        Field Checkpoint Scan
      </h2>

      <div className="max-w-md bg-surface border border-outline/30 p-6 shadow-sm">
        <form onSubmit={handleScan} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-md text-on-surface-variant uppercase mb-1">Worker ID</label>
            <input 
              type="text" 
              required
              value={workerId} 
              onChange={e => setWorkerId(e.target.value)} 
              placeholder="e.g. worker-1"
              className="w-full bg-background border border-primary/50 text-on-surface p-2 font-body-md focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant uppercase mb-1">Target Zone ID</label>
            <input 
              type="text" 
              required
              value={zoneId} 
              onChange={e => setZoneId(e.target.value)} 
              placeholder="e.g. C1"
              className="w-full bg-background border border-primary/50 text-on-surface p-2 font-body-md focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant uppercase mb-1">Permit ID (Optional)</label>
            <input 
              type="text" 
              value={permitId} 
              onChange={e => setPermitId(e.target.value)} 
              placeholder="e.g. permit-1"
              className="w-full bg-background border border-outline/30 text-on-surface p-2 font-body-md focus:outline-none focus:border-primary"
            />
          </div>
          <button 
            type="submit" 
            disabled={scanning}
            className="mt-4 bg-primary text-on-primary py-3 px-4 font-label-lg uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {scanning ? 'Scanning...' : 'Verify Access'}
            <span className="material-symbols-outlined text-[20px]">policy</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 border border-error bg-error/10 text-error font-body-md">
            {error}
          </div>
        )}

        {result && (
          <div className={`mt-6 p-4 border ${result.status === 'cleared' ? 'border-primary bg-primary/10' : result.status === 'blocked' ? 'border-error bg-error/10' : 'border-secondary bg-secondary/10'}`}>
            <h3 className={`font-headline-sm uppercase mb-2 flex items-center gap-2 ${result.status === 'cleared' ? 'text-primary' : result.status === 'blocked' ? 'text-error' : 'text-secondary'}`}>
              <span className="material-symbols-outlined">
                {result.status === 'cleared' ? 'check_circle' : result.status === 'blocked' ? 'block' : 'warning'}
              </span>
              STATUS: {result.status.replace('_', ' ')}
            </h3>
            {result.reason && (
              <p className="font-body-md text-on-surface mt-2 border-t border-outline/20 pt-2">
                <span className="font-label-caps text-on-surface-variant uppercase mr-2">Reason:</span>
                {result.reason}
              </p>
            )}
            <p className="font-label-sm text-on-surface-variant mt-4 text-xs">
              Scanned at: {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
