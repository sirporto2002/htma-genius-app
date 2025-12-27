import React, { useState } from 'react';

export default function DemoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return; // Guard: no file selected

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      setStatus('✅ Upload successful!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Upload failed.');
    }
  };

  return (
    <div>
      <h1>File Upload Demo</h1>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
          }
        }}
      />
      <button onClick={handleUpload}>Upload</button>
      <p>{status}</p>
    </div>
  );
}
