import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  padding: 1rem;
  background-color: var(--light-color);
  border-right: 1px solid #e0e0e0;
`;

const FilterSection = styled.div`
  margin-bottom: 1rem;
`;

const FilterTitle = styled.h3`
  margin-bottom: 0.5rem;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
`;

const Sidebar = ({ filters, setFilters }) => {
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  return (
    <SidebarContainer>
      <FilterSection>
        <FilterTitle>Priority</FilterTitle>
        <FilterSelect
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </FilterSelect>
      </FilterSection>
      <FilterSection>
        <FilterTitle>Status</FilterTitle>
        <FilterSelect
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All</option>
          <option value="new">New</option>
          <option value="allocated">Allocated</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </FilterSelect>
      </FilterSection>
      <FilterSection>
        <FilterTitle>Group</FilterTitle>
        <FilterSelect
          value={filters.group || ''}
          onChange={(e) => handleFilterChange('group', e.target.value)}
        >
          <option value="">All</option>
          <option value="Team A">Team A</option>
          <option value="Team B">Team B</option>
          <option value="Team C">Team C</option>
        </FilterSelect>
      </FilterSection>
    </SidebarContainer>
  );
};

export default Sidebar;
