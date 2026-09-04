import { view } from '@forge/bridge';

const fields = {
  contact: [
    ['Email', 'Email'],
    ['Phone number', 'Phone Number'],
    ['Date of birth', 'Date of Birth']
  ],
  membership: [
    ['Membership type', 'Membership Type'],
    ['Age definition', 'Age Definition'],
    ['Gender', 'Gender'],
    ['Grade', 'Grade']
  ],
  affiliation: [
    ['Club affiliation', 'Club Affiliation'],
    ['Region affiliation', 'Region Affiliation'],
    ['Club name', 'Club Name'],
    ['Club registration status', 'Club Registration Status'],
    ['Primary club contact', 'Primary Club Contact'],
    ['Staff role for club', 'Staff Role for Club'],
    ['Region name', 'Region Name'],
    ['Staff role for region', 'Staff Role for Region']
  ]
};

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value || 'None';
}

function renderDetails(containerId, user, fieldList) {
  const container = document.getElementById(containerId);

  fieldList.forEach(([label, propertyName]) => {
    const term = document.createElement('dt');
    term.textContent = label;

    const description = document.createElement('dd');
    description.textContent = formatValue(user[propertyName]);

    container.append(term, description);
  });
}

async function loadModal() {
  try {
    const context = await view.getContext();
    const user = context.extension?.modal?.data || {};
    console.log('User Data is', user);

    document.getElementById('name').textContent =
      user.Name || 'Unknown user';

    document.getElementById('membership-id').textContent =
      user['Membership ID'] || 'No membership ID';

    const eligibilityStatus = document.getElementById('eligibility-status')
    const status =  user['Eligibility Status'] || 'Status unavailable';
    eligibilityStatus.textContent = status;

    if(status.toLowerCase().startsWith('eligible')) {
        eligibilityStatus.classList.add('status-eligible');
    } else if(status.toLowerCase().startsWith('ineligible') || status.toLowerCase().startsWith('not eligible')) {
        eligibilityStatus.classList.add('status-ineligible');
    } else {
        eligibilityStatus.classList.add('status-unknown');
    }

    renderDetails('contact-details', user, fields.contact);
    renderDetails('membership-details', user, fields.membership);
    renderDetails('affiliation-details', user, fields.affiliation);
  } catch (error) {
    console.error('Failed to load modal data:', error);

    document.querySelector('.profile').textContent =
      'Unable to load user details.';
  }
}

loadModal();