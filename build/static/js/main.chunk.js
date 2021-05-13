(this["webpackJsonpjira-chrome-extension"]=this["webpackJsonpjira-chrome-extension"]||[]).push([[0],{6:function(t,e,o){"use strict";o.r(e);var n=o(0),i=o.n(n),r=o(1),s=o(2),a=o.n(s),l=function(){var t=Object(r.a)(i.a.mark((function t(e){var o,n,r,s,a,l;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return o=e.method,n=void 0===o?"POST":o,r=e.requestPath,s=void 0===r?"":r,a=e.body,"/rest/api/2",t.next=4,fetch("".concat("/rest/api/2","/").concat(s),{method:n,headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});case 4:return l=t.sent,t.next=7,null===l||void 0===l?void 0:l.json();case 7:return t.abrupt("return",t.sent);case 8:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),u=function(){var t=Object(r.a)(i.a.mark((function t(e){var o,n,r,s,u,c,d,f,p,v,b,m;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:o=e.jql,n=e.fields,r=void 0===n?[]:n,s=e.resultPropertyPath,u=void 0===s?"issues":s,c=e.maxResults,d=void 0===c?50:c,f=0,p=[],v=0;case 4:return t.next=6,l({requestPath:"search",body:{jql:o,fields:r,startAt:f,maxResults:d}});case 6:m=t.sent,v=null===m||void 0===m?void 0:m.total,p=p.concat(a.a.get(m,u,[])),console.log("Got ".concat(p.length," of ").concat(v," results for jql ").concat(o)),f=null===(b=p)||void 0===b?void 0:b.length;case 11:if(v>p.length){t.next=4;break}case 12:return t.abrupt("return",p);case 13:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),c=function(){var t=Object(r.a)(i.a.mark((function t(e){var o,n;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return o=e.epicKey,n=e.fields,t.next=3,u({jql:"'Epic Link'=".concat(o),fields:n});case 3:return t.abrupt("return",t.sent);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),d=function(t){return null===t||void 0===t?void 0:t.getAttribute("modified-by-extension")},f=function(t){console.log("Setting modifiedByExtension"),t.setAttribute("modified-by-extension","true")},p=function(){var t=Object(r.a)(i.a.mark((function t(e){var o;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:null===(o=k(e))||void 0===o||o.forEach((function(t){if(d(t))console.log("Ignoring updated issue");else{x(t),O(t);var e=g(t);if("Epic"===e)m(t);else if(["Story","Spike"].includes(e)){var o=h(t);console.log("".concat(o," points for issue ").concat(S(t))),o>0?b(t):v(t)}else["Bug"].includes(e)&&t.setAttribute("style","background-color:LightPink;");f(t)}}));case 2:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),v=function(t){"Epic"===g(t)?t.setAttribute("style","background-color:BurlyWood;"):t.setAttribute("style","background-color:Khaki;")},b=function(t){"Epic"===g(t)?t.setAttribute("style","background-color:MediumTurquoise;"):t.setAttribute("style","background-color:PaleTurquoise;")},m=function(){var t=Object(r.a)(i.a.mark((function t(e){var o,n,r,s,a,l;return i.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return s=S(e),console.log("Handling Epic ".concat(s)),t.next=4,c({epicKey:s,fields:["key","issuetype","status","customfield_11901"]});case 4:a=t.sent,console.log("Got ".concat(a.length," issues for epic ").concat(s)),l=null!==(o=null===a||void 0===a?void 0:a.reduce((function(t,e){var o,n,i,r,a=null===e||void 0===e||null===(o=e.fields)||void 0===o||null===(n=o.status)||void 0===n?void 0:n.name,l=null===e||void 0===e||null===(i=e.fields)||void 0===i?void 0:i.customfield_11901,u=null===e||void 0===e||null===(r=e.fields)||void 0===r?void 0:r.issuetype.name;return["Story","Spike"].includes(u)?(t.totalNumberOfStoriesOrSpikes++,t.totalStoryPoints+=l,"Closed"===a&&(t.numberOfClosedStoriesOrSpikes++,t.storyPointsCompleted+=l),l>0&&t.numberOfStoriesOrSpikesWithEstimates++):["Bug"].includes(u)&&(t.totalNumberOfBugs++,"Closed"===a&&t.numberOfBugsClosed++),console.log("Reducing issue ".concat(e.key," (").concat(a,") for epic ").concat(s)),t}),{totalNumberOfStoriesOrSpikes:0,numberOfStoriesOrSpikesWithEstimates:0,numberOfClosedStoriesOrSpikes:0,totalNumberOfBugs:0,numberOfBugsClosed:0,totalStoryPoints:0,storyPointsCompleted:0}))&&void 0!==o?o:{},y(e,"issuesEstimated","".concat(null===l||void 0===l?void 0:l.numberOfStoriesOrSpikesWithEstimates," of ").concat(null===l||void 0===l?void 0:l.totalNumberOfStoriesOrSpikes," stories estimated")),y(e,"storiesCompleted","".concat(null===l||void 0===l?void 0:l.numberOfClosedStoriesOrSpikes," of ").concat(null===l||void 0===l?void 0:l.totalNumberOfStoriesOrSpikes," stories completed")),y(e,"storyPointsCompleted","".concat(null===l||void 0===l?void 0:l.storyPointsCompleted," of ").concat(null===l||void 0===l?void 0:l.totalStoryPoints," points completed")),y(e,"bugsClosed","".concat(null===l||void 0===l?void 0:l.numberOfBugsClosed," of ").concat(null===l||void 0===l?void 0:l.totalNumberOfBugs," bugs closed")),null===e||void 0===e||null===(n=e.querySelector("span[id='labeledStoryPointsField']"))||void 0===n||null===(r=n.parentNode)||void 0===r||r.remove(),0===l.numberOfStoriesOrSpikesWithEstimates||l.totalNumberOfStoriesOrSpikes!=l.numberOfStoriesOrSpikesWithEstimates?v(e):l.numberOfStoriesOrSpikesWithEstimates>0&&l.totalNumberOfStoriesOrSpikes===l.numberOfStoriesOrSpikesWithEstimates&&b(e);case 13:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),y=function(t,e,o){if(!t.querySelector("span[id='".concat(e,"']"))){var n=t.querySelector("div[class='ghx-extra-fields']");n&&n.insertAdjacentHTML("beforeend",'<div class="ghx-extra-field-row"><span class="ghx-extra-field" id="'.concat(e,'" data-tooltip="').concat(o,'"><span class="ghx-extra-field-content">').concat(o,"</span></span></div>"))}},S=function(t){return null===t||void 0===t?void 0:t.getAttribute("data-issue-key")},g=function(t){var e;return null===t||void 0===t||null===(e=t.querySelector("span[class='ghx-type']"))||void 0===e?void 0:e.getAttribute("title")},h=function(t){var e,o,n,i=null===(e=t.querySelector("span[data-tooltip*='Story Points']"))||void 0===e||null===(o=e.getAttribute("data-tooltip"))||void 0===o?void 0:o.replace("Story Points: ","");return console.log("".concat(i," foo points for issue ").concat(S(t))),null!==(n=parseFloat(i))&&void 0!==n?n:0},O=function(t){if(!t.querySelector("span[id='labeledStoryPointsField']")){var e=t.querySelector("span[data-tooltip*='Story Points:']");if(e){var o=h(t);e.textContent="".concat(o," story points"),e.setAttribute("id","labeledStoryPointsField")}}},x=function(t){if(!t.querySelector("span[id='daysInColumnField']")){var e=t.querySelector("div[class='ghx-extra-fields']");if(e){var o=function(t){var e,o,n=null===(e=t.querySelector("div[class='ghx-days']"))||void 0===e||null===(o=e.getAttribute("title"))||void 0===o?void 0:o.replace(" days in this column","");return null!==n&&void 0!==n?n:"Unknown"}(t);e.insertAdjacentHTML("beforeend",'<div class="ghx-extra-field-row"><span class="ghx-extra-field" id="daysInColumnField" data-tooltip="'.concat(o,' days in column"><span class="ghx-extra-field-content">').concat(o," days in column</span></span></div>"))}}},k=function(t){return t.querySelectorAll("div[class*='js-detailview']")},q=new MutationObserver((function(t){t.forEach((function(t){var e=t.target.getAttribute("id"),o=t.target.getAttribute("class");("ghx-pool"===e||(null===o||void 0===o?void 0:o.includes("ghx-column")))&&p(t.target)}))})),P=document.querySelector("html");q.observe(P,{childList:!0,subtree:!0})}},[[6,1,2]]]);
//# sourceMappingURL=main.chunk.js.map