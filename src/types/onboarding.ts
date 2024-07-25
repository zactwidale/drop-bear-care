export enum OnboardingStage {
  EmailVerification = 0,
  MembershipType = 1,
  PersonalDetails = 2,
  Bio = 3,
  Photos = 5,
  Availability = 4,
  Complete = 6,
}
export const OnboardingStageNames: { [key in OnboardingStage]: string } = {
  [OnboardingStage.EmailVerification]: 'Email Verification',
  [OnboardingStage.MembershipType]: 'Membership Type',
  [OnboardingStage.PersonalDetails]: 'Personal Details',
  [OnboardingStage.Bio]: 'Bio',
  [OnboardingStage.Photos]: 'Photos',
  [OnboardingStage.Availability]: 'Availability',
  [OnboardingStage.Complete]: 'Complete',
};

export function getNextOnboardingStage(
  currentState: OnboardingStage
): OnboardingStage | null {
  const nextStateValue = currentState + 1;
  return nextStateValue in OnboardingStage
    ? (nextStateValue as OnboardingStage)
    : null;
}

export function getPreviousOnboardingStage(
  currentState: OnboardingStage
): OnboardingStage | null {
  const previousStateValue = currentState - 1;
  return previousStateValue in OnboardingStage
    ? (previousStateValue as OnboardingStage)
    : null;
}

export function getOnboardingStageName(state: OnboardingStage): string {
  return OnboardingStageNames[state];
}

export function isFirstOnboardingStage(state: OnboardingStage): boolean {
  return state === OnboardingStage.EmailVerification;
}

export function isLastOnboardingStage(state: OnboardingStage): boolean {
  return state === OnboardingStage.Complete;
}
