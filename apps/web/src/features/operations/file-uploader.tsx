"use client";

import { useState } from "react";
import { uploadPartnerFile } from "@/lib/operations-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

export function FileUploader({ defaultSourceKey = "" }: { defaultSourceKey?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceKey, setSourceKey] = useState(defaultSourceKey);
  const [isUploading, setIsUploading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccessResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const result = await uploadPartnerFile(file, sourceKey, "rama.partner.csv.v1");
      setSuccessResult(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Partner Ingestion Upload</CardTitle>
        <CardDescription>
          Upload a property data CSV file for ingestion processing. Files are verified, checksummed, and queued for entity resolution.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successResult && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Upload Successful</AlertTitle>
            <AlertDescription>
              Batch ID: <span className="font-mono text-xs">{successResult.batch.id}</span>
              <br />
              Accepted: {successResult.counts.accepted} | Quarantined: {successResult.counts.quarantined}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="sourceKey">Source Key</Label>
          <Input 
            id="sourceKey" 
            value={sourceKey} 
            onChange={(e) => setSourceKey(e.target.value)} 
            placeholder="e.g. mock-partner" 
          />
          <p className="text-xs text-muted-foreground">The identifier of the partner source registered in the system.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <div className="flex items-center gap-4">
            <Input 
              id="file" 
              type="file" 
              accept=".csv,text/csv" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          {file && (
            <p className="text-xs text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setFile(null);
            setError(null);
            setSuccessResult(null);
            // Reset file input if possible
            const fileInput = document.getElementById('file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }}
          disabled={isUploading || (!file && !error && !successResult)}
        >
          Reset
        </Button>
        <Button onClick={handleUpload} disabled={isUploading || !file}>
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload and Queue
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
