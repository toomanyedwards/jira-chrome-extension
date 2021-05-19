
import {getIssuesForKeys, getIssuesLinkedToEpics} from './jiraApiUtls'

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

const removeExtraField = (issueCard, fieldName) => {
  const fieldSpan = issueCard.querySelector(`span[data-tooltip*='${fieldName}:']`);
  const fieldDiv = fieldSpan?.parentNode;

  fieldDiv?.parentNode?.removeChild(fieldDiv);


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

      // console.log(`Issue data foo: ${JSON.stringify(issueData, null, 2)}`);
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


const addPairAssigneeAvatar = (issueCard, pairAssignee) => {

  if(!pairAssignee) {
    return;
  }

  const {displayName, avatarUrl} = pairAssignee;
  const avatarEl = issueCard.querySelector(`div[class='ghx-avatar']`);

  const text = `Pair Assignee: ${displayName}`;

  avatarEl?.parentNode?.insertAdjacentHTML(
    'beforeend', 
    `<div class="pair-assignee-avatar">
      <img src=${avatarUrl}
      class="ghx-avatar-img" alt="${text}" data-tooltip="${text}" original-title="">
    </div>` 
  );
}

const getPairAssignee = issue => {
  const pairAssigneeField = issue?.fields?.[PAIR_ASSIGNEE_FIELD_ID];

  if(pairAssigneeField) {
    return {
      avatarUrl: pairAssigneeField?.avatarUrls['48x48'],
      displayName: pairAssigneeField?.displayName
    };
  } else {
    return null;
  }
}


const applyBaseCardModifications = ({issueCard, issue}) => {
  
  addPairAssigneeAvatar(issueCard, getPairAssignee(issue));

  colorizeCardToJiraColor(issueCard); 

  removeExtraField(
    issueCard,
    'Story Points' 
  );

  removeExtraField(
    issueCard,
    'Pair Assignee' 
  );
  
  addDaysInColumnExtraField(
    getDaysInColumn(issueCard), issueCard
  );
}

const modifyStoryOrSpikeCard = ({issueCard, issue}) => {
  const storyPoints = getStoryPoints(issue);

  addLabeledStoryPointsField( issueCard, storyPoints);

  

}

const modifyBugCard = ({issueCard}) => {
  // No-op at the moment
}

/**
 * Colorize the entire card to the Jira card grabber color
 * @param {*} issueCard 
 */
const colorizeCardToJiraColor = issueCard => {
  const jiraCardColor = getGrabberColor(issueCard);

  if(jiraCardColor){
    colorizeCard(
      issueCard,
      jiraCardColor
    );
  }
}

const getGrabberColor = issueCard => {
  const grabberStyle = issueCard?.querySelector(`div[class='ghx-grabber']`)?.getAttribute('style');

  return grabberStyle?.replace('background-color:','')??null;
}

/*
  inst labeledStoryPoints = `${storyPoints} story points`;
  const content = storyPoints?labeledStoryPoints:`<b><i>${content}</i></b>`;
  const tooltip = storyPoints?content:'Needs Estimate';
  const style = storyPoints?'':'background-color:yellow';

    */

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

const addLabeledStoryPointsField = (issueCard, storyPoints) => {

  const content = `Story Points: ${storyPoints}`;
  addExtraField(
    issueCard, `labeledStoryPointsField`, content, content
  );
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
        setIssueCardModifiedByExtension(issueCard);
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

const getIssueCardKey = issueCard => {
  return issueCard?.getAttribute("data-issue-key");
}

const getDaysInColumn = issue => {
  const daysInColumn = 
    issue.querySelector("div[class='ghx-days']")?.
    getAttribute("title")?.
    replace(" days in this column","");

  return daysInColumn??"Unknown"
}


var pairAssigneeStyleApplied = false;

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
          if(!pairAssigneeStyleApplied) {
            
            applyPairAssigneeStyle();
            pairAssigneeStyleApplied= true;
          }

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


const applyPairAssigneeStyle = () => {
  const sheet = document.createElement('style')
  sheet.innerHTML = pairAssigneeAvatarStyle;
  document.body.appendChild(sheet);
}

const pairAssigneeAvatarStyle = `
.ghx-band-1 .ghx-issue .pair-assignee-avatar {
  right: auto;
  top: 65px;
}

.ghx-band-1 .ghx-issue .ghx-type, .ghx-band-1 .ghx-issue .ghx-flags, .ghx-band-1 .ghx-issue .pair-assignee-avatar {
  left: 8px;
}
.ghx-issue.ghx-has-avatar .pair-assignee-avatar {
  display: block;
}
.ghx-issue .pair-assignee-avatar{
  display: none;
  position: absolute;
  right: 10px;
  top: 50px;
}
.ghx-band-2 .ghx-issue .pair-assignee-avatar {
  right: 5px;
  top: 30px;
}
`;