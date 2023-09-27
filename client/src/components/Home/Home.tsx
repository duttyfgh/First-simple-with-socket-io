import { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Socket } from 'socket.io-client'
import cls from './Home.module.css'

interface IHomeProps {
    socket: Socket
}

const Home = ({ socket }: IHomeProps) => {
    const navigate = useNavigate()
    const [user, setUser] = useState<string>('')
    const [userNameLength, setUserNameLength] = useState<number>(0)
    const [maxLengthError, setMaxLengthError] = useState<boolean>(false)

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setUser(e.target.value)
        setUserNameLength(e.target.value.length)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (userNameLength >= 20) {
            setMaxLengthError(true)
        }
        else {
            localStorage.setItem('user', user)
            socket.emit('newUser', {
                username: user,
                socketID: socket.id
            })
            navigate('/chat')
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col items-center justify-evenly h-[200px]'>
            <p className='text-[30px] text-[#454545]'>Enter chat</p>
            <div className='flex flex-col  items-center'>
                <input
                    value={user}
                    onChange={onChangeHandler}
                    className={cls.enterChat}
                    placeholder='Enter your name'
                    maxLength={20}
                    required
                />
                <div className='w-[600px] flex justify-between'>
                    <span className='text-red-600'>{maxLengthError && 'Error. Maximum length is 20 characters.'}</span>
                    <span>{userNameLength}/20</span>
                </div>
                <button
                    className='mt-[20px] w-[200px] h-[40px] text-center
                     bg-[#216bbf] rounded text-white hover:bg-[#2063b0] transition-all cursor-pointer'
                >Come in</button>
            </div>
        </form>
    )
}

export default Home