import React from 'react';
import { EvalsNav, MoreEvals, evalTabs, useScrollTop } from '../../components/evals/common';
import { GamblesResultsSection } from '../../components/evals/gambles';

/** /evals/gambles/results: the gambles eval, results view. */
const GamblesResults: React.FC = () => {
  useScrollTop();
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} tabs={evalTabs('/evals/gambles')} />
      <MoreEvals current="gambles" view="results" className="-mt-6 mb-8" />
      <GamblesResultsSection />
    </div>
  );
};

export default GamblesResults;
