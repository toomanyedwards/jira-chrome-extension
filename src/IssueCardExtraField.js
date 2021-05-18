import React from 'react';

const IssueCardExtraField = ({id, tooltip, content}) => {  
  return (
    <div class="ghx-extra-field-row">
      <span 
        class="ghx-extra-field" 
        id={id}
        data-tooltip={tooltip}
        >
        <span class="ghx-extra-field-content">
          {content}
        </span>
      </span>
    </div>
  )
}

  export default IssueCardExtraField