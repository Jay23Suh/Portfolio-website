// src/pages/Contact.tsx
import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Contact Info</h2>
            <p className="text-lg text-white mb-6">Please reach out! I would love to chat! </p>

            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
                <img
                    src="/2026-Suh,Jayhyun.jpeg" // Update the path based on your actual image location
                    className="w-96 h-96 rounded-full shadow-lg object-cover"
                />
            </div>
            <div className="flex flex-col items-center space-y-4">
                <a
                    href="https://www.linkedin.com/in/jayhyunsuh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-bold hover:text-blue-700 text-xl"
                >
                    LinkedIn Profile
                </a>
                <a
                    href="mailto:jayyy.suh@gmail.com"
                    className="text-white font-bold hover:text-blue-700 text-xl"
                >
                    jayyy.suh@gmail.com
                </a>
            </div>
        </div>
    );
}

export default Contact;
