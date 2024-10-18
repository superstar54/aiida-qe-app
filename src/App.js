import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Wizard from './components/Wizard';
import AccordionWizard from './components/AccordionWizard';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container mt-5">
        <AccordionWizard />
      </div>
      <Footer />
    </div>
  );
}

export default App;
