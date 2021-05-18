import _ from 'lodash';

/**
 * Issue a generic Jira API request
 * @param {*} param0 
 * @returns 
 */
export const makeJiraApiRequest = async (
  {
    method='POST',
    requestPath= "",
    body
  }
) => {
  const BASE_JIRA_API_PATH = '/rest/api/2';

  const response = await fetch(
    `${BASE_JIRA_API_PATH}/${requestPath}`,
    {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }
  );

  return await response?.json();
}

/**
 * JQL Request 
 * Returns full depaginated results
 * 
 * @param {*} param0 
 * @returns 
 */
export const makeJqlRequest = async (
  {
    jql,
    fields = [],
    resultPropertyPath = "issues",
    maxResults = 50
  }
) => {
  var startAt = 0;
  var allResultsReturned = []
  var totalNumberOfResults = 0;

  do {
    const response = await makeJiraApiRequest(
      {
        requestPath: "search",
        body: {
          jql,
          fields,
          startAt,
          maxResults
        }
      }
    );
    
    totalNumberOfResults = response?.total;
    allResultsReturned = 
      allResultsReturned.concat(
        _.get(response, resultPropertyPath, [])
      );
    console.log(`je: Got ${allResultsReturned.length} of ${totalNumberOfResults} results for jql ${jql}`);
    startAt = allResultsReturned?.length;
  }while(totalNumberOfResults>allResultsReturned.length);

  return allResultsReturned;
}

export const getIssuesLinkedToEpic = async (
  {
    epicKey,
    fields = ["key","issuetype", "status"]
  }
) => {
  return await makeJqlRequest(
    {
      jql: `'Epic Link'=${epicKey}`,
      fields
    }
  );
}

export const getIssuesForKeys = async (keys, fields=[]) => {

  if(!keys.length) {
    return [];
  }
  const jql = `key in (${keys.join()})`;
  //const jql = `key in (DOPE-516)`;
  console.log(`je: getIssuesForKeys: number of keys: ${keys?.length}}`);
  console.log(`je: getIssuesForKeys: jql: ${jql}}`);

  const issueData = await makeJqlRequest(
    {
      jql,
      fields,
      maxResults:5000
    }
  );

  //console.log(`je: getIssuesForKeys: ${JSON.stringify(issueData, null, 2)}`);
  console.log(`je: getIssuesForKeys: issueData.length: ${issueData.length}`);

  return issueData;
}

export const getIssuesLinkedToEpics = async (epicKeys, fields=[]) => {

  if(!epicKeys.length) {
    return [];
  }
  const jql = `'Epic Link' in (${epicKeys.join()})`;
  console.log(`je: getIssuesLinkedToEpics: jql: ${jql}}`);

  const issueData = await makeJqlRequest(
    {
      jql,
      fields,
      maxResults:5000
    }
  );

  //console.log(`je: getIssuesLinkedToEpics: ${JSON.stringify(issueData, null, 2)}`);
  console.log(`je: getIssuesLinkedToEpics: issueData.length: ${issueData.length}`);

  return issueData;
}



export const getIssueForKey = async (
  {
    issueKey, 
    fields = []
  }
) => {
  console.log(`Got issue for key ${issueKey} pre`);
  const result = await makeJqlRequest(
    {
      requestPath: "search",
      body: {
        jql:`'key'=${issueKey}`,
        fields
      }
    }
  );

  return result;
}