import React, { useState } from 'react';
import * as styles from '../styles/jobform.module.scss';

function JobForm() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTextLabel, setJobTextLabel] = useState('');
  const [jobFileLabel, setJobFileLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedJobs, setSubmittedJobs] = useState([]);

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
    setLoading(true);
    setSuccess('');
    setError('');

    const hasText = jobDescription.trim() !== '';
    const hasFile = selectedFile !== null;

    if ((hasText && hasFile) || (!hasText && !hasFile)) {
      setError('Please provide either a job description or upload a file — not both.');
      setLoading(false);
      return;
    }

    if (hasText) {
      if (!jobTextLabel.trim()) {
        setError('Please provide a label for the job description.');
        setLoading(false);
        return;
      }

      const payload = {
        raw_text: jobDescription.trim(),
        type: 'job',
        source: 'raw',
        label: jobTextLabel.trim()
      };

      try {
        const response = await fetch('http://localhost:7071/api/upload_job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          setError('Server error: ' + errorText);
          setLoading(false);
          return;
        }

        const result = await response.json();
        setSuccess('Job uploaded successfully!');
        setSubmittedJobs(prev => [...prev, { job_id: result.job_id, blob_url: result.blob_url }]);
        setJobDescription('');
        setJobTextLabel('');
        setSelectedFile(null);
        setJobFileLabel('');
        setLoading(false);
      } catch (error) {
        console.error('Network error:', error);
        setError('Unexpected error. Check console for details.');
        setLoading(false);
      }
    } else {
      if (!jobFileLabel.trim()) {
        setError('Please provide a label for the uploaded file.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('label', jobFileLabel.trim());

      try {
        const response = await fetch('http://localhost:7071/api/upload_job', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          setError('Server error: ' + errorText);
          setLoading(false);
          return;
        }

        const result = await response.json();
        setSuccess('File uploaded successfully!');
        setSubmittedJobs(prev => [...prev, { job_id: result.job_id, blob_url: result.blob_url }]);
        setSelectedFile(null);
        setJobFileLabel('');
        setLoading(false);
      } catch (error) {
        console.error('Network error:', error);
        setError('Unexpected error. Check console for details.');
        setLoading(false);
      }
    }
  }

  const isSubmitDisabled =
    (!jobDescription.trim() && !selectedFile) ||
    (selectedFile && !jobFileLabel.trim()) ||
    (jobDescription.trim() && !jobTextLabel.trim());

  return (
    <form onSubmit={handleSubmit} className={styles.jobForm}>
      <div className={styles.jobFieldGroup}>
        <label htmlFor="job-desc">Job Description</label>
        <textarea
          id="job-desc"
          value={jobDescription}
          onChange={handleTextChange}
          placeholder="Paste job description here..."
          className={styles.jobTextarea}
          disabled={loading}
        />
      </div>

      {jobDescription.trim() && (
        <div className={styles.jobFieldGroup}>
          <label htmlFor="jobTextLabel">Label for This Description <strong>(Required)</strong></label>
          <input
            id="jobTextLabel"
            type="text"
            value={jobTextLabel}
            onChange={(e) => setJobTextLabel(e.target.value)}
            className={styles.inputField}
            placeholder="e.g. Frontend React Internship"
            disabled={loading}
            required
          />
        </div>
      )}

<div
  onClick={() => document.getElementById('file-upload').click()}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={`${styles.jobDropzone} ${dragActive ? styles.active : ''}`}
>
  <input
    type="file"
    id="file-upload"
    onChange={handleFileChange}
    accept=".pdf,.doc,.docx,.txt"
    style={{ display: 'none' }}
    disabled={loading}
  />
  {selectedFile ? (
    <p>{selectedFile.name}</p>
  ) : (
    <p>Click or drag a file here to upload</p>
  )}
</div>


      {selectedFile && (
        <div className={styles.fileSummarySection}>
          <div className={styles.inlineFileDisplay}>
            {selectedFile.name}
            <span
              onClick={() => {
                setSelectedFile(null);
                setJobFileLabel('');
              }}
              className={styles.clearInline}
              role="button"
            >
              ×
            </span>
          </div>

          <label htmlFor="jobFileLabel">Label for This File <strong>(Required)</strong></label>
          <input
            id="jobFileLabel"
            type="text"
            value={jobFileLabel}
            onChange={(e) => setJobFileLabel(e.target.value)}
            className={styles.inputField}
            placeholder="e.g. Amazon Robotics Co-op"
            disabled={loading}
            required
          />
        </div>
      )}

      {error && <p className={styles.jobError}>{error}</p>}
      {loading && <p className={styles.jobLoading}>Uploading...</p>}
      {success && <p className={styles.jobSuccess}>{success}</p>}

      <button
        type="submit"
        disabled={isSubmitDisabled || loading}
        className={`${styles.jobSubmitButton} ${
          !isSubmitDisabled && !loading ? styles.activeButton : ''
        }`}
      >
        Submit
      </button>

      {submittedJobs.length > 0 && (
        <div className={styles.jobHistory}>
          <h3>Uploaded Jobs</h3>
          <ul>
            {submittedJobs.map(job => (
              <li key={job.job_id}>
                <a href={job.blob_url} target="_blank" rel="noopener noreferrer">
                  {job.job_id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

export default JobForm;
