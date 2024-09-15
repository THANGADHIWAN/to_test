import React from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';

const BoardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
`;

const Column = styled.div`
  background-color: var(--light-color);
  border-radius: 4px;
  width: 300px;
  min-width: 300px;
  padding: 1rem;
`;

const ColumnTitle = styled.h3`
  margin-bottom: 1rem;
`;

const BoardView = ({ cards, groupBy }) => {
  const groupCards = () => {
    const grouped = {};
    cards.forEach(card => {
      const key = card[groupBy];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(card);
    });
    return grouped;
  };

  const groupedCards = groupCards();

  const onDragEnd = (result) => {
    // Implement drag and drop logic here
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <BoardContainer>
        {Object.entries(groupedCards).map(([columnId, columnCards]) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <Column ref={provided.innerRef} {...provided.droppableProps}>
                <ColumnTitle>{columnId}</ColumnTitle>
                {columnCards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card card={card} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Column>
            )}
          </Droppable>
        ))}
      </BoardContainer>
    </DragDropContext>
  );
};

export default BoardView;
