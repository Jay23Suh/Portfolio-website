import React from 'react';

const ProjectOne: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12">

            {/* Title Section */}
            <section className="mb-12 text-center max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-[#001d36]">Intergenerational Connectivity</h1>
                <p className="text-xl text-[#001d36]">A case study exploring the impact of connectivity on intergenerational communities.</p>
            </section>

            {/* Overview Section */}
            <section className="mb-16 max-w-4xl mx-auto">
                <h2 className="text-4xl font-semibold mb-4 text-[#001d36]">Project Overview</h2>
                <p className="text-lg text-[#001d36] leading-relaxed">
                    Claremont, known as a city of "Trees and PhDs," is home to a unique population that includes both college students and elder communities. Despite their physical proximity, these two groups rarely have opportunities for meaningful interaction. This project aims to bridge the age gap by designing a sustainable, human-centered program that connects college students with older residents in and around Claremont. Through this initiative, we fostered intergenerational relationships and improved a sense of community.
                </p>
            </section>

            {/* Layout Section */}
            <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
                {/* Left Content */}
                <div className="max-w-prose">
                    <h2 className="text-4xl font-semibold mb-4 text-[#001d36]">Problem Statement</h2>
                    <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                        How might we design a meaningful and sustainable program that bridges the age gap between college students and elder residents in Claremont, fostering intergenerational connections that benefit both groups?
                    </p>

                    <h2 className="text-4xl font-semibold mb-4 text-[#001d36]">Research</h2>
                    <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                        Our empathy work began with observations of family dynamics, where communication challenges were evident, especially in interactions across age groups. Through interviews and focus groups with Claremont College students and community members, we uncovered generational gaps in technology usage, language, and communication styles.
                    </p>
                    <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                        We ran into an extreme user: a college student with a neurodivergent younger sibling at home, who faced communication difficulties between the brother, the student, and their parents. Our user had challenges being a college student as they had so much pressure and responsibilities as being a communicator between parties at home.
                    </p>
                    <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                        By talking with our user, we gained insight into how disabilities could compound the already existing difficulties in communication and understanding within family dynamics. This realization not only shed light on the complexities of interpersonal relationships but also underscored the importance of empathy in bridging these divides.
                        Our conversations inspired to look at the intersection of technology and terminology in discussion of mental health, ability, and identity.
                    </p>
                </div>

                {/* Right Content (Images) */}
                <div className="flex flex-col space-y-8 ">
                    <img
                        src="/1Research.png"
                        className="w-full h-auto rounded-lg"
                    />
                    <img
                        src="/DP3Mural.png"
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </section>

            <div className="flex flex-col space-y-6">
                <img
                    src="/DP3MindMap.png"
                    className="w-full h-auto rounded-lg"
                />
            </div>

            {/* Ideate Section */}
            <section className="mb-16 max-w-4xl mx-auto">
                <h2 className="text-4xl font-semibold mb-4 text-[#001d36]">Ideate</h2>
                <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                    Before coming up with lists of ideas that could potentially help our user, we structured our thoughts into provoking questions:
                </p>

                {/* Bullet Points */}
                <ul className="list-disc list-inside space-y-2 text-lg text-[#001d36] leading-relaxed mb-6">
                    <li>How might we facilitate communication non-verbally to bridge generations?</li>
                    <li>How might we mitigate the role of an advocate while still keeping them involved in caregiving?</li>
                    <li>How might we work to center the user in our ideation rather than solely their parents and neurodivergent sibling?</li>
                    <li>How might we bridge the physical gap between college and home?</li>
                </ul>

                <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                    Using these as a framework, we further applied ideating strategies such as flipping assumptions, benefit baiting, and even generating ideas that seemed purposefully outlandish.
                </p>

                <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                    To bridge the generational and communication gaps, we designed innovative tools and activities aimed at fostering empathy and connection. One solution was an online platform where family members could create collaborative boards around shared interests, promoting engagement across physical and digital spaces. We also introduced neuro-inclusive games, encouraging participants to step out of their comfort zones and explore new ways of communicating non-verbally.
                </p>
                <p className="text-lg text-[#001d36] leading-relaxed mb-6">
                    One notable idea, the "Emotional Notification Light Check-In System," uses color signals (red, yellow, green) to quickly convey emotional states, enabling families to maintain emotional awareness without traditional conversation. When testing our prototypes with our original user, it proved highly effective in simplifying communication for neurodivergent individuals and their families. Furthermore, feedback from advisors and fellow students demonstrated its use cases beyond the original intended user.
                </p>
                <div className="flex flex-col space-y-6">
                    <img
                        src="/DP3Testing.png"
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </section>

            {/* Conclusion Section */}
            <section className="mb-16 text-center max-w-4xl mx-auto">
                <h2 className="text-4xl font-semibold mb-4 text-[#001d36]">Conclusion</h2>
                <p className="text-lg text-[#001d36] leading-relaxed">
                    This project illustrates the transformative power of human-centered design in bridging generational gaps and fostering empathy. By leveraging tools like neuro-inclusive games, emotional notification systems, and shared-interest platforms, we successfully addressed challenges in communication and understanding across diverse populations. Future steps include refining these solutions and collaborating with community partners like the Draper Center to scale their impact.
                </p>
            </section>
        </div>
    );
};

export default ProjectOne;
