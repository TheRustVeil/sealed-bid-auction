import { useReducer, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useZamaSDK } from '@zama-fhe/react-sdk';
import { createDisperseApi, saveDistributionLocally } from '../api/distributions.api';
import { parseCsv } from '../utils/parseCsv';
import { validateRecipients } from '../utils/validateRecipients';

export const STEPS = ['type', 'token', 'recipients', 'review', 'execute'];

const initialState = {
  step: 0,
  type: 'disperse',
  token: '',
  label: '',
  privacyMode: 'fully-confidential',
  recipientsText: '',
  recipients: [],
  parseErrors: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TYPE':
      return { ...state, type: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_LABEL':
      return { ...state, label: action.payload };
    case 'SET_PRIVACY_MODE':
      return { ...state, privacyMode: action.payload };
    case 'SET_RECIPIENTS_TEXT': {
      const { rows, errors: parseErrors } = parseCsv(action.payload);
      const { valid: recipients, errors: validateErrors } = validateRecipients(rows);
      return {
        ...state,
        recipientsText: action.payload,
        recipients,
        parseErrors: [...parseErrors, ...validateErrors],
      };
    }
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) };
    case 'PREV':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'GO_TO':
      return { ...state, step: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function useCreateDistribution() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const zamaSDK = useZamaSDK();
  const queryClient = useQueryClient();

  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const prev = useCallback(() => dispatch({ type: 'PREV' }), []);
  const goTo = useCallback((i) => dispatch({ type: 'GO_TO', payload: i }), []);
  const setType = useCallback((v) => dispatch({ type: 'SET_TYPE', payload: v }), []);
  const setToken = useCallback((v) => dispatch({ type: 'SET_TOKEN', payload: v }), []);
  const setLabel = useCallback((v) => dispatch({ type: 'SET_LABEL', payload: v }), []);
  const setPrivacyMode = useCallback((v) => dispatch({ type: 'SET_PRIVACY_MODE', payload: v }), []);
  const setRecipientsText = useCallback(
    (v) => dispatch({ type: 'SET_RECIPIENTS_TEXT', payload: v }),
    []
  );

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!walletClient) throw new Error('Wallet not connected');

      // Stub mode: simulate success without hitting real contracts
      if (import.meta.env.VITE_SKIP_ZAMA === 'true') {
        await new Promise((r) => setTimeout(r, 2500));
        const stubHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;
        saveDistributionLocally({
          id: stubHash,
          label: state.label || 'Distribution',
          token: state.token,
          recipientCount: state.recipients.length,
          type: state.type,
          privacyMode: state.privacyMode,
        });
        await queryClient.invalidateQueries({ queryKey: ['distributions'] });
        return { hash: stubHash, id: stubHash };
      }

      const client = createDisperseApi({
        publicClient,
        walletClient,
        encryptor: () => zamaSDK.relayer,
      });

      const account = walletClient.account.address;

      // Register wallet pair if first disperse on this token
      const isRegistered = await client.isRegistered(account);
      if (!isRegistered) {
        await client.register({ token: state.token });
      }

      // Preflight checks all 5 failure modes
      const addresses = state.recipients.map((r) => r.address);
      const amounts = state.recipients.map((r) => r.amount);
      const report = await client.preflightDisperse({
        user: account,
        token: state.token,
        recipients: addresses,
        amounts,
        mode: 'wallet',
      });
      if (!report.ready) throw report.blockerErrors[0];

      // Encrypt + disperse in one call
      const { hash } = await client.disperse({
        token: state.token,
        mode: 'wallet',
        recipients: addresses,
        amounts,
      });

      // Persist locally so Dashboard can list it
      saveDistributionLocally({
        id: hash,
        label: state.label || 'Distribution',
        token: state.token,
        recipientCount: state.recipients.length,
        type: state.type,
        privacyMode: state.privacyMode,
      });

      await queryClient.invalidateQueries({ queryKey: ['distributions'] });

      return { hash, id: hash };
    },
  });

  return {
    state,
    steps: STEPS,
    currentStep: STEPS[state.step],
    stepIndex: state.step,
    isLastStep: state.step === STEPS.length - 1,
    next,
    prev,
    goTo,
    setType,
    setToken,
    setLabel,
    setPrivacyMode,
    setRecipientsText,
    execute: executeMutation.mutate,
    executeAsync: executeMutation.mutateAsync,
    isExecuting: executeMutation.isPending,
    executeError: executeMutation.error,
    executeData: executeMutation.data,
    reset: () => dispatch({ type: 'RESET' }),
  };
}
