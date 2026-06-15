import { useState } from 'react';
import { useInView } from '../../../hooks/useInView';

const FAQS = [
  {
    q: 'How does TFHE encryption keep bids private?',
    a: "Fully Homomorphic Encryption (TFHE) lets the Ethereum smart contract perform arithmetic on encrypted values without ever decrypting them. Your bid is encrypted in your browser using the Zama SDK before submission. The contract processes only ciphertext, and the FHE co-processor decrypts the final settlement inside the EVM — never exposing plaintext to operators or other participants.",
  },
  {
    q: 'Can the operator see individual bid amounts?',
    a: "No. The operator deploys the contract and sets the token parameters, but they never receive cleartext bids. All encrypted submissions go directly to the smart contract. Even if the operator monitors the blockchain, they only see TFHE ciphertext. Settlement amounts are revealed only to the individual recipients via client-side decryption.",
  },
  {
    q: 'What blockchain networks are supported?',
    a: "ConfidentialDrop currently runs on Ethereum Sepolia testnet, which supports the Zama TFHE co-processor needed for homomorphic decryption. Mainnet and L2 support (Arbitrum, Optimism) is on the roadmap pending Zama network expansion.",
  },
  {
    q: 'How are gas costs handled?',
    a: "The operator pays gas for contract deployment and settlement execution. Recipients pay no gas — token transfers are handled by the ConfidentialDisperse contract in a single batched transaction, making it significantly cheaper than individual transfers. Typical settlement costs $2–8 for 500 recipients on Sepolia.",
  },
  {
    q: 'Is the smart contract audited?',
    a: "The contracts are pre-production and unaudited at this stage. They are built on Zama's audited TFHE library. A formal audit by a reputable firm is planned before mainnet deployment. We recommend using the protocol on Sepolia testnet only during this phase.",
  },
  {
    q: 'What happens if a recipient loses access to their wallet?',
    a: "Allocations are bound to the wallet address submitted in the recipient list. If a recipient loses access to their wallet, they lose access to their allocation — the same as any on-chain asset. We recommend operators verify wallet addresses before finalizing the recipient list. There is no admin recovery mechanism by design.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-white/80 font-medium text-[15px] group-hover:text-white transition-colors">
          {q}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/60 group-hover:border-white/20 transition-all"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all"
        style={{
          maxHeight: open ? '300px' : '0px',
          opacity: open ? 1 : 0,
          transition: 'max-height 0.28s ease, opacity 0.2s ease',
        }}
      >
        <p className="text-white/40 text-sm leading-relaxed pb-5">{a}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [ref, inView] = useInView(0.08);

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-xs text-violet-400 uppercase tracking-[0.2em] font-semibold mb-3">FAQ</p>
          <h2 className="text-4xl font-bold text-white mb-4">Questions & answers</h2>
          <p className="text-white/35 text-[15px]">Everything you need to know before deploying your first auction.</p>
        </div>

        {/* Accordion */}
        <div
          ref={ref}
          className="rounded-2xl border border-white/[0.07] bg-panel/50 backdrop-blur-sm px-6 divide-y divide-white/[0.06] transition-all duration-700"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {FAQS.map((item) => (
            <FAQItem key={item.q} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
