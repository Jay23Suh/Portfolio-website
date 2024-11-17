import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="container mx-auto px-8 py-16">
            {/* Top Section: Intro and Image */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-12 md:space-y-0 md:space-x-16">
                {/* Left Section: Text Content */}
                <div className="md:w-1/2">
                    <h2 className="text-5xl font-bold text-white mb-6">Hello there!</h2>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        I'm Jay! I'm originally from South Korea but grew up in a city called Santa Rosa, CA from 2011. Now, I'm a junior at Pomona College studying math and cognitive science, with a concentration in human-centered design.
                    </p>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        I am curious about the dynamic world of entrepreneurship and its vibrant ecosystem. Throughout the process of the visionary dreams of startup founders, the wisdom and guidance of seasoned advisors and consultants, and the discerning judgment of venture capitalists who guard the threshold, I am captivated by the opportunity to apply human-centered design, embracing a people-centric perspective to drive meaningful innovation.
                    </p>
                    <p className="text-lg text-white leading-relaxed">
                        Outside of "work", I love playing and watching soccer, listening to Coldplay, playing poker, and enjoying my time as a young person.
                    </p>
                    <p className="text-lg text-white mt-6">
                        I'm always excited to meet someone new to learn from! {' '}
                        <a href="mailto:jayyy.suh@gmail.com" className="text-white underline hover:text-blue-800">Let's chat!</a> {' '}
                        Also, you can learn a little more about me on my {' '}
                        <a href="https://www.linkedin.com/in/jayhyunsuh/" className="text-white underline hover:text-blue-800">LinkedIn.</a>
                    </p>
                </div>

                {/* Right Section: Image */}
                <div className="md:w-1/2 flex justify-center">
                    <img
                        src="/2026-Suh,Jayhyun.jpeg" // Update this path based on your actual image location
                        alt="Jayhyun Suh"
                        className="rounded-lg shadow-lg object-cover w-full max-w-md"
                    />
                </div>
            </div>

            <div className="my-72"></div>

            {/* New Gallery Section */}
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
                        className="w-72 h-64 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
                    />
                    <img
                        src="/CES.png"
                        alt="Gallery Image 4"
                        className="w-64 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
                    />
                    <img
                        src="/IMG_4279.JPG"
                        alt="Gallery Image 1"
                        className="w-72 h-72 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
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
                        src="/SASoccer.jpeg"
                        alt="Gallery Image 4"
                        className="w-128 h-96 object-cover rounded-lg shadow-lg mx-auto" // Smaller width and height
                    />
                </div>
            </div>

        </div>
    );
};

export default Contact;
