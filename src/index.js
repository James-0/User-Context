import Resolver from '@forge/resolver';
import api, { route } from '@forge/api'
const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log('result called, this should work!!!!')
  console.log(req);


  return 'Hello, world!';
});

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
  }
]

resolver.define('result', async (req) => {
  console.log(req);
  // const user = await getFieldValues(req);
  // console.log('Field Values:', user);
  const issueKey = req.context?.extension?.issue?.key;
  if (!issueKey) {
    throw new Error('Jira issue key is missing from the resolver context');
  }

  const issue = await getissue(issueKey);
  if (issue) {
    const memberId = issue?.fields?.customfield_11019;
    if(memberId == null || memberId == undefined) {
      throw new Error('Membership ID is missing from the Jira issue fields');
    }
    // run api function
    const user  = userData.find(
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


// async function getFieldValues(req) {
//   const issueKey = req.context?.extension?.issue?.key;
//   if (!issueKey) {
//     throw new Error('Jira issue key is missing from the resolver context');
//   }

//   const issue = await getissue(issueKey);
//   if (issue) {
//     // const memberId = issue?.fields?.customfield_11019;
//     // if(memberId == null || memberId == undefined) {
//     //   return null;
//     // }
//     // // run api function
//     // const user = userData.filter(userDetail => userDetail['Membership ID'] === issue?.fields?.customfield_11019)
//     // console.log('User is: ', user)
//     // return {
//     //   statusCode: 200,
//     //   body: user
//     // };
//     return
//   }

//   return 'N/A';

// }

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

// response = {
//   statusCode: 404,
//   body: 'Not Found'
// }
// response = {
//   statusCode: 400,
//   body: 'Bad Request'
// }
// response = {
//   statusCode: 401,
//   body: 'Unauthorized'
// }
// response = {
//   statusCode: 500,
//   body: 'Internal Server Error'
// }


export const handler = resolver.getDefinitions();
