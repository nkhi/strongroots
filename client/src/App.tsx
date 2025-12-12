import { useState } from 'react';
import './App.css';
import { HabitTracker } from './components/habits/HabitTracker';
import { Todos } from './components/today/Todos';
import { Diary } from './components/journal/Diary';
import { Next } from './components/grow/Next';
import { Lists } from './components/lists/Lists';
import { Memos } from './components/memos/Memos';
import { Navigation } from './components/shared/Navigation';

const API_BASE_URL = `http://${window.location.hostname}:3000`;

type TabType = 'habits' | 'todos' | 'logs' | 'memos' | 'next' | 'lists';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('habits');

  return (
    <div id="app">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiBaseUrl={API_BASE_URL}
      />
      <main id="habit-container" className={activeTab}>
        {activeTab === 'habits' && <HabitTracker apiBaseUrl={API_BASE_URL} />}
        {activeTab === 'todos' && <Todos apiBaseUrl={API_BASE_URL} />}
        {activeTab === 'memos' && <Memos />}
        {activeTab === 'logs' && <Diary apiBaseUrl={API_BASE_URL} />}
        {activeTab === 'next' && <Next apiBaseUrl={API_BASE_URL} />}
        {activeTab === 'lists' && <Lists apiBaseUrl={API_BASE_URL} />}
      </main>
    </div>
  );
}

export default App;
