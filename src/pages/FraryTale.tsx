import React from 'react';

const FraryTale: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 ">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-[#001d36] mb-4">Frary Tale Podcast</h1>
        <p className="text-3xl text-gray-700">Documenting entrepreneurial journeys from the Claremont Colleges</p>
      </div>

      {/* Introduction Section */}
      <div className="mb-6 font-beezee ">
        <p className="text-xl text-gray-800 mb-4">
          In my final semester as a senior at Pomona College, I have noticed I have been reflecting a lot about who I was four years ago.
        </p>
        <p className="text-xl text-gray-800 mb-4">
          I arrived at Pomona knowing embarrassingly little about the entrepreneurship world. Venture capital? B2B SaaS? All foreign concepts. I didn't even know which questions to ask, let alone where to find the answers.
        </p>
        <p className="text-xl text-gray-800 mb-4">
          What the Claremont Colleges gave me was the intention to be curious and to find genuine inspiration in the people around me. I've used that in every context of my life, but in the context of entrepreneurship, I learned so much with Pomona Ventures and California Crescent Fund/Crater Ventures.
        </p>
        <p className="text-xl text-gray-800 mb-4">
          I've watched the entrepreneurial energy shift over four years, even in our little town of Claremont. But there is still so much to do. We're still figuring out how to capture stories of unconventional paths, how to pass them down, how to make the inspiration easy to find for the next freshman who arrives knowing as little as I once did.
        </p>
      </div>

      {/* Podcast Purpose Section */}
      <div className="mb-6 font-beezee">
        <p className="text-xl text-gray-800 mb-4">
          That's why I'm starting these conversations with Claremont entrepreneurs. Called <i className="font-semibold text-[#001d36]">Frary Tale</i>.
        </p>
        <p className="text-xl text-gray-800 mb-4">
          Some are students balancing problem sets with pitch decks. Others are alumni who've been at it for years. All of them have stories worth sharing, about resilience, about failure, about what it takes to create something meaningful.
        </p>
      </div>

      {/* Inspirational Section */}
      <div className="mb-6 font-beezee">
        <p className="text-xl text-gray-800 mb-4">
          I want our Claremont students to see what's possible. I want our alumni community tuning in to see what young entrepreneurs are working on. And I want the broader world to understand that innovation happens here in our small consortium of colleges, among people who think deeply and build deliberately.
        </p>
        <p className="text-xl text-gray-800 mb-4">
          If even one freshman stumbles across these stories and thinks, "Maybe I could do that too," then I would be super happy.
        </p>
      </div>

      {/* Call to Action Section */}
      <div className="text-center mb-8">
        <p className="text-xl text-gray-800 mb-4">Listen on <strong className="text-[#001d36]">Spotify</strong> and <strong className="text-[#001d36]">YouTube</strong>:</p>
        <div className="flex justify-center gap-6">
          <a
            href="https://open.spotify.com/show/3A3qHPIlPfVMjbJSBOFon6"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition"
          >
            Listen on Spotify
          </a>
          <a
            href="https://www.youtube.com/playlist?list=PLY8e5R4O6Oq6rbszP1YGIkde1-60OWlX2"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition"
          >
            Listen on YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

export default FraryTale;
