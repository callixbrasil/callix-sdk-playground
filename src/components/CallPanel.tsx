"use client";

import type {
  Call,
  CallData,
  CampaignContactField,
} from "@callixbrasil/client-sdk";
import { FieldType } from "@callixbrasil/client-sdk";
import {
  useCallOperatorAudioInputMuted,
  useCallOperatorAudioOutputMuted,
  useCallOperatorAudioOutputVolume,
  useCallOperatorCurrentCallControls,
  useCallOperatorCurrentCallInfo,
} from "@callixbrasil/client-sdk-react";
import { useEffect, useState } from "react";

import {
  HangupIcon,
  MicIcon,
  MicOffIcon,
  PauseIcon,
  PhoneIcon,
  PlayIcon,
  SpeakerIcon,
  SpeakerOffIcon,
} from "./icons";
import { useSdkConsole } from "@/lib/sdk-console";

type CallState =
  | "callRinging"
  | "manualCallSetup"
  | "manualCallRinging"
  | "callInProgress";

const TITLES: Record<CallState, string> = {
  callRinging: "Chamada recebida",
  manualCallSetup: "Preparando chamada",
  manualCallRinging: "Chamando",
  callInProgress: "Em chamada",
};

export function CallPanel({ state, call }: { state: CallState; call: Call }) {
  const isConnected = state === "callInProgress";
  const isIncoming = call.direction === "incoming";
  const isRinging = state === "callRinging" || state === "manualCallRinging";

  const callData = call.toCallData();
  const callInfo = useCallOperatorCurrentCallInfo();
  const contact =
    callInfo?.type === "campaign" ? callInfo.info.campaignContact : undefined;

  const peer = isIncoming
    ? (contact?.phoneNumber ?? "Identificando contato…")
    : callData.destinationNumber || "desconhecido";
  const displayName = isIncoming ? contact?.label : callData.peerDisplayName;

  return (
    <div className="panel overflow-hidden ring-1 ring-cx-teal/20">
      {/* faixa de status */}
      <div className="flex items-center gap-2.5 border-b border-cx-line bg-cx-teal/[0.07] px-5 py-2.5">
        <span
          className={`h-1.5 w-1.5 rounded-full bg-cx-teal ${isRinging ? "animate-blip" : ""}`}
        />
        <span className="text-xs font-medium text-cx-teal">
          {TITLES[state]}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-cx-dim">
          {isIncoming ? "entrante" : "saída"}
        </span>
      </div>

      <div className="p-6">
        {/* interlocutor + cronômetro */}
        <div className="flex flex-col items-center gap-4">
          <span className="relative grid h-16 w-16 place-items-center">
            {isRinging && (
              <span className="absolute inset-0 animate-ring rounded-full bg-cx-teal/50" />
            )}
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-cx-teal/10 ring-1 ring-cx-teal/30">
              <PhoneIcon className="h-6 w-6 text-cx-teal" />
            </span>
          </span>

          <div className="text-center">
            <p className="tnum font-mono text-2xl tracking-wide">{peer}</p>
            {displayName && (
              <p className="mt-1 text-sm text-cx-muted">{displayName}</p>
            )}
          </div>

          <CallTimer call={call} running={isConnected} />
        </div>

        {/* controles */}
        <div className="mt-7">
          <CallActions isConnected={isConnected} isIncoming={isIncoming} />
        </div>

        {isConnected && (
          <div className="mt-6 border-t border-cx-line pt-5">
            <AudioControls />
          </div>
        )}

        <div className="mt-6 grid gap-5 border-t border-cx-line pt-5 sm:grid-cols-2">
          <CallDetails data={callData} />
          <CallInfo />
        </div>
      </div>
    </div>
  );
}

function CallTimer({ call, running }: { call: Call; running: boolean }) {
  const [seconds, setSeconds] = useState(call.currentDurationSeconds);

  useEffect(() => {
    setSeconds(call.currentDurationSeconds);

    const timer = setInterval(
      () => setSeconds(call.currentDurationSeconds),
      1000,
    );

    return () => clearInterval(timer);
  }, [call]);

  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return (
    <p
      className={`tnum font-mono text-4xl tracking-tight ${running ? "text-cx-text" : "text-cx-dim/50"}`}
    >
      {mm}:{ss}
    </p>
  );
}

function CallActions({
  isConnected,
  isIncoming,
}: {
  isConnected: boolean;
  isIncoming: boolean;
}) {
  const { hangup, hold, unhold } = useCallOperatorCurrentCallControls();
  const { log } = useSdkConsole();

  const [onHold, setOnHold] = useState(false);

  async function toggleHold() {
    const next = !onHold;

    try {
      log("control", next ? "hold()" : "unhold()");
      await (next ? hold() : unhold());
      setOnHold(next);
    } catch (e) {
      log(
        "error",
        next ? "hold()" : "unhold()",
        e instanceof Error ? e.message : "falhou",
      );
    }
  }

  if (!isConnected) {
    // Chamada entrante é sempre de campanha: o próprio SDK busca o currentCallInfo e atende em seguida
    // (qualquer outra entrante ele rejeita). Não há o que o operador aceitar ou recusar aqui.
    if (isIncoming) {
      return (
        <p className="text-center text-xs text-cx-muted">
          Conectando chamada da campanha…
        </p>
      );
    }

    return (
      <div className="flex justify-center gap-4">
        <RoundButton
          label="Cancelar"
          tone="reject"
          icon={<HangupIcon className="h-6 w-6" />}
          onClick={() => {
            log("control", "hangup()");
            hangup();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4">
      <RoundButton
        label={onHold ? "Retomar" : "Espera"}
        tone={onHold ? "active" : "neutral"}
        icon={
          onHold ? (
            <PlayIcon className="h-5 w-5" />
          ) : (
            <PauseIcon className="h-5 w-5" />
          )
        }
        onClick={toggleHold}
      />
      <RoundButton
        label="Desligar"
        tone="reject"
        icon={<HangupIcon className="h-6 w-6" />}
        onClick={() => {
          log("control", "hangup()");
          hangup();
        }}
      />
    </div>
  );
}

const ROUND_TONES: Record<string, string> = {
  reject: "bg-rose-500 text-white hover:brightness-110",
  active: "bg-cx-teal text-cx-bg hover:brightness-110",
  neutral:
    "bg-cx-raised text-cx-muted ring-1 ring-cx-line2 hover:bg-cx-line hover:text-cx-text",
};

function RoundButton(props: {
  label: string;
  tone: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={props.onClick}
        aria-label={props.label}
        className={`grid h-14 w-14 place-items-center rounded-full transition-all active:scale-95 ${ROUND_TONES[props.tone]}`}
      >
        {props.icon}
      </button>
      <span className="text-[11px] text-cx-muted">{props.label}</span>
    </div>
  );
}

function AudioControls() {
  const [inputMuted, setInputMuted] = useCallOperatorAudioInputMuted();
  const [outputMuted, setOutputMuted] = useCallOperatorAudioOutputMuted();
  const [volume, setVolume] = useCallOperatorAudioOutputVolume();
  const { log } = useSdkConsole();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Toggle
        active={!inputMuted}
        onIcon={<MicIcon className="h-4 w-4" />}
        offIcon={<MicOffIcon className="h-4 w-4" />}
        label={inputMuted ? "Microfone mudo" : "Microfone"}
        onClick={() => {
          log("control", `setInputMuted(${!inputMuted})`);
          setInputMuted(!inputMuted);
        }}
      />

      <Toggle
        active={!outputMuted}
        onIcon={<SpeakerIcon className="h-4 w-4" />}
        offIcon={<SpeakerOffIcon className="h-4 w-4" />}
        label={outputMuted ? "Áudio mudo" : "Áudio"}
        onClick={() => {
          log("control", `setOutputMuted(${!outputMuted})`);
          setOutputMuted(!outputMuted);
        }}
      />

      <div className="ml-auto flex min-w-[180px] flex-1 items-center gap-3">
        <label htmlFor="volume" className="label whitespace-nowrap">
          Volume
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-cx-line accent-cx-teal"
        />
        <span className="tnum w-9 text-right font-mono text-xs text-cx-muted">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}

function Toggle(props: {
  active: boolean;
  label: string;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium ring-1 transition-all active:scale-[0.98] ${
        props.active
          ? "bg-cx-raised text-cx-text ring-cx-line2 hover:bg-cx-line"
          : "bg-rose-500/15 text-rose-300 ring-rose-400/25 hover:bg-rose-500/25"
      }`}
    >
      {props.active ? props.onIcon : props.offIcon}
      {props.label}
    </button>
  );
}

function CallDetails({ data }: { data: CallData }) {
  const rows: [string, string | undefined][] = [
    ["ID", data.id],
    ["UUID", data.callUuid],
    ["Protocolo", data.protocol?.toString()],
  ];

  return (
    <div>
      <p className="label mb-2.5">Dados da chamada</p>
      <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="text-xs text-cx-dim">{label}</dt>
            <dd className="truncate font-mono text-[11px] text-cx-muted">
              {value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CallInfo() {
  const callInfo = useCallOperatorCurrentCallInfo();

  if (!callInfo) {
    return (
      <div>
        <p className="label mb-2.5">Contexto</p>
        <p className="text-xs text-cx-dim">
          Sem contexto estruturado para esta chamada.
        </p>
      </div>
    );
  }

  if (callInfo.type === "manual") {
    return (
      <div>
        <p className="label mb-2.5">Contexto · manual</p>
        <p className="text-xs leading-relaxed text-cx-muted">
          {callInfo.info.successQualifications.length} qualificações de sucesso
          e {callInfo.info.discardQualifications.length} de descarte disponíveis
          no pós-atendimento.
        </p>
      </div>
    );
  }

  const { campaign, campaignList, campaignContact } = callInfo.info;

  return (
    <div>
      <p className="label mb-2.5">Contexto · campanha</p>
      <dl className="space-y-1.5 text-xs">
        <Row label="Campanha" value={`${campaign.name} · ${campaign.id}`} />
        <Row
          label="Lista"
          value={`${campaignList.name} · ${campaignList.id}`}
        />
        {campaignContact && (
          <Row label="Contato" value={campaignContact.label ?? "—"} />
        )}
        {campaignContact && (
          <Row label="Telefone" value={campaignContact.phoneNumber} />
        )}
      </dl>

      {campaignContact && campaignContact.fields.length > 0 && (
        <ContactFields fields={campaignContact.fields} />
      )}
    </div>
  );
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  [FieldType.Text]: "texto",
  [FieldType.Date]: "data",
  [FieldType.Number]: "número",
  [FieldType.Textarea]: "texto longo",
  [FieldType.Phone]: "telefone",
  [FieldType.CPF]: "CPF",
  [FieldType.CNPJ]: "CNPJ",
  [FieldType.Table]: "tabela",
  [FieldType.List]: "lista",
  [FieldType.DateTime]: "data e hora",
  [FieldType.Time]: "hora",
  [FieldType.Email]: "e-mail",
  [FieldType.Decimal]: "decimal",
  [FieldType.Company]: "empresa",
  [FieldType.MetaUserId]: "id de usuário",
  [FieldType.MetaDisplayName]: "nome de exibição",
};

// Os campos do contato chegam no campaignContact a partir do client-sdk 1.3.0.
// Antes só havia label e phoneNumber; agora a lista traz cada campo da campanha
// (ou do formulário de clientes) com tipo, valor e as flags requiredOnCall/label.
function ContactFields({ fields }: { fields: CampaignContactField[] }) {
  return (
    <div className="mt-4 border-t border-cx-line pt-3">
      <p className="label mb-2.5">Campos do contato</p>
      <dl className="space-y-2 text-xs">
        {fields.map((field) => (
          <div key={field.code} className="flex items-baseline justify-between gap-3">
            <dt className="flex min-w-0 items-center gap-1.5 text-cx-dim">
              <span className="truncate">{field.name}</span>
              <span className="shrink-0 rounded bg-cx-line/60 px-1 font-mono text-[9px] uppercase tracking-wide text-cx-dim">
                {FIELD_TYPE_LABELS[field.type]}
              </span>
              {field.label && (
                <span className="shrink-0 rounded bg-cx-line/60 px-1 font-mono text-[9px] uppercase tracking-wide text-cx-dim">
                  rótulo
                </span>
              )}
              {field.requiredOnCall && (
                <span className="shrink-0 rounded bg-cx-line/60 px-1 font-mono text-[9px] uppercase tracking-wide text-cx-dim">
                  obrigatório
                </span>
              )}
            </dt>
            <dd className="truncate text-right font-mono text-cx-muted">
              {field.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-cx-dim">{label}</dt>
      <dd className="truncate text-cx-muted">{value}</dd>
    </div>
  );
}
