import React from 'react';
import styled from 'styled-components';
import Card from './Card';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const ListView = ({ cards }) => {
  return (
    <ListContainer>
      {cards.map(card => (
        <Card key={card.id} card={card} />
      ))}
    </ListContainer>
  );
};

export default ListView;
