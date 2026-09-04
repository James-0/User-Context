import { useEffect, useState } from 'react';
import { invoke, view, Modal } from '@forge/bridge';
import './App.css';
import LoadingSpinner from './LoadSpinner';
import AdminConfig from './components/AdminConfig';

const context = view.getContext();

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleanMessage, setCleanMessage] = useState('');
  const [isAllowedProject, setIsAllowedProject] = useState(null);
  const [moduleKey, setModuleKey] = useState(null);

  // useEffect(() => {
  //   view.getContext().then((ctx) => {
  //     setModuleKey(ctx.moduleKey);
  //   });
  // }, []);

  // useEffect(() => {
  //   invoke('result', { context })
  //     .then((result) => {
  //       setData(result);
  //     })
  //     .catch((invokeError) => {
  //       console.error('Failed to load member data:', invokeError);
  //       const message = invokeError?.message
  //         .replace(/^There was an error invoking the function\s*-\s*/i, '')
  //         .trim();
  //       setCleanMessage(message);
  //       setError(message || 'Unable to load member data.');
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //       setCleanMessage('');
  //     });
  // }, []);

  useEffect(() => {
    async function loadApp() {
      try {
        const ctx = await view.getContext();
        console.log('Retrieved context:', ctx);
        setModuleKey(ctx.moduleKey);

        if (ctx.moduleKey === 'app-issue-panel') {
          const projectKey = ctx.extension?.project?.key;
          console.log(`project key is ${projectKey}`);
          const eligibility = await invoke('checkPanelEligibility', { projectKey });
          console.log('Eligibility result:', eligibility);
          setIsAllowedProject(eligibility?.isAllowed);
          if (!eligibility.isAllowed) {
            console.log('Project is not allowed, skipping API call');
            setLoading(false);
            return;
          }
          const result = await invoke('result', { context: ctx });
          setData(result);
        }
      } catch (invokeError) {
        console.error('Failed to load member data:', invokeError);
        const message = invokeError?.message
          .replace(/^There was an error invoking the function\s*-\s*/i, '')
          .trim();
        setCleanMessage(message);
        setError(message || 'Unable to load member data.');
      } finally {
        setLoading(false);
        setCleanMessage('');
      }
    }
    loadApp();
  }, []);

  // if (loading || (!data && !error)) {
  //   return (
  //     <main className="app-frame">
  //       <LoadingSpinner />
  //     </main>
  //   );
  // }


  function setErrorContent(error) {
    console.log('Error is', error);
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
                const message = invokeError?.message
                  .replace(/^There was an error invoking the function\s*-\s*/i, '')
                  .trim();
                setCleanMessage(message);
                setError(message || 'Unable to load member data.');
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

  async function openUserModal(data) {
    const modal = new Modal({
      resource: 'modal',
      onClose: (data) => {
        console.log('onClose called with', data);
      },
      size: 'large',
      context: {
        data: data
      },
      title: 'Object graph'
    });
    await modal.open();
  }

  function setContextPanel(data) {
    return (
      <div className="vbox">
        <ul>
          <li>Name: {data?.body?.Name || 'N/A'}</li>
          <li>Membership Type: {data?.body?.['Membership Type']?.join(', ') || 'N/A'}</li>
          <li>Eligibility Status: {data?.body?.['Eligibility Status'] || 'N/A'}</li>
          <li>Membership ID: {data?.body?.['Membership ID'] || 'N/A'}</li>
          <li>Email: {data?.body?.Email || 'N/A'}</li>
          <li>Phone Number: {data?.body?.['Phone Number'] || 'N/A'}</li>
          <li>Region Affiliation: {data?.body?.['Region Affiliation'] || 'N/A'}</li>
          {/* <li>Date of Birth: {data?.body?.['Date of Birth'] || 'N/A'}</li>
            <li>Age Definition: {data?.body?.['Age Definition'] || 'N/A'}</li>
            <li>Gender: {data?.body?.Gender || 'N/A'}</li>
            <li>Club Affiliation: {data?.body?.['Club Affiliation'] || 'N/A'}</li>
            <li>Grade: {data?.body?.Grade || 'N/A'}</li>
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
            className="link-button"
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
    )
  }


  if (loading || moduleKey === null) {
    return <LoadingSpinner />;
  }

  if (moduleKey === 'app-issue-panel' && isAllowedProject === null) {
    return <LoadingSpinner />;
  }

  if (loading || moduleKey === null || isAllowedProject === null) return <LoadingSpinner />;
  
  if (moduleKey === 'app-issue-panel' && !isAllowedProject) {
    // module : app-issue-panel is not allowed for this project
    return null;
  }

  if (moduleKey === 'app-admin-page') {
    console.log('module key is', moduleKey);
    return <AdminConfig />
  };

  if (moduleKey === 'app-issue-panel') {
    console.log('module key is', moduleKey);
    return (
      console.log('view.getContext:', context),
      <main className="app-frame">
        {error ? (
          setErrorContent(error)
        ) : (
          setContextPanel(data)
        )}
      </main>
    );
  };
  return null;

}


export default App;
