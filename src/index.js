const modifyDaysInColumnDisplay = () => {
  var nodeList = document.querySelectorAll("div[class*='ghx-days']");
  if(nodeList) {
    nodeList.forEach(
      daysInColumnDiv => {
        //console.log("ghx-days");
      }
    )
  }
}

/**
 * Find all Jira issue cards that are descendants 
 * @param {*} issuePool 
 * @returns NodeList of Jira issue cards
 */
const updatePoolIssues = issuePool => {
  const issuesInPool = getJiraIssues(issuePool);

  issuesInPool?.forEach(
    issue => {
      console.log(`found ghx-pool issue`);
      addDaysInColumnField(issue);
    }
  );
}

const getDaysInColumn= issue => {
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
        'afterbegin', 
        `<div class="ghx-extra-field-row"><span class="ghx-extra-field" id="daysInColumnField" data-tooltip="${daysInColumn} days in column"><span class="ghx-extra-field-content">${daysInColumn} days in column</span></span></div>` 
      );
    }
  }
}

const getJiraIssues = issuePool => {
  return issuePool.querySelectorAll("div[class*='ghx-issue']");
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
            console.log(`found ghx-pool`);
            updatePoolIssues(mutation.target);
            
            const issues = mutation.target.querySelectorAll("div[class*='ghx-issue']");

            if(issues && issues[0]) {
              console.log(`found ${issues.length} ghx-pool issue(s)!`)
          }
           }
           

           //modifyDaysInColumnDisplay();
            
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