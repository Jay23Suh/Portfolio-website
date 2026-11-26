import React from 'react';
import { EvalsNav, MoreEvals, evalTabs, useScrollTop } from '../../components/evals/common';
import { TfsResultsSection } from '../../components/evals/tfs';

/** /evals/choices/results: the Thinking, Fast and Slow choices eval, results view. */
const ChoicesResults: React.FC = () => {
  useScrollTop();
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} tabs={evalTabs('/evals/choices')} />
      <MoreEvals current="choices" view="results" className="-mt-6 mb-8" />
      <TfsResultsSection />
    </div>
  );
};

export default ChoicesResults;
