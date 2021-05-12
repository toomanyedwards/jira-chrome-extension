
const getIssuesLinkedToEpic = async epicKey => {

  //console.log(`Getting issues linked to ${epicKey}`);

  var issuesLinkedToEpic = [];
  var startAt = 0;
  var totalLinkedIssues;
  const maxResults = 50;

  do{
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
            "jql":`'Epic Link'=${epicKey}`,
            // To return custom fields, the pattern is "customfield_<CUSTOM_FIELD_ID>"
            // To get the ID of a custom field GET <BASE_JIRA_URL>/rest/api/2/field and
            // search for your custom field
            // Field 11901 is Story Points 
            "fields":["key","issuetype", "status", "customfield_11901"],
            "maxResults" : maxResults,       
            "startAt":startAt
           }
        )
      }
    );

    const epicIssuesResponse = await response?.json();
    //console.log(`Response for epic ${epicKey}:\n${JSON.stringify(epicIssuesResponse, null, 2)}`);
    //console.log(`Retrieved ${epicIssuesResponse?.issues.length} issues for epic ${epicKey}`);
    issuesLinkedToEpic = issuesLinkedToEpic.concat(epicIssuesResponse?.issues);
    //console.log(`Fetched ${issuesLinkedToEpic?.length} of ${epicIssuesResponse?.total} for ${epicKey}`);


    startAt=issuesLinkedToEpic?.length;
    totalLinkedIssues = epicIssuesResponse?.total;

  }while(totalLinkedIssues>issuesLinkedToEpic?.length);

  return issuesLinkedToEpic;
}

const isIssueUpdated = (issue) => {
  return issue?.getAttribute('modified-by-extension')
}

const markIssueUpdated = (issue) => {
  console.log(`Setting modifiedByExtension`);
  issue.setAttribute('modified-by-extension', 'true');
}

/**
 * Find all Jira issue cards that are descendants 
 * @param {*} issuePool 
 * @returns NodeList of Jira issue cards
 */
const updatePoolIssues = async issuePool => {
  const issuesInPool = getJiraIssues(issuePool);

  issuesInPool?.forEach(
    issue => {
      if(!isIssueUpdated(issue)) {
        addDaysInColumnField(issue);
        addStoryPointsLabel(issue);    

        const issueType = getIssueType(issue);

        if(issueType === 'Epic') {
          handleEpic(issue);
        } else {
          if(['Story', 'Spike'].includes(issueType)){
            const storyPoints = getStoryPoints(issue);
            console.log(`${storyPoints} points for issue ${getIssueKey(issue)}`);
            if(storyPoints >0 ) {
              markIssueAsReady(issue);
            } else {
              markIssueNeedsAttention(issue);
            }
          }
        }
        //console.log(`found ghx-pool issue ${getIssueKey(issue)} ${getIssueType(issue)}`);
        markIssueUpdated(issue);  
      } else {
        console.log(`Ignoring updated issue`);
      }
    }
  );
}

const markIssueNeedsAttention = (issue) => {
  issue.setAttribute("style", "background-color:Khaki;" );
}

const markIssueAsReady = (issue) => {
  issue.setAttribute("style", "background-color:LightBlue;" );
}

const handleEpic = async epicIssue => {
  const issueKey = getIssueKey(epicIssue);
  console.log(`Handling Epic ${issueKey}`);

  const issuesLinkedToEpic = await getIssuesLinkedToEpic(issueKey);

  const epicIssuesSummary = issuesLinkedToEpic?.reduce(
    (epicSummary, linkedIssue) => {
      const status = linkedIssue?.fields?.status?.name;
      const storyPoints = linkedIssue?.fields?.customfield_11901;
      const issueType = linkedIssue?.fields?.issuetype.name;

      if(['Story', 'Spike'].includes(issueType)) {
        epicSummary.totalNumberOfStoriesOrSpikes++;
        epicSummary.totalStoryPoints += storyPoints;

        if(status === 'Closed') {
          epicSummary.numberOfClosedStoriesOrSpikes++;
          epicSummary.storyPointsCompleted += storyPoints;
        }

        if(storyPoints > 0) {
          epicSummary.numberOfStoriesOrSpikesWithEstimates++;
        }
      } else if (['Bug'].includes(issueType)){
        epicSummary.totalNumberOfBugs++;

        if(status === 'Closed') {
          epicSummary.numberOfBugsClosed++;
        }
      }
      
      console.log(`Reducing issue ${linkedIssue.key} (${status}) for epic ${issueKey}`);
      return epicSummary;
    }, 
    {
      totalNumberOfStoriesOrSpikes: 0,
      numberOfStoriesOrSpikesWithEstimates: 0,
      numberOfClosedStoriesOrSpikes: 0,
      totalNumberOfBugs: 0,
      numberOfBugsClosed: 0,
      totalStoryPoints: 0,
      storyPointsCompleted: 0
    } 
  )??{};
  
  addIssueField(epicIssue, "issuesEstimated", `${epicIssuesSummary?.numberOfStoriesOrSpikesWithEstimates} of ${epicIssuesSummary?.totalNumberOfStoriesOrSpikes} stories estimated`);
  addIssueField(epicIssue, "storiesCompleted", `${epicIssuesSummary?.numberOfClosedStoriesOrSpikes} of ${epicIssuesSummary?.totalNumberOfStoriesOrSpikes} stories completed`);
  addIssueField(epicIssue, "storyPointsCompleted", `${epicIssuesSummary?.storyPointsCompleted} of ${epicIssuesSummary?.totalStoryPoints} points completed`);
  addIssueField(epicIssue, "bugsClosed", `${epicIssuesSummary?.numberOfBugsClosed} of ${epicIssuesSummary?.totalNumberOfBugs} bugs closed`);

  // Remove story points field from Epic
  epicIssue?.querySelector("span[id='labeledStoryPointsField']")?.parentNode?.remove();

  if(
    epicIssuesSummary.numberOfStoriesOrSpikesWithEstimates === 0 
    ||
    (epicIssuesSummary.totalNumberOfStoriesOrSpikes != epicIssuesSummary.numberOfStoriesOrSpikesWithEstimates)
    
   ) {
    markIssueNeedsAttention(epicIssue);
  } else if (
    epicIssuesSummary.numberOfStoriesOrSpikesWithEstimates > 0 &&
    epicIssuesSummary.totalNumberOfStoriesOrSpikes === epicIssuesSummary.numberOfStoriesOrSpikesWithEstimates
  ) {
    markIssueAsReady(epicIssue);
  }

  //console.log(`ghx-pool response: Epic ${issueKey} has ${epicIssuesSummary.numberOfIssues} linked issues`);
}

const addIssueField = (issue, fieldId, fieldValue )=> {
  //console.log(`Adding field ${fieldId}`);
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

    console.log(`${storyPoints} foo points for issue ${getIssueKey(issue)}`);
  return parseFloat(storyPoints)??0.0;
}

const addStoryPointsLabel = issue => {
  //console.log(`Adding story points lable to issue ghx-pool issue`);

  // If the daysInColumnField hasn't already been added
  if(!issue.querySelector("span[id='labeledStoryPointsField']")) {
    const storyPointsSpan = issue.querySelector("span[data-tooltip*='Story Points:']");

    if(storyPointsSpan) {
      const storyPoints = getStoryPoints(issue);
      storyPointsSpan.textContent = `${storyPoints} story points`;
      storyPointsSpan.setAttribute("id", "labeledStoryPointsField");
      //storyPointsSpan.setAttribute("data-tooltip", `${storyPoints} story points`);
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
  //console.log(`Adding days in columns to issue ghx-pool issue`);

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
          const classAttr = mutation.target.getAttribute('class');
          //console.log(`mutation: id: ${id} class:${classAttr}`);
          // If the issue pool has mutated...
          if(id==='ghx-pool'
           || classAttr?.includes('ghx-column')) 
          {
            //console.log(`handling ghx-pool mutation`);
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