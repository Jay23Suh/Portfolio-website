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
          <h2 className="text-3xl text-white font-semibold mb-4">Empathize & Define</h2>
          <p className="text-lg text-white leading-relaxed mb-6">
            Our research included interviews and focus groups with staff members across the five Claremont Colleges and The Claremont Colleges Services (TCCS). We explored diverse perspectives from various roles, departments, and lengths of tenure. Key findings highlighted a lack of workplace culture, physical isolation in office spaces, and the need for stronger onboarding experiences to foster community and inclusivity.
          </p>
          <p className="text-lg text-white leading-relaxed mb-6">
            Staff members emphasized the value of pre-pandemic activities, such as staff luncheons and book clubs, which created a sense of belonging. Insights also pointed to the importance of first impressions, as onboarding often left recent hires feeling overlooked and disconnected. These findings underscored the need for better integration strategies to create meaningful connections and improve workplace satisfaction.
          </p>
        </section>


        {/* Solution Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Ideate</h2>
          <p className="text-lg text-white leading-relaxed mb-6">
            The proposed solution focuses on building connections and fostering a sense of belonging among staff. One initiative, the "Time Capsule Wardrobe," invites veteran staff to share mementos and stories from their time at the colleges. New hires explore this collection during onboarding to learn about the office's history and culture, paving the way for conversations and deeper connections.
          </p>
          <p className="text-lg text-white leading-relaxed mb-6">
            Additional ideas included a welcome committee for new hires, mentorship programs pairing experienced employees with recent ones, and community events like skill-sharing workshops and staff-led activities. These initiatives aim to bridge the gap between long-time employees and newcomers while fostering collaboration and mutual respect.
          </p>

        </section>


        {/* Outcome Section */}
        <section className="mb-16">
          <h2 className="text-3xl text-white font-semibold mb-4">Outcome</h2>
          <p className="text-lg text-white leading-relaxed mb-6">
            The Time Capsule Wardrobe was tested with staff members and peers to evaluate its impact on onboarding experiences. Participants appreciated the concept’s potential to foster conversations and shared memories, creating a welcoming environment for new hires. Feedback highlighted how it could encourage interaction between colleagues, making the workplace feel more inclusive.
          </p>
          <p className="text-lg text-white leading-relaxed">
            While the prototype received positive feedback, challenges such as implementation logistics and long-term maintenance were noted. Iterations included a digital database of office stories and mentorship programs to complement the wardrobe. Overall, the solution demonstrated promise as a sustainable initiative to enhance workplace culture and build community among staff.
          </p>
        </section>


        {/* Conclusion Section */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl text-white font-semibold mb-4">Conclusion</h2>
          <p className="text-lg text-white leading-relaxed">
            This project illustrates the value of fostering connection and belonging among staff members. Through initiatives like the Time Capsule Wardrobe and mentorship programs, we explored ways to create a more inclusive and engaging workplace culture. Future iterations could further refine these ideas, starting with a pilot program to gather initial stories and artifacts, building momentum for broader adoption across departments.
          </p>
        </section>

      </div>
      {/* Video Section */}
      <div className="mb-8">
        <h3 className="text-2xl text-white font-semibold mb-4">Project Video</h3>
        <video
          controls
          src="/HCD DP2Edit 5.mp4" // Path to the video file in the public folder
          className="w-full h-auto rounded-lg shadow-lg"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      {/* Embed PDF */}
      <h3 className="text-2xl text-white font-semibold mb-4">Project write-up</h3>
      <iframe
        src="/DP2 Project Summary.pdf" // Path to the PDF file in the public folder
        className="w-full h-[600px] border rounded-lg shadow-lg mb-8"
        title="Project Two Document"
      ></iframe>


      {/* Additional content about Project Two can go here */}
    </div>
  );
};

export default ProjectTwo;
