const TRUST_MIN = 0.0;
const TRUST_MAX = 2.0;
const FLAG_RECEIVED_PENALTY = -0.15;
const VALIDATED_FLAG_BONUS = 0.05;
const NOISE_FLAG_PENALTY = -0.05;

export function clampTrust(score: number): number {
  return Math.max(TRUST_MIN, Math.min(TRUST_MAX, score));
}

export function adjustTrustForFlagReceived(currentScore: number): number {
  return clampTrust(currentScore + FLAG_RECEIVED_PENALTY);
}

export function adjustTrustForValidatedFlag(currentScore: number): number {
  return clampTrust(currentScore + VALIDATED_FLAG_BONUS);
}

export function adjustTrustForNoiseFlag(currentScore: number): number {
  return clampTrust(currentScore + NOISE_FLAG_PENALTY);
}

export function shouldDelayMessage(trustScore: number): boolean {
  return trustScore < 0.5;
}

export function shouldRequireApproval(trustScore: number): boolean {
  return trustScore < 0.2;
}
