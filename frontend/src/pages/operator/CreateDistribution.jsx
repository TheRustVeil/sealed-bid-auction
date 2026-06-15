import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { StepRail } from '../../features/distributions/components/StepRail';
import { StepType } from '../../features/distributions/components/steps/StepType';
import { StepToken } from '../../features/distributions/components/steps/StepToken';
import { StepRecipients } from '../../features/distributions/components/steps/StepRecipients';
import { StepReview } from '../../features/distributions/components/steps/StepReview';
import { StepExecute } from '../../features/distributions/components/steps/StepExecute';
import { useCreateDistribution } from '../../features/distributions/hooks/useCreateDistribution';

export function CreateDistribution() {
  const navigate = useNavigate();
  const wizard = useCreateDistribution();
  const { state, stepIndex, next, prev } = wizard;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar back={{ label: 'Operator', to: '/operator' }} />

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <StepRail currentIndex={stepIndex} />

        <div className="bg-panel border border-white/10 rounded-xl p-6">
          {stepIndex === 0 && (
            <StepType
              type={state.type}
              setType={wizard.setType}
              label={state.label}
              setLabel={wizard.setLabel}
              privacyMode={state.privacyMode}
              setPrivacyMode={wizard.setPrivacyMode}
              onNext={next}
            />
          )}
          {stepIndex === 1 && (
            <StepToken
              token={state.token}
              setToken={wizard.setToken}
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepIndex === 2 && (
            <StepRecipients
              recipientsText={state.recipientsText}
              setRecipientsText={wizard.setRecipientsText}
              recipients={state.recipients}
              parseErrors={state.parseErrors}
              onNext={next}
              onPrev={prev}
            />
          )}
          {stepIndex === 3 && (
            <StepReview state={state} onNext={next} onPrev={prev} />
          )}
          {stepIndex === 4 && (
            <StepExecute
              execute={wizard.execute}
              isExecuting={wizard.isExecuting}
              executeError={wizard.executeError}
              executeData={wizard.executeData}
              onReset={() => {
                wizard.reset();
                navigate('/operator');
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
