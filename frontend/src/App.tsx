import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LandingPage from './pages/LandingPage';
import PRDashboardNew from './pages/PRDashboardNew';
import PRDetailView from './pages/PRDetailView';
import BitbucketLogin from './pages/BitbucketLogin';
import { BitbucketProvider } from './contexts/BitbucketContext';

function App() {
    return (
        <BitbucketProvider>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/app/bitbucket-login" element={<BitbucketLogin />} />
                    <Route path="/app" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="dashboard" element={<PRDashboardNew />} />
                        <Route path="pr/:repository/:prId" element={<PRDetailView />} />
                    </Route>
                </Routes>
            </div>
        </BitbucketProvider>
    );
}

export default App;
