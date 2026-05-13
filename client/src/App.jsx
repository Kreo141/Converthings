import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'

import Home from './assets/homePage/Home.jsx'
import FileConverter from './assets/fileConverter/FileConverter.jsx'

function AppContent(){
  const location = useLocation()
  const navigate = useNavigate()

  const isNavVisible = location.pathname != "/" 

  return (
    <>
        { isNavVisible &&
          <nav className='navigator'>
              <button className='return-button'  onClick={() => navigate(-1)}>
                <img className='return-button-img' src='https://cdn-icons-png.flaticon.com/512/109/109618.png' height="30px"/>
              </button>
          </nav>
        }
          
        <Routes>
          <Route path='/' element={ <Home /> } />
          <Route path='/FileConverter' element={ <FileConverter /> } />
        </Routes>
    </>
  )
}

function App() {
  return (
      <BrowserRouter>
        <AppContent/>
      </BrowserRouter>
  )
}

export default App
