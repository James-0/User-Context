import React, { useEffect, useState } from 'react';
import { invoke, view, Modal } from '@forge/bridge';
import './App.css';
import LoadingSpinner from './LoadSpinner';
import LoadModal from './LoadModal';

const context = view.getContext();

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleanMessage, setCleanMessage] = useState('');

  useEffect(() => {
    invoke('result', { context })
      .then((result) => {
        setData(result);
      })
      .catch((invokeError) => {
        console.error('Failed to load member data:', invokeError);
        setCleanMessage(invokeError?.message
          .replace(/^There was an error invoking the function\s*-\s*/i, '')
          .trim());
        setError(cleanMessage || 'Unable to load member data.');
      })
      .finally(() => {
        setLoading(false);
        setCleanMessage('');
      });
  }, []);

  if (loading || (!data && !error)) {
    return (
      <main className="app-frame">
        <LoadingSpinner />
      </main>
    );
  }

  // function customerData() {
  //   if (!data?.body || data.body === 'N/A') {
  //     return (
  //       <main className="app-frame">
  //         <p>Member data not available.</p>
  //       </main>
  //     );
  //   }
  // } 
  function setErrorContent(error) {
    if (error !== null) {
      return (
        <main className="app-frame">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              invoke('result', { context })
                .then((result) => {
                  setData(result);
                })
                .catch((invokeError) => {
                  console.error('Failed to load member data:', invokeError);
                  setCleanMessage(invokeError?.message
                    .replace(/^There was an error invoking the function\s*-\s*/i, '')
                    .trim());
                  setError(cleanMessage || 'Unable to load member data.');
                })
                .finally(() => {
                  setLoading(false);
                  setCleanMessage('');
                });
            }}
          >
            Retry
          </button>
        </main>
      );
    }
  }

  async function openUserModal(data) {
    const modal = new Modal({
      resource: 'modal',
      onClose: (payload) => {
        console.log('onClose called with', payload);
      },
      size: 'medium',
      context: {
        name: data.Name,
        email: data.Email,
        region: data["Region Affiliation"]
      },
      title: 'My Modal'
    });
    await modal.open();
  }


  return (
    console.log('view.getContext:', context),
    <main className="app-frame">
      {error ? (
        setErrorContent(error)
      ) : (
        <div className="vbox">
          <ul>
            <li>Name: {data?.body?.Name || 'N/A'}</li>
            <li>Membership Type: {data?.body?.['Membership Type']?.join(', ') || 'N/A'}</li>
            <li>Eligibility Status: {data?.body?.['Eligibility Status'] || 'N/A'}</li>
            <li>Membership ID: {data?.body?.['Membership ID'] || 'N/A'}</li>
            <li>Email: {data?.body?.Email || 'N/A'}</li>
            <li>Phone Number: {data?.body?.['Phone Number'] || 'N/A'}</li>
            {/* <li>Date of Birth: {data?.body?.['Date of Birth'] || 'N/A'}</li>
            <li>Age Definition: {data?.body?.['Age Definition'] || 'N/A'}</li>
            <li>Gender: {data?.body?.Gender || 'N/A'}</li>
            <li>Club Affiliation: {data?.body?.['Club Affiliation'] || 'N/A'}</li>
            <li>Grade: {data?.body?.Grade || 'N/A'}</li>
            <li>Region Affiliation: {data?.body?.['Region Affiliation'] || 'N/A'}</li>
            <li>Household Link: {data?.body?.['Household Link'] || 'N/A'}</li>
            <li>Staff Role for Club: {data?.body?.['Staff Role for Club'] || 'N/A'}</li>
            <li>Club Name: {data?.body?.['Club Name'] || 'N/A'}</li>
            <li>Club Registration Status: {data?.body?.['Club Registration Status'] || 'N/A'}</li>
            <li>Primary Club Contact: {data?.body?.['Primary Club Contact'] || 'N/A'}</li>
            <li>Region Affiliation for Club: {data?.body?.['Region Affiliation for Club'] || 'N/A'}</li>
            <li>Staff Role for Region: {data?.body?.['Staff Role for Region'] || 'N/A'}</li>
            <li>Region Name: {data?.body?.['Region Name'] || 'N/A'}</li> */}
          </ul>
          <div>
            <button
              appearance="link"
              onClick={
                () => {
                  console.log('Calling Modal Dialog...');
                  openUserModal(data?.body)
                }}
            >
              View full profile →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}


export default App;
