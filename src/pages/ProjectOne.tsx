// src/pages/ProjectOne.tsx
import React from 'react';

const ProjectOne: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12">

            <div className="container mx-auto px-6 py-12 max-w-screen-lg">
                {/* Title Section */}
                <section className="mb-12 text-center">
                    <h1 className="text-5xl font-bold mb-4 text-white">Intergenerational Connectivity</h1>
                    <p className="text-xl text-white">A case study exploring the impact of connectivity on intergenerational communities.</p>
                </section>

                {/* Overview Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-4 text-white">Project Overview</h2>
                    <p className="text-lg text-white leading-relaxed">
                        Claremont, known as a city of "Trees and PhDs," is home to a unique population that includes both college students and elder communities. Despite their physical proximity, these two groups rarely have opportunities for meaningful interaction. This project aims to bridge the age gap by designing a sustainable, human-centered program that connects college students with older residents in and around Claremont. Through this initiative, we hope to foster intergenerational relationships that provide mutual benefits, such as improved well-being, shared learning, and a sense of community.
                    </p>
                </section>

                {/* Problem Statement Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-4 text-white">Problem Statement</h2>
                    <p className="text-lg text-white leading-relaxed">
                        How might we design a meaningful and sustainable program that bridges the age gap between college students and elder residents in Claremont, fostering intergenerational connections that benefit both groups?
                    </p>
                </section>

                {/* Research Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-4 text-white">Empathize & Define</h2>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        Our empathy work began with observations of family dynamics, where communication challenges were evident, especially in interactions across age groups. Through interviews and focus groups with Claremont College students and community members, we uncovered generational gaps in technology usage, language, and communication styles. </p>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        We ran into an extreme user: a college student with a neurodivergent younger sibliing at home, who faced communication difficulties between the brother, the student, and their parents. Our user had challenges being a college student as they had so much pressure and responsibilities as being a communicator between parties at home.
                    </p>

                    <img src="/1Research.png" alt="Solution prototype" className="w-full h-auto rounded-lg shadow-lg mb-4" />

                </section>


                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-4 text-white">Ideate</h2>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        To bridge the generational and communication gaps, we designed innovative tools and activities aimed at fostering empathy and connection. One solution was an online platform where family members could create collaborative boards around shared interests, promoting engagement across physical and digital spaces. We also introduced neuro-inclusive games, encouraging participants to step out of their comfort zones and explore new ways of communicating non-verbally.
                    </p>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        One notable idea, the "Emotional Notification Light Check-In System," uses color signals (red, yellow, green) to quickly convey emotional states, enabling families to maintain emotional awareness without traditional conversation. This system proved highly effective in simplifying communication for neurodivergent individuals and their families.
                    </p>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-semibold mb-4 text-white">Outcome</h2>
                    <p className="text-lg text-white leading-relaxed mb-6">
                        The implementation of these solutions demonstrated promising results. The Emotional Notification Light Check-In System improved family communication, simplifying the expression of emotions in complex dynamics. PowerPoint nights and shared special-interest activities fostered empathy and understanding among participants, creating stronger intergenerational bonds.
                    </p>
                    <p className="text-lg text-white leading-relaxed">
                        Feedback from participants showed an improvement in communication satisfaction, especially among our original neurodivergent user. Our tests also revealed that shared experiences, such as collaborative games, were pivotal in breaking down barriers across generations. These results highlight the potential of these tools and activities to create meaningful and lasting connections.
                    </p>
                    <img src="/DP3Team.png" alt="Outcome results" className="w-full h-auto rounded-lg shadow-lg mb-4" />
                </section>


                <section className="mb-16 text-center">
                    <h2 className="text-3xl font-semibold mb-4 text-white">Conclusion</h2>
                    <p className="text-lg text-white leading-relaxed">
                        This project illustrates the transformative power of human-centered design in bridging generational gaps and fostering empathy. By leveraging tools like neuro-inclusive games, emotional notification systems, and shared-interest platforms, we successfully addressed challenges in communication and understanding across diverse populations. Future steps include refining these solutions and collaborating with community partners like the Draper Center to scale their impact.
                    </p>
                </section>

            </div>
            <h3 className="text-2xl text-white font-semibold mb-4">Project write-up</h3>
            {/* Embed PDF */}
            <embed
                src="/Navigating Family Connections through Distance and Neurodiversity.pdf" // Path to the PDF file in the public folder
                className="w-full h-[600px] border rounded-lg shadow-lg" // Adjust width and height as needed
                title="Project One Document"
            ></embed>

            {/* Additional content about Project One can go here */}
        </div>
    );
};

export default ProjectOne;
