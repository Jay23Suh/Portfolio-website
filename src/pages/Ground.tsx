import React from 'react';
import FadeIn from '../components/FadeIn';

const Ground: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">

      <FadeIn>
        <section className="mb-12 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Ground</h1>
          <p className="text-2xl text-gray-700">An accessible, light-hearted way to ground ourselves in the present.</p>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex justify-center mb-16">
          <img src="/GroundHome.png" alt="Ground" className="w-full max-w-2xl h-auto rounded-lg shadow-lg" />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-4">The Problem</h2>
          <p className="text-lg font-beezee leading-relaxed mb-4">
            Life moves fast, and in the middle of it all, being present is one of the hardest things to do. We know we should check in with ourselves, feel our emotions, maybe journal. But life gets in the way, and suddenly weeks go by without a single moment of real reflection.
          </p>
          <p className="text-lg font-beezee leading-relaxed">
            Journaling is great in theory. In practice, it asks a lot. Opening an app, staring at a blank page, finding the words. Most of us just don't.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-4">Our Approach</h2>
          <p className="text-lg font-beezee leading-relaxed mb-4">
            We're not here to take your phone away or block your favorite sites. We know technology is part of life, and we're not fighting that. What we do want is to give you a small moment, every once in a while, to check in with yourself.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <p className="text-lg font-beezee leading-relaxed mb-4">
            After a few hours of activity, Ground surfaces a single prompt for you to answer. Just one question, chosen for you, waiting when you're ready.
          </p>
            <div className="flex flex-col items-center mb-4">
              <img src="/GroundNow.png" alt="Ground Now screen" className="w-full h-auto rounded-xl shadow-md" />
              <p className="text-sm font-beezee text-gray-500 mt-3">Ground Now</p>
            </div>

          <p className="text-lg font-beezee leading-relaxed mb-4">
            Simple metrics help you see your patterns over time: how often you check in, how many words you write, and a timeline of your entries. Nothing overwhelming, just a light reflection of how you've been showing up for yourself.
          </p>

            <div className="flex flex-col items-center">
              <img src="/GroundStats.png" alt="Ground Stats screen" className="w-full h-auto rounded-xl shadow-md" />
              <p className="text-sm font-beezee text-gray-500 mt-3">Stats</p>
            </div>

        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mb-16 max-w-3xl mx-auto text-center">
          <a
            href="https://groundnow.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#001d36] text-white text-lg font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors duration-300 mb-6"
          >
            Try Ground
          </a>
          <p className="text-base font-beezee text-gray-600">
            Want the full experience? Download the app.{' '}
            <a
              href="mailto:jayyy.suh@gmail.com"
              className="text-[#001d36] font-semibold underline hover:text-indigo-600 transition-colors"
            >
              Get in touch.
            </a>
          </p>
        </section>
      </FadeIn>

    </div>
  );
};

export default Ground;
