
import './App.css'
import LandingPage from './pages/LandingPage'
import {Routes,BrowserRouter,Route} from 'react-router-dom'
import Home from './pages/Home'
import Form from './pages/Form'
function App() {
  

  return (
    <>
    <BrowserRouter>

       <Routes>
         <Route path='/' element={<LandingPage/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/form' element={<Form/>}/>
       </Routes>

    </BrowserRouter>
    </>
  )
}

export default App
