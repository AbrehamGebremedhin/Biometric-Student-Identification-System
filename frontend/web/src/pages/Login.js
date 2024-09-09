import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const setCookie = (name, value) => {
        document.cookie = `${name}=${value};path=/`;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const data = {
            "username": username,
            "password": password
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/token/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.status !== 200) {
                throw new Error('Login failed');
            }

            const result = await response.json();
            setCookie('token', result.access);
            navigate('/');
        } catch (error) {
            setErrorMessage('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            <h1 className="text-4xl font-bold text-white mb-8">Biometric Student Identification System</h1>
            <div className="bg-white shadow-lg rounded-lg px-24 pt-10 pb-24 mb-4 transform transition duration-500 hover:scale-105">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
                {errorMessage && (
                    <div className="mb-4 text-red-500 text-center">
                        {errorMessage}
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition duration-300 hover:scale-105"
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;