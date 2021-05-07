import React from 'react';
import styled, {css} from 'styled-components'


const SampleExtensionContent = ({className}) => {  
    return (
        <div class={className}>
            Sample Extension Content
        </div>
    )
}


const StyledSampleExtensionContent = styled(SampleExtensionContent)`
display: inline-block;
color: rgb(255, 255, 255);
background-color: rgb(14, 114, 237);
line-height: 36px;
font-family: "Google Sans", Roboto, Helvetica, Arial, sans-serif;
font-weight: 500;
font-size: 14px;
border-width: 0px;
border-style: initial;
border-color: initial;
border-image: initial;
padding: 0px 16px;
border-radius: 4px;
`;

export default StyledSampleExtensionContent;
