import React from 'react';




const Contact: React.FC = () => {
    return (
        <div className="container mx-auto px-8 py-16">
            {/* Top Section: Intro and Image */}
            <div className="patrick-hand-sc flex flex-col md:flex-row items-center md:items-start space-y-12 md:space-y-0 md:space-x-16">
                {/* Left Section: Text Content */}
                <div className="md:w-1/2">
                    <h2 className="font-patrick text-5xl font-bold text-[#001d36] mb-6">Hello there!</h2>
                    <p className="text-lg text-[#001d36]e leading-relaxed mb-6">
                        I'm Jay! I'm originally from South Korea but grew up in a city called Santa Rosa, CA from 2011. Now, I'm a junior at Pomona College studying math and cognitive science, with a concentration in human-centered design.
                    </p>
                    <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                        I am curious about the dynamic world of entrepreneurship and its vibrant ecosystem. Throughout the process of the visionary dreams of startup founders, the wisdom and guidance of seasoned advisors and consultants, and the discerning judgment of venture capitalists who guard the threshold, I am captivated by the opportunity to apply human-centered design, embracing a people-centric perspective to drive meaningful innovation.
                    </p>
                    <p className="text-lg text-[#001d36] leading-relaxed">
                        Outside of "work", I love playing and watching soccer, listening to Coldplay, playing poker, and enjoying my time as a college student.
                    </p>
                    <p className="text-lg text-[#001d36] mt-6">
                        I'm always excited to meet someone new to learn from, so {' '}
                        <a href="mailto:jayyy.suh@gmail.com" className="text-[#001d36] underline hover:text-blue-800">I would love to chat!</a> {' '}
                        Also, you can learn a little more about me on my {' '}
                        <a href="https://www.linkedin.com/in/jayhyunsuh/" className="text-[#001d36] underline hover:text-blue-800">LinkedIn.</a>
                    </p>
                </div>

                {/* Right Section: Image */}
                <div className="md:w-1/2 flex justify-center">
                    <img
                        src="/2026-Suh,Jayhyun.jpeg"
                        alt="Jayhyun Suh"
                        className="rounded-lg shadow-lg object-cover w-full max-w-md"
                    />
                </div>
            </div>
        </div>
    );
};

{/*
            <div className="my-72"></div>


<div className="mt-16">
    <h3 className="text-3xl font-bold text-white mb-8 text-center">Gallery</h3>
    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <img
            src="/IMG_6557.JPG"
            alt="Gallery Image 3"
            className="w-84 h-72 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />

        <img
            src="/IMG_5825 2.JPG"
            alt="Gallery Image 2"
            className="w-96 h-64 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />
        <img
            src="/CES.png"
            alt="Gallery Image 4"
            className="w-64 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />    <img
            src="/P-ai.JPG"
            alt="Gallery Image 4"
            className="w-128 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />


        <img
            src="/sasoccer.png"
            alt="Gallery Image 4"
            className="w-64 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />

        <img
            src="/Fish.png"
            alt="Gallery Image 4"
            className="w-128 h-64 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />
        <img
            src="/Shanghai.png"
            alt="Gallery Image 4"
            className="w-128 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />
        <img
            src="/SASoccer.jpeg"
            alt="Gallery Image 4"
            className="w-128 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />
        <img
            src="/IMG_4279.JPG"
            alt="Gallery Image 1"
            className="w-72 h-72 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
        />
    </div>
</div>

*/}


export default Contact;
