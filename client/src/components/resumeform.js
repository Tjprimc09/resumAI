import React, { useState } from 'react';
import * as styles from '../styles/resumeform.module.scss';

const ResumeForm = () => {
  const [resumeFiles, setResumeFiles] = useState([]);
  const [fileLabels, setFileLabels] = useState({});
  const [manualText, setManualText] = useState('');
  const [manualLabel, setManualLabel] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const hasFiles = resumeFiles.length > 0;
  const hasText = manualText.trim().length > 0;

  const isFileUploadValid = hasFiles && resumeFiles.every(f => fileLabels[f.name]?.trim());
  const isTextUploadValid = hasText && manualLabel.trim().length > 0;
  const canSubmit = isFileUploadValid || isTextUploadValid;

  const showMessage = (msg) => {
    setUploadMessage(msg);
    setTimeout(() => setUploadMessage(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsUploading(true);
    let messages = [];

    try {
      if (isFileUploadValid) {
        for (const file of resumeFiles) {
          const formData = new FormData();
          formData.append('resume_file', file);
          formData.append('version_label', fileLabels[file.name].trim());
          formData.append('input_type', 'upload');

          const res = await fetch('/api/upload_resume', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
          messages.push(`${file.name} uploaded.`);
        }

        setResumeFiles([]);
        setFileLabels({});
      }

      if (isTextUploadValid) {
        const blob = new Blob([manualText.trim()], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('resume_file', blob, 'manual_resume.txt');
        formData.append('version_label', manualLabel.trim());
        formData.append('input_type', 'manual');

        const res = await fetch('/api/upload_resume', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Manual upload failed');
        messages.push('Manual resume submitted.');

        setManualText('');
        setManualLabel('');
      }

      showMessage(messages.join(' '));
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Upload failed. Check console.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.resumeFormContainer}>
      <form onSubmit={handleSubmit} className={styles.resumeFormSection}>
        <h1 className={styles.sectionTitle}>Submit Resume</h1>
        <p className={styles.sectionSubtitle}>
          Upload one or more resume versions or manually enter below.
        </p>

        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (isUploading) return;
            const files = Array.from(e.dataTransfer.files).filter(
              file => !resumeFiles.find(f => f.name === file.name)
            );
            setResumeFiles(prev => [...prev, ...files]);
          }}
          onClick={() => {
            if (!isUploading) {
              document.getElementById('resumeFileInput').click();
            }
          }}
        >
          Click or drag files here to upload 
        </div>

        <input
          id="resumeFileInput"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            const newFiles = Array.from(e.target.files).filter(
              file => !resumeFiles.find(f => f.name === file.name)
            );
            setResumeFiles(prev => [...prev, ...newFiles]);
          }}
        />

        {resumeFiles.length > 0 && (
          <div className={styles.fileSummarySection}>
            {resumeFiles.map((file, idx) => (
              <div key={idx} className={styles.inlineFileDisplay}>
                {file.name}
                <span
                  onClick={() => {
                    setResumeFiles(prev => prev.filter((_, i) => i !== idx));
                    setFileLabels(prev => {
                      const updated = { ...prev };
                      delete updated[file.name];
                      return updated;
                    });
                  }}
                  className={styles.clearInline}
                  role="button"
                >
                  ×
                </span>
                <label htmlFor={`label-${idx}`}>Label for This File <strong>(Required)</strong></label>
                <input
                  id={`label-${idx}`}
                  type="text"
                  placeholder="e.g. Summer 2025 Revision"
                  value={fileLabels[file.name] || ''}
                  onChange={(e) => {
                    const label = e.target.value;
                    setFileLabels(prev => ({ ...prev, [file.name]: label }));
                  }}
                  disabled={isUploading}
                  className={styles.inputField}
                  required
                />
              </div>
            ))}
          </div>
        )}

        <label htmlFor="manualText" className={styles.sectionTitle}></label>
        <div className={styles.jobFieldGroup}>
          <textarea
            id="manualText"
            rows="10"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Or paste your resume, additional work experience, or skills inventory here..."
            disabled={isUploading}
            className={styles.textarea}
          />
        </div>

        {manualText.trim() && (
          <div className={styles.jobFieldGroup}>
            <label htmlFor="manualLabel">Label for This Entry <strong>(Required)</strong></label>
            <input
              id="manualLabel"
              type="text"
              placeholder="Example: Spring 2025 Skills Update"
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              disabled={isUploading}
              className={styles.inputField}
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isUploading}
          className={`${styles.submitButton} ${canSubmit ? styles.activeButton : ''}`}
        >
          {isUploading ? (
            <>
              <span className={styles.spinner} /> Submitting...
            </>
          ) : 'Submit Resume'}
        </button>
      </form>

      {uploadMessage && (
        <div className={styles.uploadMessage}>
          {uploadMessage}
          <button
            className={styles.copyButton}
            onClick={() => navigator.clipboard.writeText(uploadMessage)}
            aria-label="Copy confirmation message"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;
