import React from 'react';
import { motion } from 'motion/react';
import { AnimatedText } from '../components/ui/animated-underline-text';
import { SoccerGame } from '../components/SoccerGame';


const Contact: React.FC = () => {
    return (
        <>
            <div className="container mx-auto px-8 py-16">
                {/* Top Section: Intro and Image */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-12 md:space-y-0 md:space-x-16">
                    {/* Left Section: Text Content */}
                    <div className="md:w-1/2">
                        <AnimatedText
                          text="Hello there!"
                          textClassName="text-[#001d36]"
                          underlineClassName="text-[#a855f7]"
                          className="mb-10"
                        />
                        <p className="text-lg font-beezee text-[#001d36] leading-relaxed mb-6">
                            I'm Jay! I'm originally from South Korea but grew up in a city called Santa Rosa, CA from 2011. Now, I'm a senior at Pomona College studying math and cognitive science, with a concentration in human-centered design.
                        </p>
                        <p className="text-lg font-beezee text-[#001d36] leading-relaxed mb-6">
                            I am curious about the world of entrepreneurship and its vibrant ecosystem. I am excited by the opportunity to apply human-centered design, embracing a people-centric perspective to drive meaningful innovation.
                        </p>
                        <p className="text-lg text-[#001d36] font-beezee leading-relaxed">
                            Outside of "work", I love playing and watching soccer, listening to Coldplay, playing poker, and enjoying my time as a college student.
                        </p>
                        <p className="text-lg text-[#001d36] font-beezee mt-6">
                            I'm always excited to meet someone new to learn from, so {' '}
                            <a href="mailto:jayyy.suh@gmail.com" className="text-[#001d36] underline hover:text-blue-800">I would love to chat!</a> {' '}
                            Also, you can learn a little more about me on my {' '}
                            <a href="https://www.linkedin.com/in/jayhyunsuh/" className="text-[#001d36] underline hover:text-blue-800">LinkedIn.</a>
                        </p>
                                         <motion.div
        className="w-full flex justify-center mt-8 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 12, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 1.2 },
          y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
        }}
      >
        <img src="/arrow-fat-down.svg" alt="Scroll down" className="w-20 h-20" />
      </motion.div>
                    </div>

                    {/* Right Section: Image */}
                    <div className="md:w-1/2 flex justify-center">
                        <img
                            src="/JayTVPhoto.jpg"
                            alt="Jayhyun Suh"
                            className="rounded-lg shadow-lg object-cover w-full max-w-md"
                        />
                    </div>
                </div>
            </div>

            


            {/* <div className="mt-16">
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
            </div> */}

            {/* ── Soccer mini-game ── */}
            <div className="container mx-auto px-8 mt-16 pb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-[#001d36]/15" />
                <span className="text-[11px] tracking-[0.55em] uppercase text-[#001d36]/40 font-beezee">kick around</span>
                <div className="flex-1 h-px bg-[#001d36]/15" />
              </div>
              <SoccerGame />
            </div>
        </>
    );
}


export default Contact;
