import React, { useState } from 'react';
import JobForm from './jobform';
import ResumeForm from './resumeform';
import *as styles from '../styles/tabcard.module.scss';

const TabCard = () => {
  const [activeTab, setActiveTab] = useState('job');

  return (
    <div className={styles.card}>
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tabButton} ${activeTab === 'job' ? styles.active : ''}`}
          onClick={() => setActiveTab('job')}
        >
          Job Descriptions
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'resume' ? styles.active : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          Resumes
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'job' ? <JobForm /> : <ResumeForm />}
      </div>
    </div>
  );
};

export default TabCard;
