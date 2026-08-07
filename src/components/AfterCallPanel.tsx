'use client';

import type { CallInteractionResult } from '@callixbrasil/client-sdk';
import {
  useCallOperatorControls,
  useCallOperatorDiscardQualifications,
  useCallOperatorSuccessQualifications,
} from '@callixbrasil/client-sdk-react';
import { useState } from 'react';

import { useSdkConsole } from '@/lib/sdk-console';

export function AfterCallPanel() {
  const { finishAfterCall } = useCallOperatorControls();
  const successQualifications = useCallOperatorSuccessQualifications();
  const discardQualifications = useCallOperatorDiscardQualifications();
  const { log } = useSdkConsole();

  const [result, setResult] = useState<CallInteractionResult>('success');
  const [qualificationId, setQualificationId] = useState<number | null>(null);

  const qualifications = result === 'success' ? successQualifications : discardQualifications;

  function handleFinish() {
    if (qualificationId == null) return;

    log('control', `finishAfterCall({ result: "${result}", qualificationId: ${qualificationId} })`);
    finishAfterCall({ result, qualificationId });
  }

  return (
    <div className="panel p-5 ring-1 ring-violet-400/20">
      <div className="mb-1 flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        <p className="label text-violet-300/80">Pós-atendimento</p>
      </div>
      <p className="mb-5 text-sm text-cx-muted">
        O operador só volta a receber chamadas depois de qualificar a interação.
      </p>

      {/* segmentado sucesso / descarte */}
      <div className="inline-flex rounded-lg border border-cx-line bg-cx-raised p-1">
        <Segment
          label="Sucesso"
          active={result === 'success'}
          activeClass="bg-emerald-500/20 text-emerald-300"
          onClick={() => {
            setResult('success');
            setQualificationId(null);
          }}
        />
        <Segment
          label="Descarte"
          active={result === 'failure'}
          activeClass="bg-rose-500/20 text-rose-300"
          onClick={() => {
            setResult('failure');
            setQualificationId(null);
          }}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="qualification" className="label mb-1.5 block">
          Qualificação
        </label>
        <select
          id="qualification"
          value={qualificationId ?? ''}
          onChange={(e) => setQualificationId(e.target.value ? Number(e.target.value) : null)}
          className="h-10 w-full rounded-lg border border-cx-line bg-cx-raised px-3 text-sm transition-colors hover:border-cx-line2"
        >
          <option value="">— selecione —</option>
          {qualifications.map((qualification) => (
            <option key={qualification.id} value={qualification.id}>
              {qualification.name}
            </option>
          ))}
        </select>
        {qualifications.length === 0 && (
          <p className="mt-1.5 text-xs text-amber-300/80">Nenhuma qualificação disponível para este resultado.</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleFinish}
        disabled={qualificationId == null}
        className={`mt-5 h-10 w-full rounded-lg text-sm font-semibold transition-all ${
          qualificationId == null
            ? 'cursor-not-allowed bg-cx-raised/60 text-cx-dim/60 ring-1 ring-cx-line'
            : 'bg-violet-500 text-white hover:brightness-110 active:scale-[0.99]'
        }`}
      >
        Finalizar pós-atendimento
      </button>
    </div>
  );
}

function Segment(props: { label: string; active: boolean; activeClass: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.active ? undefined : props.onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
        props.active ? props.activeClass : 'text-cx-muted hover:text-cx-text'
      }`}
    >
      {props.label}
    </button>
  );
}
