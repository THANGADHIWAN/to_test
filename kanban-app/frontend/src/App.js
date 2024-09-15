import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BoardView from './components/BoardView';
import ListView from './components/ListView';
import { fetchCards } from './services/api';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

// ... (keep the LoadingMessage and ErrorMessage styled components)

function App() {
  const [view, setView] = useState('board');
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState('status');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true);
        const fetchedCards = await fetchCards();
        setCards(fetchedCards);
        setError(null);
      } catch (err) {
        setError('Failed to load cards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCards();
  }, []);

  const filteredCards = cards.filter(card =>
    (card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filters.priority || card.priority === filters.priority) &&
    (!filters.status || card.status === filters.status) &&
    (!filters.group || card.group === filters.group)
  );

  return (
    <AppContainer>
      <Header
        view={view}
        setView={setView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />
      <MainContent>
        <Sidebar filters={filters} setFilters={setFilters} />
        <ContentContainer>
          {isLoading ? (
            <LoadingMessage>Loading cards...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : view === 'board' ? (
            <BoardView cards={filteredCards} groupBy={groupBy} />
          ) : (
            <ListView cards={filteredCards} />
          )}
        </ContentContainer>
      </MainContent>
    </AppContainer>
  );
}

export default App;
