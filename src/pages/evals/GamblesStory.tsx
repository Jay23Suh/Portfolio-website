import React from 'react';
import { EvalsNav, MoreEvals, evalTabs, useScrollTop } from '../../components/evals/common';
import { GamblesStoryBody } from '../../components/evals/gambles';

/** /evals/gambles: the gambles eval, story view. */
const GamblesStory: React.FC = () => {
  useScrollTop();
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} tabs={evalTabs('/evals/gambles')} />
      <MoreEvals current="gambles" view="story" className="-mt-6 mb-8" />
      <GamblesStoryBody />
    </div>
  );
};

export default GamblesStory;
