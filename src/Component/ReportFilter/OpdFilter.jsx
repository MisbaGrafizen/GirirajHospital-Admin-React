import React, { useState } from 'react';
import ModernDatePicker from '../MainInputFolder/ModernDatePicker';
import AnimatedDropdown from '../MainInputFolder/AnimatedDropdown';
import { Filter, User } from 'lucide-react';

export default function OpdFilter() {
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6">
        <ModernDatePicker label="From Date" selectedDate={dateFrom} setSelectedDate={setDateFrom} />
        <ModernDatePicker label="To Date" selectedDate={dateTo} setSelectedDate={setDateTo} />
        <AnimatedDropdown
          label="Service"
          icon={Filter}
          selected={selectedService}
          onChange={setSelectedService}
          options={[
            'All Services',
            'Appointment',
            'Reception Staff',
            'Lab',
            'Doctor Service',
            'Security',
          ]}
        />
        <AnimatedDropdown
          label="Doctor"
          icon={User}
          selected={selectedDoctor}
          onChange={setSelectedDoctor}
          options={['All Doctors', 'Dr. Sharma', 'Dr. Patel', 'Dr. Kumar', 'Dr. Singh']}
        />
      </div>
    </div>
  );
}
