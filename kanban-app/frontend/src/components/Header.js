import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f0f0f0;
`;

const ViewToggle = styled.div`
  display: flex;
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? '#007bff' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#007bff'};
  border: 1px solid #007bff;
  cursor: pointer;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const SearchBar = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
`;

const Header = ({ view, setView, searchTerm, setSearchTerm }) => {
  return (
    <HeaderContainer>
      <ViewToggle>
        <ToggleButton
          active={view === 'board'}
          onClick={() => setView('board')}
        >
          Board View
        </ToggleButton>
        <ToggleButton
          active={view === 'list'}
          onClick={() => setView('list')}
        >
          List View
        </ToggleButton>
      </ViewToggle>
      <SearchBar
        type="text"
        placeholder="Search cards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </HeaderContainer>
  );
};

export default Header;
