import React from 'react';
import { EvalsNav, MoreEvals, evalTabs, useScrollTop } from '../../components/evals/common';
import { ProofsStoryBody } from '../../components/evals/proofs';

/** /evals/proofs: the proofs eval, story view. */
const ProofsStory: React.FC = () => {
  useScrollTop();
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} tabs={evalTabs('/evals/proofs')} />
      <MoreEvals current="proofs" view="story" className="-mt-6 mb-8" />
      <ProofsStoryBody />
    </div>
  );
};

export default ProofsStory;
