
import {getIssuesForKeys, getIssuesLinkedToEpics} from './jiraApiUtls'

/*
<div id="js-work-quickfilters" class="aui-expander-content ghx-quick-content" aria-expanded="true"><dt id="js-quickfilters-label" class="ghx-cursor-help" data-tooltip="Use Quick Filters to view a subset of issues. Add more in the board configuration." original-title="">Quick Filters:</dt>
	<dd><a role="button" href="#" class="js-quickfilter-button first ghx-active" title="buzz" data-filter-id="2227" style="background-color:khaki">Support Support</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="project = DOPE AND &quot;Epic Link&quot; = DOPE-312 OR parent in (&quot;DOPE-312&quot;)" data-filter-id="2224">Solr Replacement for Inspire</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="project = DOPE AND &quot;Epic Link&quot; = DOPE-316 OR parent in (&quot;DOPE-316&quot;)" data-filter-id="2223">Inspire on Postgres</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="project = DOPE AND &quot;Epic Link&quot; = DOPE-315 OR parent in (&quot;DOPE-315&quot;)" data-filter-id="2222">Inverse Transpose</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="status = &quot;Blocked&quot; or status = &quot;Blocked by Civitas&quot; or status = &quot;Blocked By Customer&quot; " data-filter-id="2182">Blocked</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Unassigned" data-filter-id="2158">Unasssigned</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Natu
" data-filter-id="2132">Natu</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Nick" data-filter-id="2131">Nick</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Indicates new issues that need to be vetted by the team" data-filter-id="2115">Needs review</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Recently Created Issues" data-filter-id="2064">Recently Created</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Chris B" data-filter-id="2059">Chris B</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Edward" data-filter-id="2058">Edward</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Chris Greenough" data-filter-id="2061">GreenO</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Greg Lamp" data-filter-id="2062">Greg</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Issues Assigned to Robert" data-filter-id="2063">Robert</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button   " title="Displays issues which are currently assigned to the current user" data-filter-id="1985">Only My Issues</a></dd>
	<dd><a role="button" href="#" class="js-quickfilter-button  last " title="Displays issues which have been updated in the last day" data-filter-id="1986">Recently Updated</a></dd>
	<dd class="ghx-quickfilter-trigger" style=""><a id="js-work-quickfilters-trigger" data-replace-text="… Show more" class="aui-expander-trigger" aria-controls="js-work-quickfilters">… Show fewer</a></dd>
</div>

*/

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


const isModifiedByExtension = (element) => {
  return element?.getAttribute('modified-by-extension')
}

const setModifiedByExtension = (element) => {
  element.setAttribute('modified-by-extension', 'true');
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
const handlePoolMutation = async issueCardsAncestorEl => {
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

  const style = 
    totalNumberOfStoriesOrSpikes === 0 || totalNumberOfStoriesOrSpikes != numberOfStoriesOrSpikesWithEstimates ?
    'background-color:yellow':'';

  addExtraField(issueCard, 
    'epicEstimatesSummary', 
    content,
    content,
    style);
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

const colorizeCard = (issueCard, color) => {
  issueCard.setAttribute("style", `background-color:${color};`);
}

const addExtraField = (issueCard, fieldId, content, tooltip, style='') => {
  // If the extra field hasn't already been added
  if(!issueCard.querySelector(`span[id='${fieldId}']`)) {
    
    // Get the extra fields section
    const extraFieldsDiv = issueCard.querySelector("div[class='ghx-extra-fields']");

    if (extraFieldsDiv) {

      extraFieldsDiv.insertAdjacentHTML(
        'beforeend', 
        `<div class="ghx-extra-field-row">
          <span class="ghx-extra-field" id="${fieldId}" data-tooltip="${tooltip}" style="${style}">
            <span class="ghx-extra-field-content">${content}</span>
          </span>
        </div>` 
      );
    }
  }
}

const addLabeledStoryPointsField = (issueCard, storyPoints) => {

  const style = storyPoints?'':`background-color:Yellow`;

  const content = `Story Points: ${storyPoints}`;
  addExtraField(
    issueCard, `labeledStoryPointsField`, content, content, style
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
      if( !isModifiedByExtension(issueCard)) {
        setModifiedByExtension(issueCard);
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


var styleRulesApplied = false;
const areStyleRulesApplied = () => styleRulesApplied;
const setStyleRulesApplied = () => styleRulesApplied = true;

const handleQuickFiltersMutation = quickAncestorEl => {
  const quickFiltersContainer = quickAncestorEl.querySelector(`div[id*='js-work-quickfilters']`);

  if(quickFiltersContainer && !isModifiedByExtension(quickFiltersContainer)) {
    setModifiedByExtension(quickFiltersContainer);

    const quickFilters = quickFiltersContainer.querySelectorAll("a[class*='js-quickfilter-button']");

    quickFilters?.forEach(
    
      quickFilter => {
        const title = quickFilter.getAttribute('title');

        if(title) {
          // Attempt to read the quick filter custom config from the quick filter "title" attibute
          // This is set via the quick filter "Description" field in the Jira UI
          const configInFilterDescription = JSON.parse(
            title
          );

          if(configInFilterDescription) {
            quickFilter.setAttribute('style', configInFilterDescription.style);
            quickFilter.setAttribute('title', configInFilterDescription.tooltip??'');
          }
        }
      }
    );
  }

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
        ) 
        {
          if(!areStyleRulesApplied()) {
            setStyleRulesApplied();

            applyStyleRules(pairAssigneeAvatarStyleRules);
            applyStyleRules(quickFilterButtonStyleRules);
          }

          handlePoolMutation(mutation.target);
        } else if (id===`gh`) {
          handleQuickFiltersMutation(mutation.target);
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


const applyStyleRules = (styleRules) => {
  const sheet = document.createElement('style')
  sheet.innerHTML = styleRules;
  document.body.appendChild(sheet);
}




const quickFilterButtonStyleRules =`
.ghx-controls-filters dd a.ghx-active {
  border: 2px solid darkgray;
  color: #3b73af;
  filter: drop-shadow(2px 4px 6px blue);
  background-color:white;
}

.ghx-controls-filters dd a.ghx-active:hover {
  background: white;
}
`;


const pairAssigneeAvatarStyleRules = `
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