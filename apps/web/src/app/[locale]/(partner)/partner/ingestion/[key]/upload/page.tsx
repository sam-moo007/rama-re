"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPage({ params }: { params: Promise<{ locale: string, key: string }> }) {
  const { locale, key } = use(params);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const sourceKey = decodeURIComponent(key);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0] || null);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      // Read file as Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      // Calculate real SHA256
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      reader.onload = async () => {
        const resultBase64 = reader.result as string;
        // resultBase64 is something like "data:text/csv;base64,....."
        // We need to strip the prefix
        const base64Payload = resultBase64.split(",")[1];

        const cryptoKey = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0')).join('');

        const payload = {
          sourceKey,
          batchIdempotencyKey: `batch_${Date.now()}_${cryptoKey}`,
          schemaVersion: "rama.partner.csv.v1",
          retrievedAt: new Date().toISOString(),
          artifact: {
            objectKey: `portal/${sourceKey}_${Date.now()}.csv`,
            sha256: hashHex,
            mimeType: file.type || "text/csv",
            byteSize: file.size,
            capturedAt: new Date().toISOString(),
          },
          contentBase64: base64Payload,
        };

        const response = await fetch("/api/operations/ingestion/partner-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        setResult(data);
      };
      
      reader.onerror = () => {
        throw new Error("Failed to read file.");
      };

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/${locale}/partner/ingestion` as any} className="text-sm font-medium text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Sources
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Feed</h1>
        <p className="text-slate-500 mt-1">
          Source: <span className="font-mono text-slate-700">{sourceKey}</span>
        </p>
      </div>

      <div className="rounded border bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select CSV File</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 disabled:opacity-50"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          <h3 className="font-bold">Upload Error</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-bold text-green-800">Upload Successful!</h3>
            <p className="text-sm text-green-700 mt-1 mb-4">
              File reference: <span className="font-mono bg-green-100 px-1 rounded">{result.reference}</span>
            </p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded border border-green-200 p-4 shadow-sm">
                <div className="text-3xl font-bold text-slate-900">{result.rowsAccepted}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-2">Accepted</div>
              </div>
              <div className="bg-white rounded border border-red-200 p-4 shadow-sm">
                <div className="text-3xl font-bold text-red-600">{result.rowsQuarantined}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-2">Quarantined</div>
              </div>
              <div className="bg-white rounded border border-blue-200 p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{result.resolutionItemsGenerated}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-2">Resolutions</div>
              </div>
            </div>
            
            {result.rowsQuarantined > 0 && (
              <div className="mt-6 text-sm text-red-700 bg-white border border-red-200 p-4 rounded shadow-sm">
                <p className="font-bold mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Quarantine Reasons
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.quarantineReasons.map((reason: string, i: number) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Link 
              href={`/${locale}/partner` as any} 
              className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Return to Dashboard
            </Link>
            <button 
              onClick={() => { setFile(null); setResult(null); }}
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Upload Another Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
