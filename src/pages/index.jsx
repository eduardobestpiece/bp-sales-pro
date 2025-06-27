import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import CRM from "./CRM";

import Settings from "./Settings";

import Management from "./Management";

import Drive from "./Drive";

import Activities from "./Activities";

import Playbooks from "./Playbooks";

import Forms from "./Forms";

import Records from "./Records";

import Commissions from "./Commissions";

import ViewForm from "./ViewForm";

import Welcome from "./Welcome";

import ConfirmSignup from "./ConfirmSignup";

import SetPassword from "./SetPassword";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    CRM: CRM,
    
    Settings: Settings,
    
    Management: Management,
    
    Drive: Drive,
    
    Activities: Activities,
    
    Playbooks: Playbooks,
    
    Forms: Forms,
    
    Records: Records,
    
    Commissions: Commissions,
    
    ViewForm: ViewForm,
    
    Welcome: Welcome,
    
    ConfirmSignup: ConfirmSignup,
    
    SetPassword: SetPassword,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CRM" element={<CRM />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Management" element={<Management />} />
                
                <Route path="/Drive" element={<Drive />} />
                
                <Route path="/Activities" element={<Activities />} />
                
                <Route path="/Playbooks" element={<Playbooks />} />
                
                <Route path="/Forms" element={<Forms />} />
                
                <Route path="/Records" element={<Records />} />
                
                <Route path="/Commissions" element={<Commissions />} />
                
                <Route path="/ViewForm" element={<ViewForm />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/ConfirmSignup" element={<ConfirmSignup />} />
                
                <Route path="/SetPassword" element={<SetPassword />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}