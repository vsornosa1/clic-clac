// The plant's own numbers. The figure, its readout and the lesson panel all read from here.
export const PLANT = {
  yearHours: 8766,
  unitMw: 2.4,
  criticalMw: 2.4,
  mtbfHours: 2000,
  mttrHours: 8,
  commonCauseShare: 0.02,
  heartbeatMs: 500,
  missedBeats: 3,
  breakerMs: 120,
  crankS: 1.2,
  buildS: 0.8,
  closeS: 0.5,
};

export const INTERVALS = [0.5, 1, 2, 5];
export const RIDES = [0, 2, 5, 30];

export const detectSeconds = (heartbeatS, missed = PLANT.missedBeats) => heartbeatS * missed;
export const startSeconds = (p = PLANT) => p.crankS + p.buildS + p.closeS;
export const breakSeconds = (p = PLANT) => p.breakerMs / 1000;

// From the fault until the standby's breaker closes on the bus.
export const outageSeconds = (heartbeatS, p = PLANT) => detectSeconds(heartbeatS, p.missedBeats) + startSeconds(p);

export const unitUnavailability = (p = PLANT) => p.mttrHours / (p.mtbfHours + p.mttrHours);

export const failoversPerYear = (p = PLANT) => (2 * p.yearHours) / p.mtbfHours;

export function availability(p = PLANT) {
  const u = unitUnavailability(p);
  const pairIndependent = (2 * u * u) / (1 + u);
  const commonCause = p.commonCauseShare * u;
  return {
    unit: u,
    single: 1 - u,
    pair: 1 - pairIndependent,
    pairWithCommonCause: 1 - (pairIndependent + commonCause),
    singleHoursPerYear: u * p.yearHours,
    pairHoursPerYear: (pairIndependent + commonCause) * p.yearHours,
  };
}

export function report({ heartbeatS = PLANT.heartbeatMs / 1000, rideS = RIDES[3] } = {}) {
  const p = PLANT;
  const availabilityNumbers = availability(p);
  const outage = outageSeconds(heartbeatS, p);
  const failures = failoversPerYear(p);
  const uncovered = Math.max(0, outage - rideS);
  return {
    heartbeatS,
    rideS,
    detectS: detectSeconds(heartbeatS, p.missedBeats),
    startS: startSeconds(p),
    breakS: breakSeconds(p),
    outageS: outage,
    failuresPerYear: failures,
    uncoveredS: uncovered,
    failoverSecondsPerYear: failures * uncovered,
    ...availabilityNumbers,
    totalHoursPerYear: availabilityNumbers.pairHoursPerYear + (failures * uncovered) / 3600,
  };
}

export const minutes = (hours) => hours * 60;

export const fmtMinutes = (hours) => {
  const value = minutes(hours);
  if (value < 1) return `${(value * 60).toFixed(0)} s/yr`;
  if (value < 60) return `${value.toFixed(value < 10 ? 1 : 0)} min/yr`;
  return `${(value / 60).toFixed(1)} h/yr`;
};

export const fmtPercent = (value, digits = 3) => `${(value * 100).toFixed(digits)}%`;
