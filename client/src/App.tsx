import { Routes, Route } from 'react-router-dom'
import Home from './components/Home/Home'
import Chat from './components/Chat/Chat'
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const App = () => {
  return (
    <div className='h-screen flex items-center justify-center flex-col'>
      <Routes>
        <Route path='/' element={<Home socket={socket} />} />
        <Route path='/chat' element={<Chat socket={socket} />} />
      </Routes>
    </div>

  )
}

export default App

