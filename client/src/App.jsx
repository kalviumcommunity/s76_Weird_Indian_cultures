
import './App.css'
import LandingPage from './components/LandingPage'
import {Routes,BrowserRouter,Route} from 'react-router-dom'
import Home from './components/Home'
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
