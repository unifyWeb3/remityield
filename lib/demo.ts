export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const mockState = {
  balance: 0,
  pending: 100, // 100 USDC
  apyPercent: 4.2,
  depositTimestamp: 0,
};

// This fakes the blockchain delays so the UI animations have time to play
export async function simulateReceiveFlow(
  onStep: (step: string) => void
): Promise<typeof mockState> {
  onStep("bridging");
  await delay(1500); 

  onStep("received");
  await delay(1000); 

  onStep("deploying");
  await delay(1500); 

  onStep("earning");
  mockState.balance = 100;
  mockState.pending = 0;
  mockState.depositTimestamp = Date.now();

  return mockState;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}