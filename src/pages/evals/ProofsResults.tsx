import React from 'react';
import { EvalsNav, MoreEvals, evalTabs, useScrollTop } from '../../components/evals/common';
import { ProofsResultsSection } from '../../components/evals/proofs';

/** /evals/proofs/results: the proofs eval, results view. */
const ProofsResults: React.FC = () => {
  useScrollTop();
  return (
    <div className="container mx-auto px-4 py-12 text-[#001d36]">
      <EvalsNav statsDefault={false} tabs={evalTabs('/evals/proofs')} />
      <MoreEvals current="proofs" view="results" className="-mt-6 mb-8" />
      <ProofsResultsSection />
    </div>
  );
};

export default ProofsResults;
