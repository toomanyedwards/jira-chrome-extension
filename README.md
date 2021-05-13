# Table of Contents



- [Overview](#overview)
  * [Sub-heading](#sub-heading)
    + [Sub-sub-heading](#sub-sub-heading)
- [Heading](#heading-1)
  * [Sub-heading](#sub-heading-1)
    + [Sub-sub-heading](#sub-sub-heading-1)
- [HeadingFoo](#foo)
  * [Sub-heading](#sub-heading-2)
    + [Sub-sub-heading](#sub-sub-heading-2)

# Overview
This is a Chrome browser extension that adds additional functionality to Jira.

# Added Functionality
## Enhanced Kanban Board
### Days in Column Field
Adds a "days in column" field to issue cards on the Kanban board. No more just dots at the bottom of the card
### Label for Story Points custom field
Story Points custom fields is displayed with the "story points" label vs just a raw number. 

:warning: Story point custom field must be configured in Jira in the card layout for this feature. 

### Epic Summary Fields
This extension adds the following summary data to Epic cards
- Stories Estimated -- How many are stories linked to this Epic and how many of them are estimated (in Story Points)
- Stories Completed -- How many are stories linked to this Epic and how many of them are completed
- Points Completed -- The sum of *all* of story point estimates for stories linked to this Epic and the sum of points for all *completed* stories linked to this Epic
- Bugs Closed -- The total number of bugs linked to this Epic and the number of bugs closed

### Color coding 

Issue cards are color coded in the following fashion
#### Needs Estimate
- ![#ff0000](https://via.placeholder.com/15/f03casdsas/000000?text=+)

