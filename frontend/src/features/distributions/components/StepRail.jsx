import { Stepper } from '../../../components/ui';

const STEP_LABELS = ['Type', 'Token', 'Recipients', 'Review', 'Execute'];

export function StepRail({ currentIndex }) {
  return <Stepper steps={STEP_LABELS} current={currentIndex} />;
}
