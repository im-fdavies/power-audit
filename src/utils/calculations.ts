import { PowerDevice, PowerCalculation, Settings } from '../types';

export function calculatePowerRequirements(
  devices: PowerDevice[],
  settings: Settings
): PowerCalculation {
  // Separate AC and DC devices
  const acDevices = devices.filter(d => d.currentType === 'AC');
  const dcDevices = devices.filter(d => d.currentType === 'DC');

  // Calculate daily energy consumption for AC devices (need inverter)
  const acDailyWh = acDevices.reduce((sum, device) => {
    return sum + (device.watts * device.hoursPerDay);
  }, 0);

  // Calculate daily energy consumption for DC devices (direct from battery)
  const dcDailyWh = dcDevices.reduce((sum, device) => {
    return sum + (device.watts * device.hoursPerDay);
  }, 0);

  // Total daily energy consumption (AC devices account for inverter efficiency)
  const totalDailyWh = dcDailyWh + (acDailyWh / settings.inverterEfficiency);

  // Convert to Amp-hours based on system voltage
  const totalDailyAh = totalDailyWh / settings.systemVoltage;

  // Calculate battery capacity needed
  // Account for days of autonomy, depth of discharge, and efficiency
  const batteryCapacityNeeded = (totalDailyAh * settings.daysOfAutonomy) / 
    (settings.depthOfDischarge * settings.batteryEfficiency);

  // Calculate solar panel requirements
  // Account for charging efficiency and peak sun hours
  const solarPanelWatts = totalDailyWh / 
    (settings.peakSunHours * settings.solarEfficiency);

  // Calculate inverter requirements - ONLY for AC devices (add 25% safety margin)
  let inverterWatts = 0;
  if (acDevices.length > 0) {
    const peakAcWatts = Math.max(...acDevices.map(d => d.watts));
    const totalSimultaneousAcWatts = acDevices
      .filter(d => d.category !== 'lighting') // Assume lighting isn't all on at once
      .reduce((sum, device) => sum + device.watts, 0);
    inverterWatts = Math.max(peakAcWatts, totalSimultaneousAcWatts) * 1.25;
  }

  return {
    totalDailyWh,
    totalDailyAh,
    batteryCapacityNeeded,
    solarPanelWatts,
    inverterWatts
  };
}

export function getRecommendedProducts(calculation: PowerCalculation, systemVoltage: number) {
  return {
    batteryCount: Math.ceil(calculation.batteryCapacityNeeded / 100), // Assuming 100Ah batteries
    solarPanelCount: Math.ceil(calculation.solarPanelWatts / 100), // Assuming 100W panels
    inverterMinWatts: calculation.inverterWatts,
    mpptMinAmps: Math.ceil(calculation.solarPanelWatts / systemVoltage * 1.25) // 25% safety margin
  };
}