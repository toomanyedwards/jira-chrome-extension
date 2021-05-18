
import { isCompositeComponent } from 'react-dom/test-utils';
import {getIssuesForKeys, getIssuesLinkedToEpic, getIssuesLinkedToEpics} from './jiraApiUtls'

const IssueType = {
  EPIC: 'Epic',
  STORY: 'Story',
  SPIKE: 'Spike',
  BUG: 'Bug'
};
Object.freeze(IssueType);

// Jira Field Ids
const KEY_FIELD_ID = "key";
const ISSUE_TYPE_FIELD_ID = "issuetype";
const STATUS_FIELD_ID = "status";


// Jira Custom Field Ids
const STORY_POINTS_FIELD_ID = 'customfield_11901';
const PAIR_ASSIGNEE_FIELD_ID = 'customfield_14102';
const EPIC_LINK_FIELD_ID = 'customfield_10008';

/**
 * Returns all issue cards that are descendents of the the specified ancestor el
 * 
 * @param {*} issueCardsAncestorEl 
 * @returns 
 */
 const getDescendantIssueCards = issueCardsAncestorEl => {
  return issueCardsAncestorEl.querySelectorAll("div[class*='js-detailview']");
}


const isIssueCardModifiedByExtension = (issueCard) => {
  return issueCard?.getAttribute('modified-by-extension')
}

const setIssueCardModifiedByExtension = (issueCard) => {
  issueCard.setAttribute('modified-by-extension', 'true');
}

const getIssueType = issue => {
  return issue?.fields?.issuetype?.name;
}

const getIssueKey = issue => {
  return issue?.key;
}

/**
 * Returns all issues with the specified issue type
 * @param {*} issues 
 * @param {*} issueType 
 * @returns 
 */
const getIssuesOfType = (issues, issueType) => {

  return issues.filter(
    issue => issueType === getIssueType(issue)
  );
  
}

const getLinkedEpicKey = issue => {
  return issue?.fields?.[EPIC_LINK_FIELD_ID];
}

/**
 * Gets a Map of issues with a key of Epic issue key and values of an Array of issues
 * linked to the epic 
 * @param {*} issues 
 */
const getEpicLinkedIssuesMap = issues => {
  const epicLinkedIssuesMap = new Map();
  issues.map(
    issue => {
      const linkedEpicKey = getLinkedEpicKey(issue);

      if(linkedEpicKey) {
        const linkedIssues = epicLinkedIssuesMap.get(linkedEpicKey)??[];
        epicLinkedIssuesMap.set(linkedEpicKey, linkedIssues.concat(issue));
      }
    }
  );

  return epicLinkedIssuesMap;
}

/**
 * Gets the keys for the collection of issues
 * @param {*} issues 
 * @returns 
 */
const getIssueKeys = issues => {
  return issues.map(
    issue => getIssueKey(issue)
  );
}

const getIssueDataMap = (
  issueCardsMap, 
  issues, 
  epicLinkedIssuesMap
) => {
  const issueDataMap = new Map();

  issues.map(
    issue => {
      const issueKey =  getIssueKey(issue);
      issueDataMap.set(
        issueKey,
        {
          issueType: getIssueType(issue),
          issue,
          issueCard: issueCardsMap.get(issueKey),
          linkedIssues: epicLinkedIssuesMap.get(issueKey)
        }
      );
    }
  );

  return issueDataMap;
}

/**
 * Updates all issues that are descendents of issueAncestorEl
 * 
 * @param {*} issueCardsAncestorEl 
 * @returns 
 */
const handleMutation = async issueCardsAncestorEl => {
  const descendantIssueCards = getDescendantIssueCards(issueCardsAncestorEl);

  if(!descendantIssueCards?.length) {
    return;
  }

  console.log(`je: handleMutation: found ${descendantIssueCards.length} descendant cards`);
  const issueCardsThatNeedModificationMap = getMapOfIssueCardsThatNeedModification(descendantIssueCards);

  console.log(`je: handleMutation: found ${issueCardsThatNeedModificationMap.size} cards the need modification`);
  
  const issues = await getIssuesForKeys(
    [...issueCardsThatNeedModificationMap.keys()], // Convert map iterator to Array
    [
      KEY_FIELD_ID,
      ISSUE_TYPE_FIELD_ID, 
      STATUS_FIELD_ID,
      STORY_POINTS_FIELD_ID,
      PAIR_ASSIGNEE_FIELD_ID,
      EPIC_LINK_FIELD_ID
    ]
  );

  const issuesLinkedToEpics = await getIssuesLinkedToEpics(
    getIssueKeys(getIssuesOfType(issues, IssueType.EPIC)),
    [
      KEY_FIELD_ID,
      ISSUE_TYPE_FIELD_ID, 
      STATUS_FIELD_ID,
      STORY_POINTS_FIELD_ID,
      PAIR_ASSIGNEE_FIELD_ID,
      EPIC_LINK_FIELD_ID
    ]
  );


  //console.log(`je: handleMutation: found ${epicIssues.length} epics`);
  console.log(`je: handleMutation: found ${issuesLinkedToEpics.length} issues linked to epics`);

  console.log(`je: handleMutation: issueData.length: ${issues?.length}`);

  const epicLinkedIssuesMap = getEpicLinkedIssuesMap(issues);

  console.log(`je: handleMutation: found ${epicLinkedIssuesMap.size} epics linked to issues `);

  const issueDataMap = getIssueDataMap(
    issueCardsThatNeedModificationMap, 
    issues, 
    epicLinkedIssuesMap
  );

  console.log(`je: handleMutation: issueDataMap size ${issueDataMap.size}`);

  issueDataMap.forEach(
    (issueData, issueKey) => {
      const issueType = issueData.issueType;
      applyBaseCardModifications(issueData);

      if (IssueType.EPIC === issueType) {        
        modifyEpicCard(issueData);
      } else if([IssueType.STORY, IssueType.SPIKE].includes(issueType)) {
        console.log(`je: handleMutation: is story or spike`);
        modifyStoryOrSpikeCard(issueData);
        
      } else if (IssueType.BUG === issueType) {
        modifyBugCard(issueData);
      }
    }

  );

  
  console.log(`je: handleMutation: issueData.length: ${issues?.length}`);

}

const modifyEpicCard = ({issueCard, linkedIssues}) => {
  
  const linkedIssuesSummary = getIssuesSummary(linkedIssues);

  addEstimatesSummaryField(
    issueCard, 
    linkedIssuesSummary
  );

  addStoriesOrSpikesCompletedSummaryField(
    issueCard, 
    linkedIssuesSummary
  );

  addStoryPointsSummaryField(
    issueCard, 
    linkedIssuesSummary
  );

  addBugsSummaryField(
    issueCard, 
    linkedIssuesSummary
  );

  if(
    linkedIssuesSummary.totalNumberOfStoriesOrSpikes === 0 ||
    linkedIssuesSummary.numberOfStoriesOrSpikesWithEstimates != 
      linkedIssuesSummary.totalNumberOfStoriesOrSpikes
    ) {
    colorizeCard(issueCard, 'BurlyWood');
  } else {
    colorizeCard(issueCard, 'MediumTurquoise');
  }
 
}

const isStoryOrSpike = issue => {
  return [IssueType.STORY, IssueType.SPIKE].includes(getIssueType(issue));
}

const isBug = issue => {
  return getIssueType(issue) === `Bug`;
}

const addBugsSummaryField = (
  issueCard, 
  {
    numberOfBugsClosed,
    totalNumberOfBugs
  } 
) => {
  const content = `${numberOfBugsClosed} of ${totalNumberOfBugs} bugs closed`;
  addExtraField(issueCard, 
    'epicBugsSummary', 
    content,
    content);
}


const addEstimatesSummaryField = (
  issueCard, 
  {
    numberOfStoriesOrSpikesWithEstimates,
    totalNumberOfStoriesOrSpikes
  } 
) => {
  const content = 
    `${numberOfStoriesOrSpikesWithEstimates} of ${totalNumberOfStoriesOrSpikes} stories estimated`;
  addExtraField(issueCard, 
    'epicEstimatesSummary', 
    content,
    content);
}


const addStoryPointsSummaryField = (issueCard, {storyPointsCompleted, totalStoryPoints}) => {
  const content = `${storyPointsCompleted} of ${totalStoryPoints} points completed`;
  addExtraField(issueCard, 
    'epicStoryPointsSummary', 
    content,
    content);
}

const addStoriesOrSpikesCompletedSummaryField = (
  issueCard, 
  {
    numberOfStoriesOrSpikesCompleted, 
    totalNumberOfStoriesOrSpikes
  }
) => {
  const content = 
    `${numberOfStoriesOrSpikesCompleted} of ${totalNumberOfStoriesOrSpikes} stories  completed`;
  addExtraField(issueCard, 
    'epicStoriesCompletedSummary', 
    content,
    content);
}

const getStatus = issue => {
  return issue?.fields?.status?.name;
}

const isClosed = issue => {
  return getStatus(issue) === 'Closed';
}

const getIssuesSummary = issues => {

  const defaultIssuesSummary = {
     totalNumberOfStoriesOrSpikes: 0,
     numberOfStoriesOrSpikesWithEstimates:0,
     numberOfStoriesOrSpikesCompleted:0,
     totalStoryPoints:0,
     storyPointsCompleted:0,
     totalNumberOfBugs:0,
     numberOfBugsClosed:0
  };
 
  return issues?.reduce(
    (issuesSummary, issue) => {
      const storyPoints = getStoryPoints(issue);

      if(isStoryOrSpike(issue)) {
        issuesSummary.totalNumberOfStoriesOrSpikes++;

        if(storyPoints) {
          issuesSummary.totalStoryPoints += storyPoints;        
          issuesSummary.numberOfStoriesOrSpikesWithEstimates++;
        
          if(isClosed(issue)) {
            issuesSummary.numberOfStoriesOrSpikesCompleted++;
            issuesSummary.storyPointsCompleted += storyPoints;
          }
        }
      } else if (isBug(issue)) {
        issuesSummary.totalNumberOfBugs++;
        if(isClosed(issue)) {
          issuesSummary.numberOfBugsClosed++;
        }
      }

      return issuesSummary;
    },
    defaultIssuesSummary
  ) ?? defaultIssuesSummary;
 }



const getStoryPoints = issue => {
  return issue?.fields?.[STORY_POINTS_FIELD_ID]??0;
}



const applyBaseCardModifications = ({issueCard}) => {
  addDaysInColumnExtraField(
    getDaysInColumn(issueCard), issueCard
  );
}

const modifyStoryOrSpikeCard = ({issueCard, issue}) => {
  const storyPoints = getStoryPoints(issue);

  addOrModifyStoryPointsField( storyPoints, issueCard);

  if(!storyPoints) {
    colorizeCard(issueCard, 'Khaki');
  } else {
    colorizeCard(issueCard, 'PaleTurquoise');
  }
}

const modifyBugCard = ({issueCard}) => {
  colorizeCard(issueCard, 'LightPink');
}


const colorizeCard = (issueCard, color) => {
  issueCard.setAttribute("style", `background-color:${color};`);
}

const addExtraField = (issueCard, fieldId, content, tooltip) => {
  // If the extra field hasn't already been added
  if(!issueCard.querySelector(`span[id='${fieldId}']`)) {
    
    // Get the extra fields section
    const extraFieldsDiv = issueCard.querySelector("div[class='ghx-extra-fields']");

    if (extraFieldsDiv) {

      extraFieldsDiv.insertAdjacentHTML(
        'beforeend', 
        `<div class="ghx-extra-field-row">
          <span class="ghx-extra-field" id="${fieldId}" data-tooltip="${tooltip}">
            <span class="ghx-extra-field-content">${content}</span>
          </span>
        </div>` 
      );
    }
  }
}

const addOrModifyStoryPointsField = (storyPoints, issueCard) => {

  console.log(`je: addOrModifyStoryPointsField`);
  if(!issueCard.querySelector("span[id='labeledStoryPointsField']")) {
    const storyPointsSpan = issueCard.querySelector("span[data-tooltip*='Story Points:']");

    if(storyPointsSpan) {
      storyPointsSpan.textContent = `${storyPoints} story points`;
      storyPointsSpan.setAttribute("id", "labeledStoryPointsField");
      storyPointsSpan.setAttribute("data-tooltip", `${storyPoints} story points`);
    }
  }
}

const addDaysInColumnExtraField = (daysInColumn, issueCard) => {
  addExtraField(
    issueCard, 
    "daysInColumnField", 
    `${daysInColumn} days in column`,
    `${daysInColumn} days in column`
    );
}


const getMapOfIssueCardsThatNeedModification = issueCards => {
  const issueCardsThatNeedModificationMap = new Map();

  console.log(`je: getMapOfIssueCardsThatNeedModification: found ${issueCards.length} descendant cards. type: ${typeof issueCards}`); 

  
  issueCards?.forEach(
    issueCard => {
      if( !isIssueCardModifiedByExtension(issueCard)) {
        issueCardsThatNeedModificationMap.set(
          getIssueCardKey(issueCard),
          issueCard
        );
      }
    }
  );

  console.log(`je: getMapOfIssueCardsThatNeedModification: end`); 
  return issueCardsThatNeedModificationMap;
}

/**
 * Modifies all issues (if necessary) that are descendents of issueAncestorEl
 * 
 * @param {*} issueCardsAncestorEl 
 * @returns 
 */
/*
const updateIssueCards2 = async issueCardsAncestorEl => {
  const issueCards = getIssueCards(issueCardsAncestorEl);


  issueCards?.forEach(
    async issue => {
      if(!isIssueCardModifiedByExtension(issue)) {
        injectJiraExtensionReactContainer(issue);
        
        addDaysInColumnField(issue);
        addStoryPointsLabel(issue);    

        const issueType = getIssueType(issue);

        if(issueType === 'Epic') {
          handleEpic(issue);
        } else if(['Story', 'Spike'].includes(issueType)){
          const storyPoints = getStoryPoints(issue);
          console.log(`${storyPoints} points for issue ${getIssueKey(issue)}`);
          if(storyPoints >0 ) {
            markIssueAsReady(issue);
          } 
          else {
            markIssueNeedsAttention(issue);
          }
        } else if(['Bug'].includes(issueType)) {
          issue.setAttribute("style", "background-color:LightPink;" );
        }
      
        //console.log(`found ghx-pool issue ${getIssueKey(issue)} ${getIssueType(issue)}`);
        markIssueUpdated(issue);  
      } else {
        console.log(`Ignoring updated issue`);
      }
    }
  );
}
*/
const markIssueNeedsAttention = (issue) => {
  if(getIssueType(issue) === 'Epic') {
    issue.setAttribute("style", "background-color:BurlyWood;" );
  } else {
    issue.setAttribute("style", "background-color:Khaki;" );
  }
}

const markIssueAsReady = (issue) => {
  if(getIssueType(issue) === 'Epic') {
    issue.setAttribute("style", "background-color:MediumTurquoise;" );
  } else {
    issue.setAttribute("style", "background-color:PaleTurquoise;" );
  } 
}

const handleEpic = async epicIssue => {
  const issueKey = getIssueKey(epicIssue);
  console.log(`Handling Epic ${issueKey}`);

  const issuesLinkedToEpic = await getIssuesLinkedToEpic(
    {
      epicKey: issueKey,
      fields: ["key","issuetype", "status", "customfield_11901"]
    }
  );

  console.log(`Got ${issuesLinkedToEpic.length} issues for epic ${issueKey}`);
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

const getIssueCardKey = issueCard => {
  return issueCard?.getAttribute("data-issue-key");
}

/*
const getIssueType = issue => {
  const issueType = issue?.querySelector("span[class='ghx-type']")?.getAttribute("title");
  rseturn issueType;
}*/

const getStoryPoints2 = issue => {
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

/**
 * Returns all issue cards that are descendents of the the specified ancestor el
 * 
 * @param {*} issueCardsAncestorEl 
 * @returns 
 */
const getIssueCards = issueCardsAncestorEl => {
  return issueCardsAncestorEl.querySelectorAll("div[class*='js-detailview']");
}

/**
 * Observe mutations and update the board as necessary
 */
 const observer = new MutationObserver(
  mutations => {  
    mutations.map(
      mutation => {
        const id = mutation.target.getAttribute('id');
        const classAttr = mutation.target.getAttribute('class');
       
        if(
          id==='ghx-pool' ||
          classAttr?.includes('ghx-column')
        ) {
          handleMutation(mutation.target);
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