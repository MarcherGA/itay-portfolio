import React from 'react';
import './App.css';

function Page() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Itay Levi</h1>
        <p>Software and Game Developer</p>
      </header>

      <section className="Content-section">
        <h2>About Me</h2>
        <p>Hello, I'm Itay Levi, a passionate software and game developer. I love creating innovative software solutions and engaging game experiences.</p>
      </section>

      <section className="Content-section">
        <h2>Contact Information</h2>
        <p>Email: <a href="mailto:Itayuriel1@gmail.com">Itayuriel1@gmail.com</a></p>
        <p>Phone: <a href="tel:+972532770404">+972 53-277-0404</a></p>
        <p>Instagram: <a href="https://www.instagram.com/Itay__Levi" target="_blank" rel="noopener noreferrer">Itay__Levi</a></p>
        <p>LinkedIn: <a href="https://www.linkedin.com/in/ItayUrielLevi" target="_blank" rel="noopener noreferrer">Itay Uriel Levi</a></p>
      </section>

      <footer className="App-footer">
        <p>&copy; 2023 Itay Levi. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Page;
