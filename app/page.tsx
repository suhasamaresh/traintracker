"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, Clock, MapPin, AlertCircle, CheckCircle, Navigation } from 'lucide-react';

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

  // Mock train data with realistic schedules
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

  // Initialize trains on component mount
  useEffect(() => {
    setTrains(initialTrains);
  }, []);

  // Mock real-time updates
  const updateTrainData = useCallback(() => {
    setTrains(prevTrains => 
      prevTrains.map(train => {
        const progressIncrement = Math.random() * 5;
        const newProgress = Math.min(100, train.progress + progressIncrement);
        
        let newStatus = train.status;
        let newDelay = train.delay;
        
        // Randomly introduce delays or resolve them
        if (Math.random() < 0.1) {
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
  }, []);

  // Helper function to add minutes to time string
  const addMinutesToTime = (timeStr: string, minutes: number) => {
    const [time, period] = timeStr.split(' ');
    const [hours, mins] = time.split(':');
    const date = new Date();
    date.setHours(period === 'PM' ? parseInt(hours) + 12 : parseInt(hours));
    date.setMinutes(parseInt(mins) + minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Update trains every 3 seconds
  useEffect(() => {
    const interval = setInterval(updateTrainData, 3000);
    return () => clearInterval(interval);
  }, [updateTrainData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'boarding':
        return <Navigation className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'boarding':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrains = selectedRoute === 'all' 
    ? trains 
    : trains.filter(train => train.route === selectedRoute);

  const routes = ['all', ...new Set(trains.map(train => train.route))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Train className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Live Train Tracker</h1>
                <p className="text-gray-600">Real-time train status and locations</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="font-semibold text-gray-900">
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>

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
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="wait">
            {filteredTrains.map((train, index) => (
              <motion.div
                key={train.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Train Header */}
                <div 
                  className="p-6 text-white"
                  style={{ backgroundColor: train.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{train.name}</h3>
                      <p className="text-white/90">{train.route}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(train.status)}`}>
                        {getStatusIcon(train.status)}
                        {train.status.charAt(0).toUpperCase() + train.status.slice(1)}
                      </div>
                      {train.delay > 0 && (
                        <p className="text-white/90 text-sm mt-1">+{train.delay} min delay</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Train Body */}
                <div className="p-6">
                  {/* Current Location */}
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Currently at</p>
                      <p className="text-gray-600">{train.currentStation}</p>
                    </div>
                  </div>

                  {/* Next Station */}
                  <div className="flex items-center gap-3 mb-6">
                    <Navigation className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Next station</p>
                      <p className="text-gray-600">{train.nextStation}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Route Progress</span>
                      <span className="text-sm text-gray-500">
                        {train.currentStop}/{train.totalStops} stops
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="h-3 rounded-full"
                        style={{ backgroundColor: train.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${train.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Estimated Arrival */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ETA</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {train.estimatedArrival}
                    </span>
                  </div>
                </div>

                {/* Live Update Indicator */}
                <div className="px-6 pb-4">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Live tracking active
                  </motion.div>
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
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {trains.filter(t => t.status === 'on-time').length}
            </div>
            <div className="text-sm text-gray-600">On Time</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {trains.filter(t => t.status === 'delayed').length}
            </div>
            <div className="text-sm text-gray-600">Delayed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trains.filter(t => t.status === 'boarding').length}
            </div>
            <div className="text-sm text-gray-600">Boarding</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrainTracker;