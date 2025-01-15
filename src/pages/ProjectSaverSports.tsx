import React from 'react';

const ProjectSaverSports: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12 text-[#001d36]">
            {/* Title Section */}
            <section className="mb-12 text-center">
                <h1 className="text-5xl font-bold mb-4 ">Saver Sports: Empowering Youth Through Sports</h1>

            </section>

            {/* Overview Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-4 text-[#001d36]">Project Overview</h2>
                <p className="text-lg font-beezee leading-relaxed">
                    Saver Sports is dedicated to ensuring that every aspiring athlete has access to the necessary equipment to participate in sports. By collecting and distributing cleats, balls, and jerseys, we aim to level the playing field for underprivileged youth worldwide.
                </p>
                <div className="my-16"></div>
                <div className="flex justify-center mt-8">
                    <img src="/DSC00855.JPG" alt="Kevin Kilroy" className="w-3/4 h-3/4 rounded-lg shadow-lg mb-4" />
                </div>
            </section>


            {/* Research Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-4 text-[#001d36]">Call to action</h2>
                <p className="text-lg font-beezee leading-relaxed mb-6">
                    On October 9, 2017, Northern California faced a devastating wildfire that destroyed thousands of homes. It was during this challenging time that Saver Sports was born.
                </p>
                <p className="text-lg font-beezee leading-relaxed mb-6">
                    I vividly remember fleeing from the unbearable heat, gazing out the car window at the once-vibrant green mountains now consumed by fiery orange flames and suffocating clouds of dark smoke. When I learned that my home had been reduced to ashes, I realized that not just my belongings, but also my memories and sense of stability and security, had been completely flipped.
                </p>
                <p className="text-lg font-beezee leading-relaxed mb-6">
                    In the days that followed, I was overwhelmed with condolences from friends, family, and teachers. But it was my soccer community that had the most profound impact. My club donated cleats, balls, jerseys, and shorts, and even organized practices as soon as the air cleared. A month later, I returned to play my first soccer game. It felt surreal to be back on the field after barely finding a place to sleep. After the game, the opposing team handed me a generous donation of equipment and a sizable check. I was stunned by their unexpected kindness, especially from a team I’d never played against. Their generosity wasn’t just material; it was a beacon of hope that pulled me out of darkness and helped me rediscover myself.
                </p>
                <p className="text-lg font-beezee leading-relaxed mb-6">
                    This incredible act of love and support from my soccer community reignited my passion—not only for the sport but also for becoming the best version of myself. It showed me the power of togetherness and inspired me to spread this sense of hope and belonging to others.
                </p>

                {/* Image Section */}
                <div className="flex justify-center mt-8">
                    <img src="/donation.png" alt="Yolk" className="w-3/4 h-3/4 rounded-lg shadow-lg" />
                </div>



            </section>

            {/* Solution Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-4 text-[#001d36]">Our work</h2>
                <p className="text-lg  leading-relaxed mb-6">
                    <p className="text-lg font-beezee leading-relaxed mb-6">
                        Since 2020, I’ve been gathering sports equipment to donate to underserved young athletes. I wanted to give these kids the chance to experience the camaraderie and life lessons that come from being part of a team. With the help of like-minded individuals, Saver Sports officially came to life in early 2021. What started as a response to personal loss has grown into something greater—proof of what a supportive community can achieve. </p>
                    <p className="text-lg font-beezee leading-relaxed mb-6">
                        Soccer and its community helped me rebuild my life during one of my darkest times. Saver Sports is an extension of that love and support, and it’s my way of giving back. My hope is to inspire these young athletes to foster a love for their own communities, so they too can create meaningful change in the lives of others. When a child receives a ball from us, I hope it serves as a reminder that they are seen, valued, and never alone.

                    </p>
                </p>
                <div className="flex justify-center mt-8">
                    <img src="/cleats3.jpeg" alt="Solution prototype" className="w-128 h-128 rounded-lg shadow-lg mb-4" />
                </div>
            </section>

            {/* Outcome Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-4 text-[#001d36]">Outcome</h2>
                <p className="text-lg font-beezee leading-relaxed">
                    Saver Sports has successfully provided sports equipment to 15 global communities in Kenya, Tanzania, Mexico, and locally in California, enabling young athletes to participate in sports activities. This initiative has not only equipped athletes but also strengthened community bonds and promoted the values of teamwork and perseverance.
                </p>
                <div className="my-16"></div>
                <img src="/camp.jpeg" alt="camps" className="w-full h-auto rounded-lg shadow-lg mb-4" />
            </section>

            {/* Conclusion Section */}
            <section className="mb-16 text-center">
                <h2 className="text-3xl font-semibold mb-4 text-[#001d36]">Conclusion</h2>
                <p className="text-lg font-beezee leading-relaxed">
                    Saver Sports exemplifies how community-driven initiatives can address disparities in sports participation. By providing essential equipment, they empower underprivileged youth to engage in sports, fostering inclusivity and personal growth.
                </p>
            </section>
            <div className="flex justify-center mt-8">
                <img src="/IMG_1511.jpeg" alt="first training" className="w-1/2 h-1/2 rounded-lg shadow-lg mb-4" />
                <img src="/IMG_0946.jpeg" alt="2015" className="w-1/2 h-1/2 rounded-lg shadow-lg mb-4" />
            </div>
        </div >
    );
};

export default ProjectSaverSports;
