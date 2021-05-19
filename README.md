# Table of Contents



- [Overview](#overview)
- [Enhanced Functionality](#enhanced-functionality)
  * [Enhanced Kanban Board](#Enhanced-Kanban-Board)
    + [Pair Assignee Avatar](#Pair-Assignee-Avatar)
    + [Days in Column Field](#Days-in-Column-Field)
    + [Label for Story Points Custom Field](#Label-for-Story-Points-Custom-Field)
    + [Epic Summary Fields](#Epic-Summary-Fields)
      * Stories Estimated
      * Stories Completed
      * Points Completed
      * Bugs Completed
    + [Color Coding Cards](#Color-Coding-Cards)
- [Installation](#installation)
  


# Overview
This is a Chrome browser extension that enhances the functionality of Jira.

# Enhanced Functionality
## Enhanced Kanban Board
### Pair Assignee Avatar
Avatar for the user selected in the Pair Assignee field is displayed
### Days in Column Field
Adds a "days in column" field to issue cards on the Kanban board. No more just dots at the bottom of the card
### Label for Story Points Custom Field
Story Points custom fields is displayed with the "story points" label vs just a raw number. 

:warning: Story point custom field must be configured in Jira in the card layout for this feature. 

:warning: Display of story points for Epic issues themselves is turn off. Story points for an Epic are considered to the aggregate of all linked issues.

### Epic Summary Fields
This extension adds the following summary data to Epic cards
- Stories Estimated -- How many are stories linked to this Epic and how many of them are estimated (in Story Points)
- Stories Completed -- How many are stories linked to this Epic and how many of them are completed
- Points Completed -- The sum of *all* of story point estimates for stories linked to this Epic and the sum of points for all *completed* stories linked to this Epic
- Bugs Closed -- The total number of bugs linked to this Epic and the number of bugs closed

:warning: Story point aggregation leverages the Jira api and is currently hard coded to with an ID of '11901' for the Story Points custom field.

:warning: To find the Jira ID of a custom field, in Jira browse to Issues>Search for Issues and click in the search bar. You will see a list of fields. For customer fields they will display as 'Field Name - cf[<CUSTOM_FIELD_ID>]'

### Color Coding Cards

Issue cards are color coded in the following fashion
#### Needs Estimate
- Epics - BurlyWood
- Stories and Spikes - Khaki
#### Fully Estimated
- Epics - MediumTurquoise
- Stories and Spikes - PaleTurquoise
#### Bugs
All bugs are coded red
#### Other issues
Default Jira color

# Installation

1. Browse to https://github.com/toomanyedwards/base-react-chrome-extension

2. Press the green 'Code' button and select 'Download ZIP'. This will download the extension repo.
3. Unzip the file on your computer locally
4. In Chrome, browse to [chrome://extensions](chrome://extensions)
5. Turn on 'Developer Mode' by click the switch in the upper right
6. Press 'Load unpacked'
7. In the directory selection dialog, browse to where you unzipped the repo and select /jira-chrome-extension-master/build
8. The extension should now be installed and you will see enhanced functionality on your project's Kanban board

:warning: To turn off the extension and return to standard Jira functionality browse to [chrome://extensions](chrome://extensions) and turn off the extension by the clicking the button in the lower right of the "Jira Chrome Extension" settings.

# Development

This extension is based off Create React App (CRA). The project is ejected from CRA so that output file names remain the same and can be referenced by name in the manifest.json. Note: There may be a better way to this without ejecting from CRA. 

:warning: This project is *very* quick and dirty so the code is currently ugly and not optimized. Also, it isn't currently even using react.

## To Develop the Extension
1. Clone https://github.com/toomanyedwards/jira-chrome-extension
2. Run 
```console
yarn install
```
3. Run 
```console
yarn build
```
4. Install the extension in Chrome by following the extension [installation](#installation) instructions starting on step 5.




