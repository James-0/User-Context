import Resolver from '@forge/resolver';
import api, { route } from '@forge/api'
import { kvs } from '@forge/kvs';
import { Queue, InvocationError, InvocationErrorCode } from '@forge/events';
const resolver = new Resolver();

const projectsQueue = new Queue({ key: 'jira-projects-queue' });

const PAGE_SIZE = 50;

const userData = [
  {
    Name: "Sarah Miller",
    "Membership Type": ["Junior Player – Full"],
    "Eligibility Status": "Eligible",
    "Membership ID": "USAV-2026-00341",
    "Email": "sarah.miller@email.com",
    "Phone Number": "+1 (614) 555-0192",
    "Date of Birth": "2012-03-14",
    "Age Definition": "Youth",
    "Gender": "Female",
    "Club Affiliation": "Columbus Juniors VBC",
    "Grade": "8th",
    "Region Affiliation": "Ohio Valley Region",
    "Household Link": "https://mms.usavolleyball.org/household/HH-00341",
    "Staff Role for Club": "",
    "Club Name": "",
    "Club Registration Status": "",
    "Primary Club Contact": "",
    "Region Affiliation for Club": "",
    "Staff Role for Region": "",
    "Region Name": ""
  },
  {
    Name: "David Okafor",
    "Membership Type": ["Adult Coach – Full", "Junior Coach – Full"],
    "Eligibility Status": "Not Eligible – Required credential incomplete",
    "Membership ID": "USAV-2026-00887",
    "Email": "david.okafor@columbusjuniors.org",
    "Phone Number": "+1 (614) 555-0478",
    "Date of Birth": "1985-07-22",
    "Age Definition": "Adult",
    "Gender": "Male",
    "Club Affiliation": "Columbus Juniors VBC",
    "Grade": "",
    "Region Affiliation": "Ohio Valley Region",
    "Household Link": "https://mms.usavolleyball.org/household/HH-00887",
    "Staff Role for Club": "Head Coach",
    "Club Name": "Columbus Juniors VBC",
    "Club Registration Status": "Active",
    "Primary Club Contact": "david.okafor@columbusjuniors.org",
    "Region Affiliation for Club": "Ohio Valley Region",
    "Staff Role for Region": "",
    "Region Name": ""
  },
  {
    Name: "Linda Hayes",
    "Membership Type": ["Region Administrative – Full"],
    "Eligibility Status": "Eligible",
    "Membership ID": "USAV-2026-00102",
    "Email": "linda.hayes@ohiovalleyregion.org",
    "Phone Number": "+1 (513) 555-0034",
    "Date of Birth": "1978-11-05",
    "Age Definition": "Adult",
    "Gender": "Female",
    "Club Affiliation": "",
    "Grade": "",
    "Region Affiliation": "Ohio Valley Region",
    "Household Link": "https://mms.usavolleyball.org/household/HH-00102",
    "Staff Role for Club": "",
    "Club Name": "",
    "Club Registration Status": "",
    "Primary Club Contact": "",
    "Region Affiliation for Club": "",
    "Staff Role for Region": "Region Commissioner",
    "Region Name": "Ohio Valley Region"
  },
  {
    Name: "James Wu",
    "Membership Type": ["Junior Player – Tryout"],
    "Eligibility Status": "Not Eligible – Membership not yet started",
    "Membership ID": "USAV-2026-01204",
    "Email": "james.wu@email.com",
    "Phone Number": "+1 (312) 555-0761",
    "Date of Birth": "2011-09-30",
    "Age Definition": "Youth",
    "Gender": "Male",
    "Club Affiliation": "",
    "Grade": "9th",
    "Region Affiliation": "Illinois Region",
    "Household Link": "https://mms.usavolleyball.org/household/HH-01204",
    "Staff Role for Club": "",
    "Club Name": "",
    "Club Registration Status": "",
    "Primary Club Contact": "",
    "Region Affiliation for Club": "",
    "Staff Role for Region": "",
    "Region Name": ""
  },
  {
    Name: "Emily Thompson",
    "Membership Type": ["Adult Coach – Full"],
    "Eligibility Status": "",
    "Membership ID": "USAV-2026-00567",
    "Email": "emily.thompson@email.com",
    "Phone Number": "+1 (513) 555-0034",
    "Date of Birth": "1980-03-15",
    "Age Definition": "Adult",
    "Gender": "Female",
    "Club Affiliation": "Columbus Juniors VBC",
    "Grade": "",
    "Region Affiliation": "Ohio Valley Region",
    "Household Link": "https://mms.usavolleyball.org/household/HH-00567",
    "Staff Role for Club": "Head Coach",
    "Club Name": "Columbus Juniors VBC",
    "Club Registration Status": "Active",
    "Primary Club Contact": "emily.thompson@columbusjuniors.org",
    "Region Affiliation for Club": "Ohio Valley Region",
    "Staff Role for Region": "",
    "Region Name": ""
  }
]

resolver.define('result', async (req) => {
  // check if storage has project/field data
    const settings = await kvs.entity('app_settings').get('global');
    console.log('Retrieved settings from storage:', settings);
  // console.log(req);
  // const user = await getFieldValues(req);
  // console.log('Field Values:', user);
  const issueKey = req.context?.extension?.issue?.key;
  if (!issueKey) {
    throw new Error('Jira issue key is missing from the resolver context');
  }

  const issue = await getissue(issueKey);
  if (issue) {
    const memberId = issue?.fields?.customfield_10573;
    if (memberId == null || memberId == undefined) {
      throw new Error('Membership ID is missing from the Jira issue fields');
    }
    // run api function
    const user = userData.find(
      (u) => u['Membership ID'] === memberId
    );
    console.log('User is: ', user);
    if (!user) {
      throw new Error(`No user found with Membership ID: ${memberId}`);
    }
    return {
      statusCode: 200,
      body: user
    };
  }
});

async function getissue(issueKey) {
  const response = await api
    .asApp()
    .requestJira(
      route`/rest/api/3/issue/${issueKey}`
    );

  if (!response.ok) {
    throw new Error(
      `Jira API failed: ${response.status}`
    );
  }

  const issue = await response.json();
  console.log(`Issue self is ${issue?.self} `)
  return issue;
}



// admin page functions
// Save admin configuration
resolver.define('saveConfig', async (req) => {
  const { allowedProjects = [], selectedFields = [] } = req.payload;
  console.log('Saving config:', { allowedProjects, selectedFields });
  await kvs.entity('app_settings').set('global', { allowedProjects, selectedFields });
  console.log('Configuration saved successfully.');
  return { success: true };
});

// Retrieve configuration in Admin UI or Issue Context Panel
resolver.define('getConfig', async () => {
  return (await kvs.entity('app_settings').get('global')) || { allowedProjects: [], selectedFields: [] };
});

// Check if panel should load for the current project context
resolver.define('checkPanelEligibility', async (req) => {
  console.log('Checking panel eligibility for project:', req.payload.projectKey);
  const currentProject = req.payload.projectKey;
  const settings = await kvs.entity('app_settings').get('global');
  console.log('Retrieved settings from storage:', settings);
  const isAllowed = settings?.allowedProjects?.includes(currentProject);
  console.log(`Project ${currentProject} is allowed: ${isAllowed} `);
  console.log('selectedFields:', settings?.selectedFields || []);
  return { isAllowed, selectedFields: settings?.selectedFields || [] };
});

export async function processJiraQueue(event) {
  console.log('Received Jira queue event:', event);
  const { startAt = 0 } = event.body || {};

  const response = await api
    .asApp()
    .requestJira(
      route`/rest/api/3/project/search?startAt=${startAt}&maxResults=${PAGE_SIZE}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    // Handle rate limiting (HTTP 429) by returning an InvocationError with retry information
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = Math.min(
      900,
      Math.max(1, Number.parseInt(retryAfterHeader || '60', 10))
    );

    // return when the function is rate limited, so it can be retried later
    console.warn(
      `Jira API rate limit reached. Retrying after ${retryAfter} seconds.`
    );
    return new InvocationError({
      retryAfter,
      retryReason: InvocationErrorCode.FUNCTION_UPSTREAM_RATE_LIMITED,
      retryData: {
        startAt,
      },
    });
  }

  // Handle other non-successful responses
  if (!response.ok) {
    throw new Error(
      `Jira project request failed: ${response.status}`
    );
  }

  const page = await response.json();
  // const projects = page.values || [];
  const projects = page.values.map((p) => ({
            label: p.name,
            value: p.key,
            avatarUrl: p.avatarUrls?.['16x16'],
        })) || [];

  // Persist using a deterministic key so retries do not duplicate data.
  await kvs.entity('project_cache').set(
    `page-${startAt}`,
    {
      startAt,
      projects,
      isLast: page.isLast,
      fetchedAt: new Date().toISOString(),
    }
  );
// queue pushes the next page of projects to the queue if 
// there are more pages to fetch
  if (!page.isLast && projects.length > 0) {
    await projectsQueue.push({
      body: {
        startAt: startAt + projects.length,
      },
      concurrency: {
        key: 'jira-project-pagination',
        limit: 1,
      },
    });
  }

  console.log(
    `Processed ${projects.length} projects at startAt=${startAt}`
  );  
}

resolver.define('fetchAllProjects', async () => {
  const { jobId } = await projectsQueue.push({
    body: {
      startAt: 0,
    },
    concurrency: {
      key: 'jira-project-pagination',
      limit: 1,
    },
  });

  return {
    started: true,
    jobId,
  };
});


export const handler = resolver.getDefinitions();

export const adminHandler = resolver.getDefinitions();
