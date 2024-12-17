import React from 'react';

const Sparkathon: React.FC = () => {
    return (
        <div className="container mx-auto px-8 py-16 text-center text-[#001d36]">
            <h1 className="text-5xl font-bold  mb-8">Sparkathon</h1>
            <div className="flex justify-center mt-8">
                <img
                    src="/DSC00861 (4).jpg" // Replace with actual image path
                    alt="everyone"
                    className="w-full h-3/4 object-cover rounded-lg shadow-lg"
                />
            </div>


            <div className="p-8 rounded-lg shadow-lg text-center">
                <p className="text-lg  leading-relaxed mb-4">
                    I, along with everyone at Pomona Ventures (the largest entrepreneurship club at the Claremont Colleges), have a commitment to encourage entrepreneurship, and Sparkathon is a perfect way to ignite the spark of innovation in individuals and communities, fostering an environment where ideas can flourish and impactful solutions can emerge.

                </p>
                <p className="text-lg text-[#001d36] leading-relaxed mb-4">
                    Sparkathon is an innovative, impact-driven design thinking competition challenges teams of 4 - 6 students to collaboratively
                    solve some of the most pressing societal problems. This year, we challenged students to ideate answers to "How can American universities effectively reduce waste? (e.g., time, energy, emotions, plastic, and other forms of waste)"
                </p>
                <p className="text-lg text-[#001d36] leading-relaxed mb-4">
                    What was particularly fascinating to see was all the different perspectives participants took with the definition of "waste". We saw solutions around the topic of e-waste, waste of time, waste of resources, and waste of first impressions.
                </p>
                <p className="text-lg text-[#001d36] leading-relaxed mb-4">
                    Organizing the event, I was fortunate to have incredible people around me who helped on the financing, logistics, and marketing intiatives. Together, we were able to plan one of the best Sparkathons ever, raisinig several thousands of dollars, including $2.25k for the winners of Sparkathon and having over 125 participants and 24 teams compete!
                </p>
            </div>

            {/* Gallery Section */}
            <div className="mt-16">
                <div className="lex justify-center mt-8 grid grid-cols-2  gap-6">
                    <img
                        src="/DSC00842 (1).jpg" // Replace with actual image path
                        alt="judges"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                    <img
                        src="/DSC00839.jpg" // Replace with actual image path
                        alt="pitch"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                    <img
                        src="/DSC00656.jpg" // Replace with actual image path
                        alt="me"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                    <img
                        src="/DSC00874.jpg" // Replace with actual image path
                        alt="me"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default Sparkathon;
