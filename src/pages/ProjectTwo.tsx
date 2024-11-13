// src/pages/ProjectTwo.tsx
import React from 'react';

const ProjectTwo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">

      <div className="container mx-auto px-6 py-12 max-w-screen-lg">
        {/* Title Section */}
        <section className="mb-12 text-center">
          <h1 className="text-5xl text-white font-bold mb-4">The Claremont College's Staff</h1>
          <p className="text-xl text-white">A case study exploring the "connected" work experience for cross-campus staff.</p>
        </section>

        {/* Overview Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Project Overview</h2>
          <p className="text-lg text-white leading-relaxed">

            This project aims to reimagine cross-campus connection and community for the staff of The Claremont Colleges, a unique consortium with seven distinct institutions within a single square mile. While faculty and students define the academic experience, the diverse staff—spanning roles from administration to facilities—are the backbone of daily operations. The pandemic introduced new hybrid work models, presenting both opportunities and challenges for staff connection and community. Pomona College’s Staff Council, along with similar groups across the colleges, seeks to foster a supportive and communicative environment for staff, advocating for their needs and facilitating cross-campus engagement in the post-pandemic landscape.
          </p>
        </section>

        {/* Problem Statement Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Problem Statement</h2>
          <p className="text-lg text-white leading-relaxed">
            How we might design for a
            healthy, connected, productive college working community. How might we connect staff members
            across The Claremont College Consortium to make their work life more rewarding?
          </p>
        </section>

        {/* Research Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Research</h2>
          <p className="text-lg text-white leading-relaxed mb-6">
            Extensive research was conducted through interviews, focus groups, and surveys with participants from various age groups. Key findings highlighted the need for accessible technology, shared spaces, and intergenerational activities.
          </p>
          <img src="/path-to-research-image.jpg" alt="Research findings" className="w-full h-auto rounded-lg shadow-lg mb-4" />
          <p className="text-sm text-white italic">Figure: Insights from user research and interviews</p>
        </section>

        {/* Solution Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Solution</h2>
          <p className="text-lg text-white leading-relaxed mb-6">
            The proposed solution involves creating a platform that enables interaction through shared activities, virtual events, and curated content accessible to all generations. Additionally, the platform provides guidance on using technology effectively, reducing barriers to engagement.
          </p>
          <img src="/path-to-solution-image.jpg" alt="Solution prototype" className="w-full h-auto rounded-lg shadow-lg mb-4" />
          <p className="text-sm text-white italic">Figure: Prototype of the connectivity platform</p>
        </section>

        {/* Outcome Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Outcome</h2>
          <p className="text-lg text-white leading-relaxed">
            The project was met with positive feedback, showing improved connections and communication between generations. Metrics indicated a 30% increase in engagement among older adults and a higher level of satisfaction with cross-generational interaction.
          </p>
          <img src="/path-to-outcome-image.jpg" alt="Outcome results" className="w-full h-auto rounded-lg shadow-lg mb-4" />
          <p className="text-sm text-white italic">Figure: User satisfaction and engagement results</p>
        </section>

        {/* Conclusion Section */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl text-whitefont-semibold mb-4">Conclusion</h2>
          <p className="text-lg text-white leading-relaxed">
            This project demonstrates the potential for design to bridge generational gaps, fostering empathy and connection. Future directions include expanding the platform’s reach and exploring additional interactive features.
          </p>
        </section>
      </div>
      {/* Video Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Project Video</h3>
        <video
          controls
          src="/HCD DP2Edit 5.mp4" // Path to the video file in the public folder
          className="w-full h-auto rounded-lg shadow-lg"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      {/* Embed PDF */}
      <iframe
        src="/DP2 Project Summary.pdf" // Path to the PDF file in the public folder
        className="w-full h-[600px] border rounded-lg shadow-lg mb-8" // Adjust height as needed
        title="Project Two Document"
      ></iframe>


      {/* Additional content about Project Two can go here */}
    </div>
  );
};

export default ProjectTwo;
