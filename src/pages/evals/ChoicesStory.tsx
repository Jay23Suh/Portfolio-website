import React from 'react';
import { EvalsNav, MoreEvals, evalTabs, useScrollTop } from '../../components/evals/common';
import { TfsStoryBody } from '../../components/evals/tfs';

/** /evals/choices: the Thinking, Fast and Slow choices eval, story view. */
const ChoicesStory: React.FC = () => {
  useScrollTop();
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} tabs={evalTabs('/evals/choices')} />
      <MoreEvals current="choices" view="story" className="-mt-6 mb-8" />
      <TfsStoryBody />
    </div>
  );
};

export default ChoicesStory;
