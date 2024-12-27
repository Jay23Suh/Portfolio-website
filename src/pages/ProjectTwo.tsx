// src/pages/ProjectTwo.tsx
import React from 'react';

const ProjectTwo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      {/* Title Section */}
      <section className="mb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">The Claremont College's Staff</h1>
        <p className="text-xl">
          A case study exploring the "connected" work experience for cross-campus staff.
        </p>
      </section>

      {/* Overview Section */}
      <section className="mb-12 max-w-4xl mx-auto">
        <h2 className="text-4xl font-semibold mb-2">Project Overview</h2>
        <p className="text-lg leading-relaxed">
          This project aims to reimagine cross-campus connection and community for the staff
          of The Claremont Colleges, a unique consortium with seven distinct institutions
          within a single square mile. While faculty and students define the academic
          experience, the diverse staff—spanning roles from administration to
          facilities—are the backbone of daily operations. The pandemic introduced new
          hybrid work models, presenting both opportunities and challenges for staff
          connection and community. Pomona College’s Staff Council, along with similar
          groups across the colleges, seeks to foster a supportive and communicative
          environment for staff, advocating for their needs and facilitating cross-campus
          engagement in the post-pandemic landscape.
        </p>
      </section>

      {/* Problem Statement Section */}
      <section className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-semibold mb-3">Problem Statement</h2>
        <p className="text-lg leading-relaxed">
          How might we design for a healthy, connected, and productive college working
          community? How might we connect staff members across The Claremont College
          Consortium to make their work life more rewarding?
        </p>
      </section>

      {/* Research Section (with optional images) */}
      <section className="mb-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column (text) */}
        <div className="max-w-prose">
          <h2 className="text-4xl font-semibold mb-4">Research</h2>
          <p className="text-lg leading-relaxed mb-6">
            Our research included interviews and focus groups with staff members across
            the five Claremont Colleges and The Claremont Colleges Services (TCCS). We
            explored diverse perspectives from various roles, departments, and lengths
            of tenure. Key findings highlighted a lack of workplace culture, physical
            isolation in office spaces, and the need for stronger onboarding experiences
            to foster community and inclusivity.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Staff members emphasized the value of pre-pandemic activities, such as staff
            luncheons and book clubs, which created a sense of belonging. Insights also
            pointed to the importance of first impressions, as onboarding often left
            recent hires feeling overlooked and disconnected. These findings underscored
            the need for better integration strategies to create meaningful connections
            and improve workplace satisfaction.
          </p>
        </div>

        {/* Right Column (image) */}
        <div className="flex flex-col space-y-6">
          <img
            src="/IMG_2270.jpeg"
            className=" h-auto rounded-lg"
          />
        </div>
        <div className="flex flex-col space-y-6">
          <img
            src="/IMG_2287.jpeg"
            className=" h-auto rounded-lg"
          />
        </div>

      </section>
      <div className="flex my-12">
        <img
          src="/IMG_7815.jpg"
          className=" h-auto rounded-lg"
        />
      </div>

      {/* Ideate / Solution Section */}
      <section className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-semibold mb-4">Ideate</h2>
        <p className="text-lg text-[#001d36] leading-relaxed mb-6">
          Before coming up with lists of ideas that could potentially help our user, we structured our thoughts into provoking questions:
        </p>

        {/* Bullet Points */}
        <ul className="list-disc list-inside space-y-2 text-lg text-[#001d36] leading-relaxed mb-6">
          <li>How might we prioritize “small” or “mundane” social interactions at work?          </li>
          <li>How might we maintain culture in the midst of workflows changing (like remote/hybrid work)?          </li>
          <li>How might we leverage insights from recent hires to improve onboarding experience?          </li>
          <li>How might we tailor onboarding experience to address individual needs?</li>
          <li>How might we ensure that these connections are sustainable?</li>
        </ul>
        <p className="text-lg leading-relaxed mb-6">
          The proposed solution focuses on building connections and fostering a sense
          of belonging among staff. One initiative, the "Time Capsule Wardrobe," invites
          veteran staff to share mementos and stories from their time at the colleges.
          New hires explore this collection during onboarding to learn about the office's
          history and culture, paving the way for conversations and deeper connections.
        </p>
        <div className="flex h-1/2 my-12">
          <img
            src="/DP2TimeCapsule.png"
            className=" h-auto rounded-lg"
          />
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-3">
            Another idea was a garden within and around the office. The core idea is to provide a fun, collaborative project that gets employees
            out of their usual work routines and allows them to nurture something tangible.
            Each department will have its own garden area where employees can work together,
            share knowledge, and take pride in watching their garden thrive over time.
          </p>

          <p className="text-lg leading-relaxed mb-3">
            To distribute responsibility and keep things fresh, there will be rotating
            garden leads. These employees will take turns overseeing the care and
            maintenance of their department's garden for a month before passing the
            lead role to someone else. This rotating system encourages involvement
            from everyone.
          </p>

          <p className="text-lg leading-relaxed mb-3">
            Furthermore, we plan to host semester harvest dinners where the fruits,
            vegetables, and herbs grown across the various departmental gardens are
            used to prepare meals. These communal dinners will celebrate the achievements
            of the gardening efforts while fostering connections between employees
            across different teams.
          </p>

          <p className="text-lg leading-relaxed mb-14">
            In essence, the departmental garden initiative provides a creative outlet,
            a sense of collective accomplishment, and community-building opportunities —
            all factors that can significantly boost employee morale, engagement, and
            overall workplace satisfaction and happiness.
          </p>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Additional ideas included a welcome committee for new hires, mentorship programs
          pairing experienced employees with recent ones, and community events like
          skill-sharing workshops and staff-led activities. These initiatives aim to
          bridge the gap between long-time employees and newcomers while fostering
          collaboration and mutual respect.
        </p>

        {/* Outcome Section */}
        <p className="text-lg leading-relaxed mb-6">
          The Time Capsule Wardrobe was tested with staff members and peers to evaluate
          its impact on onboarding experiences. Participants appreciated the concept’s
          potential to foster conversations and shared memories, creating a welcoming
          environment for new hires. Feedback highlighted how it could encourage interaction
          between colleagues, making the workplace feel more inclusive.
        </p>
        <p className="text-lg leading-relaxed">
          While the prototype received positive feedback, challenges such as implementation
          logistics and long-term maintenance were noted. Iterations included a digital
          database of office stories and mentorship programs to complement the wardrobe.
          Overall, the solution demonstrated promise as a sustainable initiative to enhance
          workplace culture and build community among staff.
        </p>
      </section>

      <div className="flex justify-center my-8">
        <div className="overflow-hidden rounded-lg " style={{ width: '560px', height: '315px' }}>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/RGcbxd3cHEM"
            title="Project 2 Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>




      {/* Conclusion Section */}
      <section className="mb-16 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-semibold mb-4">Conclusion</h2>
        <p className="text-lg leading-relaxed">
          This project illustrates the value of fostering connection and belonging among
          staff members. Through initiatives like the Time Capsule Wardrobe, office gardens, and mentorship
          programs, we explored ways to create a more inclusive and engaging workplace
          culture. Future iterations could further refine these ideas, starting with a
          pilot program to gather initial stories and artifacts, building momentum for
          broader adoption across departments.
        </p>
      </section>


    </div>
  );
};

export default ProjectTwo;
