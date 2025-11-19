import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PowerDevice } from '../types';


interface Props {
  devices: PowerDevice[];
  onDevicesChange: (devices: PowerDevice[]) => void;
  defaultVoltage: number;
  onDefaultVoltageChange: (voltage: number) => void;
}

export default function PowerDeviceForm({ devices, onDevicesChange, defaultVoltage, onDefaultVoltageChange }: Props) {
  const [newDevice, setNewDevice] = useState<Omit<PowerDevice, 'id'>>({
    name: '',
    watts: 0,
    voltage: defaultVoltage,
    hoursPerDay: 0,
    category: 'electronics',
    currentType: 'DC'
  });

  // Update new device voltage when default voltage changes
  React.useEffect(() => {
    setNewDevice(prev => ({ ...prev, voltage: defaultVoltage }));
  }, [defaultVoltage]);

  const addDevice = () => {
    if (newDevice.name && newDevice.watts > 0) {
      const device: PowerDevice = {
        ...newDevice,
        id: Date.now().toString()
      };
      onDevicesChange([...devices, device]);
      setNewDevice({
        name: '',
        watts: 0,
        voltage: defaultVoltage,
        hoursPerDay: 0,
        category: 'electronics',
        currentType: 'DC'
      });
    }
  };

  const removeDevice = (id: string) => {
    onDevicesChange(devices.filter(d => d.id !== id));
  };

  const updateDevice = (id: string, updates: Partial<PowerDevice>) => {
    onDevicesChange(devices.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Power Devices</h2>
        
        {/* Default Voltage Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Default Voltage:
          </label>
          <select
            value={defaultVoltage}
            onChange={(e) => onDefaultVoltageChange(Number(e.target.value))}
            className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value={12}>12V DC</option>
            <option value={24}>24V DC</option>
            <option value={48}>48V DC</option>
            <option value={230}>230V AC</option>
          </select>
        </div>
      </div>
      
      {/* Header row */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-2 px-4 text-sm font-medium text-gray-700">
        <div>Device Name</div>
        <div>Watts</div>
        <div>Voltage</div>
        <div>Hours/Day</div>
        <div>Category</div>
        <div>Current Type</div>
        <div>Daily Usage</div>
        <div>Actions</div>
      </div>

      {/* Add new device form */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4 p-4 bg-gray-50 rounded">
        <input
          type="text"
          placeholder="Device name"
          value={newDevice.name}
          onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Watts"
          value={newDevice.watts || ''}
          onChange={(e) => setNewDevice({ ...newDevice, watts: Number(e.target.value) })}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Volts"
          value={newDevice.voltage}
          onChange={(e) => {
            const voltage = Number(e.target.value);
            const currentType = voltage === 230 ? 'AC' : 'DC';
            setNewDevice({ ...newDevice, voltage, currentType });
          }}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Hours/day"
          value={newDevice.hoursPerDay || ''}
          onChange={(e) => setNewDevice({ ...newDevice, hoursPerDay: Number(e.target.value) })}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newDevice.category}
          onChange={(e) => setNewDevice({ ...newDevice, category: e.target.value as any })}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="lighting">Lighting</option>
          <option value="electronics">Electronics</option>
          <option value="appliances">Appliances</option>
          <option value="other">Other</option>
        </select>
        <select
          value={newDevice.currentType}
          onChange={(e) => setNewDevice({ ...newDevice, currentType: e.target.value as 'AC' | 'DC' })}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="DC">DC</option>
          <option value="AC">AC</option>
        </select>
        <div className="px-3 py-2 text-sm text-gray-600 flex items-center">
          {(newDevice.watts * newDevice.hoursPerDay).toFixed(0)} Wh/day
        </div>
        <button
          onClick={addDevice}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
          aria-label="Add device"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Device list */}
      <div className="space-y-2">
        {devices.map((device) => (
          <div key={device.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center p-3 bg-gray-50 rounded">
            <input
              type="text"
              value={device.name}
              onChange={(e) => updateDevice(device.id, { name: e.target.value })}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              value={device.watts}
              onChange={(e) => updateDevice(device.id, { watts: Number(e.target.value) })}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              value={device.voltage || defaultVoltage}
              onChange={(e) => {
                const voltage = Number(e.target.value);
                const currentType = voltage === 230 ? 'AC' : 'DC';
                updateDevice(device.id, { voltage, currentType });
              }}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              value={device.hoursPerDay}
              onChange={(e) => updateDevice(device.id, { hoursPerDay: Number(e.target.value) })}
              className="px-2 py-1 border rounded text-sm"
            />
            <select
              value={device.category}
              onChange={(e) => updateDevice(device.id, { category: e.target.value as any })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="lighting">Lighting</option>
              <option value="electronics">Electronics</option>
              <option value="appliances">Appliances</option>
              <option value="other">Other</option>
            </select>
            <select
              value={device.currentType || 'DC'}
              onChange={(e) => updateDevice(device.id, { currentType: e.target.value as 'AC' | 'DC' })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="DC">DC</option>
              <option value="AC">AC</option>
            </select>
            <div className="text-sm text-gray-600">
              {(device.watts * device.hoursPerDay).toFixed(0)} Wh/day
            </div>
            <button
              onClick={() => removeDevice(device.id)}
              className="text-red-500 hover:text-red-700 flex justify-center"
              aria-label={`Delete ${device.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Add your power devices to get started
        </p>
      )}
    </div>
  );
}