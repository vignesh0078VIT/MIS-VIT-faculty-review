import React from 'react';
import Header from '../components/Header';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-vick-light-gray min-h-screen flex flex-col">
       <Header />
        <main className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full text-center">
                <img
                    src="https://media.licdn.com/dms/image/D4E03AQGg8Cg8k2P2pA/profile-displayphoto-shrink_400_400/0/1715001255745?e=1726704000&v=beta&t=Ue5Hw3iI2d5Y_8Z2x4Jj5rY6fXk7b_8yI2o3Gk4z7pA"
                    alt="Vignesh Nagarajan"
                    className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-blue-500"
                />
                <h2 className="text-3xl font-bold text-vick-dark-gray mb-4">About the Creator</h2>
                <p className="text-lg text-vick-medium-gray mb-6">
                    Hey I am Vignesh 22MIS. I built the webapplication for MIS faculty review system.
                </p>
                <a
                    href="https://www.linkedin.com/in/vignesh-nagarajan-91a538262"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Connect on LinkedIn
                </a>
            </div>
        </main>
    </div>
  );
};

export default AboutPage;