
/**
 * Find all Jira issue cards that are descendants 
 * @param {*} issuePool 
 * @returns NodeList of Jira issue cards
 */
const updatePoolIssues = async issuePool => {
  const issuesInPool = getJiraIssues(issuePool);

/*
  const response = await fetch(
    '/rest/api/latest/issue/DOPE-315',
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const result = await response.json();
  console.log(`ghx-pool response ${JSON.stringify(result, null, 2)}`);

  */
  issuesInPool?.forEach(
    issue => {
      const issueType = getIssueType(issue);

      if(issueType === 'Epic') {
        handleEpic(issue);
      } else {
        // Handle non-epic only functionality
      }
      console.log(`found ghx-pool issue ${getIssueKey(issue)} ${getIssueType(issue)}`);
      
      addDaysInColumnField(issue);
      addStoryPointsLabel(issue);    }
  );
}

/*
curl -N -u "admin:admin" -X POST -H "Accept-Encoding: gzip,deflate" -H "Content-type: application/json" --data '{"jql":"project = PROYECKEY AND (issue in allFromEpic('PROYECKEY-1') OR issue in allFromEpic('PROYECKEY-2')) AND updatedDate >= 2020-04-01 and updatedDate < 2020-05-01","startAt":0,"maxResults":10,"fields":["key","issuetype","summary","priority","status","created","updated"]}' "http://localhost:8080/rest/api/2/search"
*/

const handleEpic = async epicIssue => {
  const issueKey = getIssueKey(epicIssue);
  console.log(`Handling Epic ${issueKey}`);

  // 
  // 
  // "Epic Link" = CC-2
  const response = await fetch(
    "/rest/api/2/search",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          "jql":`'Epic Link'=${issueKey}`,
          // To return custom fields, the pattern is "customfield_<CUSTOM_FIELD_ID>"
          // To get the ID of a custom field GET <BASE_JIRA_URL>/rest/api/2/field and
          // search for your custom field
          // Field 11901 is Story Points 
          "fields":["key","issuetype", "status", "customfield_11901"]
        }
      )
    }
  );

  const epicIssuesResponse = await response.json();

  const epicIssuesSummary = epicIssuesResponse?.issues?.reduce(
    (epicSummary, linkedIssue) => {
      const status = linkedIssue.fields.status.name;
      const storyPoints = linkedIssue.fields.customfield_11901;

      epicSummary.numberOfIssues++;
      epicSummary.totalStoryPoints += storyPoints;
      

      if(status === 'Closed') {
        epicSummary.numberOfClosedIssues++;
        epicSummary.storyPointsCompleted += storyPoints;
      }

      if(storyPoints > 0) {
        epicSummary.numberOfIssuesWithEstimates++;
      }

      console.log(`Reducing issue ${linkedIssue.key} (${status}) for epic ${issueKey}`);
      return epicSummary;
    }, 
    {
      numberOfIssues: 0,
      numberOfIssuesWithEstimates: 0,
      numberOfClosedIssues: 0,
      totalStoryPoints: 0,
      storyPointsCompleted: 0
    } 
  )??{};
  
  addIssueField(epicIssue, "issuesEstimated", `${epicIssuesSummary?.numberOfIssuesWithEstimates} of ${epicIssuesSummary?.numberOfIssues} stories estimated`);
  addIssueField(epicIssue, "storiesCompleted", `${epicIssuesSummary?.numberOfClosedIssues} of ${epicIssuesSummary?.numberOfIssues} stories completed`);
  addIssueField(epicIssue, "storyPointsCompleted", `${epicIssuesSummary?.storyPointsCompleted} of ${epicIssuesSummary?.totalStoryPoints} points completed`);

  console.log(`ghx-pool response: Epic ${issueKey} has ${epicIssuesSummary.numberOfIssues} linked issues`);
  //console.log(`ghx-pool response ${epicIssuesResponse?.issues[0]?.fields.customfield_11901}`);
}

const addIssueField = (issue, fieldId, fieldValue )=> {
  console.log(`Adding field ${fieldId}`);
  // If the daysInColumnField hasn't already been added
  if(!issue.querySelector(`span[id='${fieldId}']`)) {
    
    // Get the extra fields section
    const extraFieldsDiv = issue.querySelector("div[class='ghx-extra-fields']");

    if (extraFieldsDiv) {

      extraFieldsDiv.insertAdjacentHTML(
        'beforeend', 
        `<div class="ghx-extra-field-row"><span class="ghx-extra-field" id="${fieldId}" data-tooltip="${fieldValue}"><span class="ghx-extra-field-content">${fieldValue}</span></span></div>` 
      );
    }
  }
}

const getIssueKey = issue => {
  const issueType = issue?.getAttribute("data-issue-key");
  return issueType;
}


const getIssueType = issue => {
  const issueType = issue?.querySelector("span[class='ghx-type']")?.getAttribute("title");
  return issueType;
}

const getStoryPoints = issue => {
  const storyPoints = 
    issue.querySelector("span[data-tooltip*='Story Points']")?.
    getAttribute("data-tooltip")?.
    replace("Story Points: ","");

  return storyPoints??"Unknown";
}

const addStoryPointsLabel = issue => {
  console.log(`Adding story points lable to issue ghx-pool issue`);

  // If the daysInColumnField hasn't already been added
  if(!issue.querySelector("span[id='labeledStoryPointsField']")) {
    const storyPointsSpan = issue.querySelector("span[data-tooltip*='Story Points:']");

    if(storyPointsSpan) {
      const storyPoints = getStoryPoints(issue);
      storyPointsSpan.textContent = `${storyPoints} story points`;
      storyPointsSpan.setAttribute("id", "labeledStoryPointsField");
      storyPointsSpan.setAttribute("data-tooltip", `${storyPoints} story points`);
    }
  }
}

const getDaysInColumn = issue => {
  const daysInColumn = 
    issue.querySelector("div[class='ghx-days']")?.
    getAttribute("title")?.
    replace(" days in this column","");

  return daysInColumn??"Unknown"
}

const addDaysInColumnField = issue => {
  console.log(`Adding days in columns to issue ghx-pool issue`);

  // If the daysInColumnField hasn't already been added
  if(!issue.querySelector("span[id='daysInColumnField']")) {
    
    // Get the extra fields section
    const extraFieldsDiv = issue.querySelector("div[class='ghx-extra-fields']");

    if (extraFieldsDiv) {

      const daysInColumn = getDaysInColumn(issue);

      extraFieldsDiv.insertAdjacentHTML(
        'beforeend', 
        `<div class="ghx-extra-field-row"><span class="ghx-extra-field" id="daysInColumnField" data-tooltip="${daysInColumn} days in column"><span class="ghx-extra-field-content">${daysInColumn} days in column</span></span></div>` 
      );
    }
  }
}

const getJiraIssues = issuePool => {
  return issuePool.querySelectorAll("div[class*='js-detailview']");
}

/**
 * Document mutation obeserver
 */
 var observer = new MutationObserver(
  (mutations) => {  
      mutations.forEach(
        mutation => {
          
          const id = mutation.target.getAttribute('id');

          // If the issue pool has mutated...
          if(id==='ghx-pool') {
            console.log(`handling ghx-pool mutation`);
            updatePoolIssues(mutation.target);
        }      
      } 
    )
  }    
);


const target = document.querySelector("html");
const config = { childList:true, subtree:true};

/**
 * Observe all mutations to the DOM
 * TODO: Optimize this later if necessary
 */

observer.observe(target, config);