import React, { useState } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);

  &:hover {
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
`;

const CardDetails = styled.div`
  display: ${props => props.expanded ? 'block' : 'none'};
  margin-top: 1rem;
`;

const CardImage = styled.img`
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  margin-top: 0.5rem;
  border-radius: 4px;
`;

const Tag = styled.span`
  background-color: ${props => props.color};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
`;

const Card = ({ card }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'var(--danger-color)';
      case 'medium': return 'var(--primary-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--secondary-color)';
    }
  };

  return (
    <CardContainer onClick={() => setExpanded(!expanded)}>
      <CardTitle>{card.title}</CardTitle>
      <div>
        <Tag color={getPriorityColor(card.priority)}>{card.priority}</Tag>
        <Tag color="var(--secondary-color)">{card.status}</Tag>
      </div>
      <CardDetails expanded={expanded}>
        <div>Group: {card.group}</div>
        <div>Due Date: {new Date(card.due_date).toLocaleDateString()}</div>
        <div>Assigned To: {card.assigned_to}</div>
        <div>Asset Name: {card.asset_name}</div>
        <div>Asset Number: {card.asset_number}</div>
        <div>Asset Model: {card.asset_model}</div>
        {card.asset_image && <CardImage src={card.asset_image} alt="Asset" />}
      </CardDetails>
    </CardContainer>
  );
};

export default Card;
