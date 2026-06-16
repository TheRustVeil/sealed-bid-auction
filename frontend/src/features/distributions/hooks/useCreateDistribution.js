import { useReducer, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useZamaSDK } from '@zama-fhe/react-sdk';
import { keccak256, encodePacked, bytesToHex } from 'viem';
import { saveDistributionLocally } from '../api/distributions.api';
import { parseCsv } from '../utils/parseCsv';
import { validateRecipients } from '../utils/validateRecipients';
import { CONTRACT_ADDRESSES } from '../../../app/config';

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

// Inlined from compiled artifact — externalEuint64 is bytes32 in ABI encoding.
const DISPERSE_WRITE_ABI = [
  {
    name: 'createDistribution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'distributionId', type: 'bytes32' },
      { name: 'token',          type: 'address'  },
      { name: 'recipientCount', type: 'uint256'  },
    ],
    outputs: [],
  },
  {
    name: 'fundDistribution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'distributionId', type: 'bytes32' },
      { name: 'amount',         type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'executeDistribution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'distributionId',    type: 'bytes32'   },
      { name: 'recipients',        type: 'address[]' },
      { name: 'encryptedAmounts',  type: 'bytes32[]' },
      { name: 'inputProofs',       type: 'bytes[]'   },
    ],
    outputs: [],
  },
];

const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
];

export function useCreateDistribution() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const zamaSDK = useZamaSDK();
  const queryClient = useQueryClient();

  const next         = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const prev         = useCallback(() => dispatch({ type: 'PREV' }), []);
  const goTo         = useCallback((i) => dispatch({ type: 'GO_TO', payload: i }), []);
  const setType      = useCallback((v) => dispatch({ type: 'SET_TYPE', payload: v }), []);
  const setToken     = useCallback((v) => dispatch({ type: 'SET_TOKEN', payload: v }), []);
  const setLabel     = useCallback((v) => dispatch({ type: 'SET_LABEL', payload: v }), []);
  const setPrivacyMode = useCallback(
    (v) => dispatch({ type: 'SET_PRIVACY_MODE', payload: v }),
    []
  );
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

      const account        = walletClient.account.address;
      const disperseAddress = CONTRACT_ADDRESSES.confidentialDisperse;
      const token          = state.token;
      const recipients     = state.recipients.map((r) => r.address);
      const amounts        = state.recipients.map((r) => r.amount); // bigint[]
      const totalAmount    = amounts.reduce((a, b) => a + b, 0n);

      if (!disperseAddress) {
        throw new Error('VITE_DISPERSE_ADDRESS is not set — deploy the contract and update .env');
      }

      // Unique distribution ID: keccak256(operator || timestamp)
      const distributionId = keccak256(
        encodePacked(['address', 'uint256'], [account, BigInt(Date.now())])
      );

      // 1. Register the distribution on-chain
      const createHash = await walletClient.writeContract({
        address: disperseAddress,
        abi: DISPERSE_WRITE_ABI,
        functionName: 'createDistribution',
        args: [distributionId, token, BigInt(recipients.length)],
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash: createHash });

      // 2. Approve ConfidentialDisperse to pull tokens
      const approveHash = await walletClient.writeContract({
        address: token,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [disperseAddress, totalAmount],
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // 3. Transfer tokens into the contract
      const fundHash = await walletClient.writeContract({
        address: disperseAddress,
        abi: DISPERSE_WRITE_ABI,
        functionName: 'fundDistribution',
        args: [distributionId, totalAmount],
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash: fundHash });

      // 4. FHE-encrypt all amounts in one batch (single shared inputProof)
      const encryptor = zamaSDK.relayer;
      const { handles, inputProof } = await encryptor.encrypt({
        values: amounts.map((v) => ({ value: v, type: 'euint64' })),
        contractAddress: disperseAddress,
        userAddress: account,
      });
      const encryptedHandles = handles.map((h) => bytesToHex(h));
      const inputProofHex    = bytesToHex(inputProof);
      // One inputProof covers every handle in the batch — pass the same bytes for each slot
      const inputProofsArray = Array(recipients.length).fill(inputProofHex);

      // 5. Store encrypted allocations on-chain
      const executeHash = await walletClient.writeContract({
        address: disperseAddress,
        abi: DISPERSE_WRITE_ABI,
        functionName: 'executeDistribution',
        args: [distributionId, recipients, encryptedHandles, inputProofsArray],
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash: executeHash });

      saveDistributionLocally({
        id: distributionId,
        label: state.label || 'Distribution',
        token,
        recipientCount: recipients.length,
        type: state.type,
        privacyMode: state.privacyMode,
      });

      await queryClient.invalidateQueries({ queryKey: ['distributions'] });

      return { hash: executeHash, id: distributionId };
    },
  });

  return {
    state,
    steps:       STEPS,
    currentStep: STEPS[state.step],
    stepIndex:   state.step,
    isLastStep:  state.step === STEPS.length - 1,
    next,
    prev,
    goTo,
    setType,
    setToken,
    setLabel,
    setPrivacyMode,
    setRecipientsText,
    execute:      executeMutation.mutate,
    executeAsync: executeMutation.mutateAsync,
    isExecuting:  executeMutation.isPending,
    executeError: executeMutation.error,
    executeData:  executeMutation.data,
    reset:        () => dispatch({ type: 'RESET' }),
  };
}
