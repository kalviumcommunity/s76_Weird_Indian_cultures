
import './App.css'
import LandingPage from './pages/LandingPage'
import {Routes,BrowserRouter,Route} from 'react-router-dom'
import Home from './pages/Home'
function App() {
  

  return (
    <>
    <BrowserRouter>

       <Routes>
         <Route path='/' element={<LandingPage/>}/>
        <Route path='/home' element={<Home/>}/>
       </Routes>

    </BrowserRouter>
    </>
  )
}

export default App
