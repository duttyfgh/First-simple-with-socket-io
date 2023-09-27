import { Socket } from 'socket.io-client'
import cls from './chat.module.css'
import exit from '../../../assets/exit.png'
import send from '../../../assets/send.png'
import { useNavigate } from 'react-router-dom'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'

interface IHomeProps {
  socket: Socket
}

interface IMessage {
  name: string
  text: string
  dispatchTime: string
  id: string
  socketID: string
}

interface IUsers {
  username: string,
  socketID: string
}

const Chat = ({ socket }: IHomeProps) => {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<IMessage[]>([])
  const [users, setUsers] = useState<IUsers[]>([])
  const [username, setUsername] = useState(localStorage.getItem('user'))
  const [status, setStatus] = useState<string>('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const formInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    socket.on('responseNewUser', (data) => {
      setUsers(data)
    })

  }, [users])

  useEffect(() => {
    socket.on('response', (data) => {
      setMessages([...messages, data])
    })

  }, [socket, messages])

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
    if (formInputRef.current) {
      formInputRef.current.focus();
    }
  }, [messages])

  useEffect(() => {
    socket.on('responseTyping', (data) => {
      setStatus(data)
      setTimeout(() => setStatus(''), 10000)
    })

  }, [socket])


  const getCurrentTime = (): string => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const leaveChat = () => {
    localStorage.removeItem('user')
    socket.emit('leaveUser', username)

    socket.on('updatedUsers', (data) => {

      setUsers(data)
    })

    navigate('/')
  }

  const onMessageChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (message !== '') {
      socket.emit('message', {
        name: username,
        text: message,
        dispatchTime: getCurrentTime(),
        id: `${socket.id}-${Math.random()}`,
        socketID: socket.id
      })
      setMessage('')
    }
  }

  const isTyping = () => {
    socket.emit('typing', `${username} is typing`);
  };

  return (
    <div className={cls.chat}>
      <div className={cls.sidebar}>
        <h4 className='text-[40px] font-bold border-b w-[100%] flex justify-center text-[#216bbf]'>Participants</h4>
        <ul className={cls.users}>
          {users.map(user => (
            <li key={user.socketID}>{user.username}</li>
          ))}
        </ul>
      </div>
      <div className={cls.chatBody}>
        <div className={cls.leaveInChat}>
          <button onClick={leaveChat}>
            Leave the chat
            <img src={exit} />
          </button>
        </div>

        <div className={cls.messages} ref={containerRef}>

          {messages?.map(message => {
            return message.name === localStorage.getItem('user')
              ? <div key={message.id} className={cls.sender}>
                <p className={cls.senderName}>You</p>
                <div>
                  <p>{message.text}</p>
                  <p className={cls.time}>{message.dispatchTime}</p>
                </div>
              </div>

              : <div key={message.id} className={cls.recipient}>
                <p className={cls.senderName}>{message.name}</p>
                <div>
                  <p>{message.text}</p>
                  <p className={cls.time}>{message.dispatchTime}</p>
                </div>
              </div>
          })}

        </div>

        <div>
          <p className='text-[#216bbf] w-[120px] italic text-center ml-[80px] rounded-[14px] p-[5px]'>
            {status}</p>
        </div>

        <div className={cls.senderFieldShell}>
          <form className={cls.senderField} onSubmit={handleSend}>
            <input
              className={cls.inputField}
              placeholder='Enter message'
              title='Enter your message'
              value={message}
              onChange={onMessageChangeHandler}
              onKeyDown={isTyping}
              // onKeyUp={() => socket.emit('typing', '')}
              ref={formInputRef}

            />
            <button>
              <img src={send} alt="Send" title='Send message' />
            </button>
          </form>
        </div>

      </div>

    </div>

  )
}

export default Chat