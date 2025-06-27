import React from 'react';
import {createRoot} from 'react-dom/client';
import JobForm from './components/jobform';

const root= createRoot(document.getElementById('root'));
root.render(<JobForm/>);