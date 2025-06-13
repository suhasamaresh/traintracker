"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, Clock, MapPin, AlertCircle, CheckCircle, Navigation, Plus, Edit3, Trash2, Play, Pause, Settings } from 'lucide-react';

// Move initialTrains OUTSIDE the component so it doesn't need to be a dependency
const initialTrains = [
  {
    id: 'T001',
    name: 'Express Metro',
    route: 'Central-North',
    currentStation: 'Central Station',
    nextStation: 'Business District',
    status: 'on-time',
    delay: 0,
    progress: 25,
    estimatedArrival: '10:45 AM',
    totalStops: 8,
    currentStop: 2,
    color: '#3B82F6'
  },
  {
    id: 'T002',
    name: 'City Line',
    route: 'East-West',
    currentStation: 'Tech Park',
    nextStation: 'University',
    status: 'delayed',
    delay: 5,
    progress: 60,
    estimatedArrival: '10:52 AM',
    totalStops: 12,
    currentStop: 7,
    color: '#EF4444'
  },
  {
    id: 'T003',
    name: 'Suburban Express',
    route: 'South-Central',
    currentStation: 'Mall Junction',
    nextStation: 'Sports Complex',
    status: 'on-time',
    delay: 0,
    progress: 80,
    estimatedArrival: '10:38 AM',
    totalStops: 6,
    currentStop: 5,
    color: '#10B981'
  },
  {
    id: 'T004',
    name: 'Airport Link',
    route: 'Airport-Downtown',
    currentStation: 'Terminal 2',
    nextStation: 'Terminal 1',
    status: 'boarding',
    delay: 0,
    progress: 15,
    estimatedArrival: '11:05 AM',
    totalStops: 10,
    currentStop: 1,
    color: '#8B5CF6'
  }
];

const TrainTracker = () => {
  type Train = {
    id: string;
    name: string;
    route: string;
    currentStation: string;
    nextStation: string;
    status: string;
    delay: number;
    progress: number;
    estimatedArrival: string;
    totalStops: number;
    currentStop: number;
    color: string;
  };

  const [trains, setTrains] = useState<Train[]>([]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [newTrain, setNewTrain] = useState({
    name: '',
    route: '',
    currentStation: '',
    nextStation: '',
    status: 'on-time',
    delay: 0,
    progress: 0,
    estimatedArrival: '',
    totalStops: 5,
    currentStop: 1,
    color: '#3B82F6'
  });

  const statusOptions = ['on-time', 'delayed', 'boarding', 'cancelled', 'maintenance'];
  const colorOptions = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6B7280'];

  // Initialize trains on component mount
  useEffect(() => {
    setTrains(initialTrains);
  }, []);

  // Mock real-time updates
  const updateTrainData = useCallback(() => {
    if (!isLiveMode) return;

    setTrains(prevTrains =>
      prevTrains.map(train => {
        if (train.status === 'cancelled' || train.status === 'maintenance') return train;

        const progressIncrement = Math.random() * 3;
        const newProgress = Math.min(100, train.progress + progressIncrement);

        let newStatus = train.status;
        let newDelay = train.delay;

        // Randomly introduce delays or resolve them
        if (Math.random() < 0.08) {
          if (train.status === 'on-time' && Math.random() < 0.3) {
            newStatus = 'delayed';
            newDelay = Math.floor(Math.random() * 10) + 1;
          } else if (train.status === 'delayed' && Math.random() < 0.4) {
            newStatus = 'on-time';
            newDelay = 0;
          }
        }

        // Update current stop based on progress
        const newCurrentStop = Math.min(
          train.totalStops,
          Math.ceil((newProgress / 100) * train.totalStops)
        );

        return {
          ...train,
          progress: newProgress,
          status: newStatus,
          delay: newDelay,
          currentStop: newCurrentStop,
          estimatedArrival: newStatus === 'delayed'
            ? addMinutesToTime(train.estimatedArrival, newDelay)
            : train.estimatedArrival
        };
      })
    );
    setLastUpdate(new Date());
  }, [isLiveMode]);

  // Helper function to add minutes to time string
  const addMinutesToTime = (timeStr: string, minutes: number) => {
    const [time, period] = timeStr.split(' ');
    const [hours, mins] = time.split(':');
    const date = new Date();
    let hrs = parseInt(hours);
    if (period === 'PM' && hrs !== 12) hrs += 12;
    if (period === 'AM' && hrs === 12) hrs = 0;
    date.setHours(hrs);
    date.setMinutes(parseInt(mins) + minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Update trains every 3 seconds
  useEffect(() => {
    const interval = setInterval(updateTrainData, 3000);
    return () => clearInterval(interval);
  }, [updateTrainData]);

  // Add new train
  const handleAddTrain = () => {
    if (!newTrain.name || !newTrain.route || !newTrain.currentStation) return;

    const train: Train = {
      ...newTrain,
      id: `T${String(Date.now()).slice(-3)}`,
    };

    setTrains(prev => [...prev, train]);
    setNewTrain({
      name: '',
      route: '',
      currentStation: '',
      nextStation: '',
      status: 'on-time',
      delay: 0,
      progress: 0,
      estimatedArrival: '',
      totalStops: 5,
      currentStop: 1,
      color: '#3B82F6'
    });
    setShowAddForm(false);
  };

  // Update existing train
  const handleUpdateTrain = (updatedTrain: Train) => {
    setTrains(prev => prev.map(train =>
      train.id === updatedTrain.id ? updatedTrain : train
    ));
    setEditingTrain(null);
  };

  // Delete train
  const handleDeleteTrain = (trainId: string) => {
    setTrains(prev => prev.filter(train => train.id !== trainId));
  };

  // Quick status update
  const handleQuickStatusUpdate = (trainId: string, newStatus: string) => {
    setTrains(prev => prev.map(train =>
      train.id === trainId ? { ...train, status: newStatus } : train
    ));
  };

  // Removed unused getStatusIcon and getStatusColor

  const filteredTrains = selectedRoute === 'all'
    ? trains
    : trains.filter(train => train.route === selectedRoute);

  const routes = ['all', ...new Set(trains.map(train => train.route))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Train className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Train Management System</h1>
                <p className="text-gray-600">Real-time tracking & administration</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isLiveMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isLiveMode ? 'Live' : 'Paused'}
              </motion.button>

              {/* Add Train Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Train
              </motion.button>

              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="font-semibold text-gray-900">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Train Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6 overflow-hidden"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Train</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Train Name"
                  value={newTrain.name}
                  onChange={(e) => setNewTrain({...newTrain, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Route"
                  value={newTrain.route}
                  onChange={(e) => setNewTrain({...newTrain, route: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Current Station"
                  value={newTrain.currentStation}
                  onChange={(e) => setNewTrain({...newTrain, currentStation: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Next Station"
                  value={newTrain.nextStation}
                  onChange={(e) => setNewTrain({...newTrain, nextStation: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="ETA (e.g., 10:45 AM)"
                  value={newTrain.estimatedArrival}
                  onChange={(e) => setNewTrain({...newTrain, estimatedArrival: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newTrain.status}
                  onChange={(e) => setNewTrain({...newTrain, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Total Stops:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTrain.totalStops}
                    onChange={(e) => setNewTrain({...newTrain, totalStops: parseInt(e.target.value)})}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Color:</label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewTrain({...newTrain, color})}
                        className={`w-6 h-6 rounded-full border-2 ${newTrain.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTrain}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Add Train
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Route Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => (
              <motion.button
                key={route}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRoute(route)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedRoute === route
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {route === 'all' ? 'All Routes' : route}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Train Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="wait">
            {filteredTrains.map((train, index) => (
              <motion.div
                key={train.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Train Header */}
                <div
                  className="p-4 text-white relative"
                  style={{ backgroundColor: train.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{train.name}</h3>
                      <p className="text-white/90 text-sm">{train.route}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingTrain(train)}
                        className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTrain(train.id)}
                        className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Status with quick update */}
                  <div className="mt-3">
                    <select
                      value={train.status}
                      onChange={(e) => handleQuickStatusUpdate(train.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-full bg-white/20 text-white border-none outline-none"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="text-gray-900">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {train.delay > 0 && (
                      <p className="text-white/90 text-xs mt-1">+{train.delay} min delay</p>
                    )}
                  </div>
                </div>

                {/* Train Body */}
                <div className="p-4">
                  {/* Current Location */}
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Currently at</p>
                      <p className="text-gray-600 text-sm">{train.currentStation}</p>
                    </div>
                  </div>

                  {/* Next Station */}
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Next station</p>
                      <p className="text-gray-600 text-sm">{train.nextStation}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-500">
                        {train.currentStop}/{train.totalStops}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: train.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${train.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* ETA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">ETA</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">
                      {train.estimatedArrival}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {statusOptions.map(status => (
            <div key={status} className="bg-white rounded-xl shadow-lg p-4 text-center">
              <div className="text-xl font-bold" style={{
                color: status === 'on-time' ? '#10B981' :
                  status === 'delayed' ? '#EF4444' :
                  status === 'boarding' ? '#3B82F6' :
                  status === 'cancelled' ? '#6B7280' : '#F59E0B'
              }}>
                {trains.filter(t => t.status === status).length}
              </div>
              <div className="text-xs text-gray-600 capitalize">{status.replace('-', ' ')}</div>
            </div>
          ))}
        </motion.div>

        {/* Live Update Indicator */}
        {isLiveMode && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="fixed bottom-4 right-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg"
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Live Mode Active
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTrain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingTrain(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Train</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Train Name"
                  value={editingTrain.name}
                  onChange={(e) => setEditingTrain({...editingTrain, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Route"
                  value={editingTrain.route}
                  onChange={(e) => setEditingTrain({...editingTrain, route: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Current Station"
                  value={editingTrain.currentStation}
                  onChange={(e) => setEditingTrain({...editingTrain, currentStation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Next Station"
                  value={editingTrain.nextStation}
                  onChange={(e) => setEditingTrain({...editingTrain, nextStation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Delay (minutes)"
                  value={editingTrain.delay}
                  onChange={(e) => setEditingTrain({...editingTrain, delay: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Color:</label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingTrain({...editingTrain, color})}
                        className={`w-6 h-6 rounded-full border-2 ${editingTrain.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUpdateTrain(editingTrain)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Update
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingTrain(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainTracker;
