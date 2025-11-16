import { useState, useEffect } from 'react';
import { machinesAPI } from '../services/api';

function DashboardPage() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMachines();
    // Refresh every 30 seconds
    const interval = setInterval(loadMachines, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const response = await machinesAPI.getAll();
      setMachines(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load machines');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
        return 'bg-running text-white';
      case 'Idle':
        return 'bg-idle text-white';
      case 'Error':
        return 'bg-error text-white';
      case 'Maintenance':
        return 'bg-maintenance text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Running':
        return '▶';
      case 'Idle':
        return '⏸';
      case 'Error':
        return '⚠';
      case 'Maintenance':
        return '🔧';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shop Floor Dashboard</h1>
        <p className="mt-2 text-gray-600">Real-time machine status monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`px-6 py-4 ${getStatusColor(machine.status)}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{machine.machine_id}</h3>
                <span className="text-2xl">{getStatusIcon(machine.status)}</span>
              </div>
              <p className="text-sm opacity-90 mt-1">{machine.name}</p>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-gray-900">{machine.status}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Output</p>
                  <p className="text-lg font-semibold text-gray-900">{machine.output} units</p>
                </div>

                {machine.operator && (
                  <div>
                    <p className="text-sm text-gray-500">Operator</p>
                    <p className="text-sm font-medium text-gray-900">{machine.operator}</p>
                  </div>
                )}

                {machine.error_message && (
                  <div>
                    <p className="text-sm text-red-600 font-medium">Error</p>
                    <p className="text-sm text-red-600">{machine.error_message}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400">
                    Updated: {new Date(machine.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No machines found</p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

