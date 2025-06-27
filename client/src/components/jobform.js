import React, { useState } from 'react';
import * as styles from '../styles/jobform.module.scss';
console.log('STYLES', styles);
console.log('typeof STYLES', typeof styles);
console.log('ALL KEYS', styles ? Object.keys(styles) : 'NO STYLES');

function JobForm() {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  function handleTextChange(e) {
    setJobDescription(e.target.value);
  }

  function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const hasText = jobDescription.trim() !== '';
    const hasFile = selectedFile !== null;

    if ((hasText && hasFile) || (!hasText && !hasFile)) {
      setError('Please provide either a job description or upload a file — not both.');
      return;
    }

    setError('');

    if (hasText) {
      console.log('Submitting job description:', jobDescription);

      const payload = {
        raw_text: jobDescription.trim(),
        type: "job",
        source: "raw"
      };

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload failed:", errorText);
          setError("Server error: " + errorText);
          return;
        }

        const result = await response.json();
        console.log("Upload successful:", result);
        // Optional: clear form after success
        setJobDescription('');
      } catch (error) {
        console.error("Network or server error:", error);
        setError("Unexpected error. Check console for details.");
      }
    } else {
      console.log('Submitting file:', selectedFile);
      // TODO: Send selectedFile to backend using FormData
    }
  }

  const isSubmitDisabled = !(jobDescription.trim() || selectedFile);

  return (
    <form onSubmit={handleSubmit} className={styles.jobForm}>
      <label htmlFor="job-desc">Job Description</label>
      <textarea
        id="job-desc"
        value={jobDescription}
        onChange={handleTextChange}
        placeholder="Paste job description here..."
        className={styles.jobTextarea}
      />

      <label htmlFor="file-upload">Upload a File</label>
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className={styles.jobFileInput}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${styles.jobDropzone} ${dragActive ? styles.active : ''}`}
      >
        {selectedFile ? (
          <p>File selected: {selectedFile.name}</p>
        ) : (
          <p>Or drag and drop a file here</p>
        )}
      </div>

      {error && <p className={styles.jobError}>{error}</p>}

      <button type="submit" disabled={isSubmitDisabled} className={styles.jobSubmitButton}>
        Submit
      </button>
    </form>
  );
}

export default JobForm;
