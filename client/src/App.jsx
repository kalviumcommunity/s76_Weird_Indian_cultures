
import './App.css'
import LandingPage from './pages/LandingPage'
import {Routes,BrowserRouter,Route} from 'react-router-dom'
import Home from './pages/Home'
import Form from './pages/Form'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
function App() {
  

  return (
    <>
    <BrowserRouter>

       <Routes>
         <Route path='/' element={<LandingPage/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/form' element={<Form/>}/>
        <Route path='/form/:id' element={<Form/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/login' element={<Login/>}/>
      
       </Routes>

    </BrowserRouter>
    </>
  )
}

export default App
