import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ModernDatePicker from '../MainInputFolder/ModernDatePicker';
import AnimatedDropdown from '../MainInputFolder/AnimatedDropdown';
import { Filter, User } from 'lucide-react';

function parseToDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
function fmtYYYYMMDD(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Default service sets for each variant */
const OPD_SERVICES = [
  'All Services',
  'Appointment',
  'Reception Staff',
  'Lab',
  'Doctor Service',
  'Security',
];

const CONCERN_SERVICES = [
  'All Services',
  'Doctor Services',
  'Billing Services',
  'Housekeeping',
  'Maintenance',
  'Diagnostic Services',
  'Dietitian Services',
  'Security',
  'Overall',
];

/** Map display label -> normalized label for filtering/back-end per variant */
function normalizeServiceLabel(label, variant = 'opd') {
  if (!label) return 'All Services';
  if (variant === 'opd') {
    // OPD uses "Lab" in UI, but data uses "Diagnostic Services"
    if (label === 'Lab') return 'Diagnostic Services';
    // keep "Doctor Service" or anything else as-is, except ensure All Services stays
    if (label === 'All Services') return 'All Services';
    return label;
  }
  // concern
  // make sure accidental "Doctor Service" becomes "Doctor Services"
  if (label === 'Doctor Service') return 'Doctor Services';
  if (label === 'All Services') return 'All Services';
  return label;
}

function toDisplayServiceLabel(service, variant = 'opd') {
  if (!service) return 'All Services';
  if (variant === 'opd') {
    if (service === 'Diagnostic Services') return 'Lab';
    if (service === 'Doctor Services') return 'Doctor Service';
    return service;
  }
  if (service === 'Doctor Service') return 'Doctor Services';
  return service;
}

export default function OpdFilter({
  value,
  onChange,
  serviceVariant = 'opd',
  services,
  doctors,
}) {
  const [dateFrom, setDateFrom] = useState(parseToDate(value?.from));
  const [dateTo, setDateTo] = useState(parseToDate(value?.to));
  const [selectedService, setSelectedService] = useState(
    toDisplayServiceLabel(value?.service, serviceVariant) || 'All Services'
  );
  const [selectedDoctor, setSelectedDoctor] = useState(value?.doctor ? value.doctor : 'All Doctors');

  const serviceOptions = useMemo(() => {
    if (Array.isArray(services) && services.length) return services;
    return serviceVariant === 'concern' ? CONCERN_SERVICES : OPD_SERVICES;
  }, [services, serviceVariant]);

  const doctorOptions = useMemo(() => {
    if (Array.isArray(doctors) && doctors.length) return doctors;
    return ['All Doctors', 'Dr. Sharma', 'Dr. Mehta', 'Dr. Patel', 'Dr. Gupta', 'Dr. Rao', 'Dr. Singh'];
  }, [doctors]);

  useEffect(() => {
    if (!value) return;
    setDateFrom(parseToDate(value.from));
    setDateTo(parseToDate(value.to));
    if (value.service !== undefined) {
      setSelectedService(toDisplayServiceLabel(value.service, serviceVariant) || 'All Services');
    }
    if (value.doctor !== undefined) setSelectedDoctor(value.doctor || 'All Doctors');
  }, [value?.from, value?.to, value?.service, value?.doctor, serviceVariant]);

  useEffect(() => {
    if (typeof onChange !== 'function') return;
    onChange({
      from: fmtYYYYMMDD(dateFrom),
      to: fmtYYYYMMDD(dateTo),
      service: normalizeServiceLabel(selectedService, serviceVariant),
      doctor: selectedDoctor === 'All Doctors' ? '' : (selectedDoctor || ''),
    });
  }, [dateFrom, dateTo, selectedService, selectedDoctor, onChange, serviceVariant]);

  // Ensure current selectedService always exists in the dropdown options
  useEffect(() => {
    if (!serviceOptions.includes(selectedService)) {
      // try to coerce normalized -> display present in options
      const display = toDisplayServiceLabel(
        normalizeServiceLabel(selectedService, serviceVariant),
        serviceVariant
      );
      setSelectedService(serviceOptions.includes(display) ? display : 'All Services');
    }
  }, [serviceOptions, selectedService, serviceVariant]);

  return (
    <div className="">
      <div className=" md34:!hidden md11:!grid grid-cols-2   md11:grid-cols-4 gap-x-6">
        <ModernDatePicker
          label="From Date"
          selectedDate={dateFrom}
          setSelectedDate={setDateFrom}
        />
        <ModernDatePicker
          label="To Date"
          selectedDate={dateTo}
          setSelectedDate={setDateTo}
        />
        <AnimatedDropdown
          label="Service"
          icon={Filter}
          selected={selectedService}
          onChange={setSelectedService}
          options={serviceOptions}
        />
        <AnimatedDropdown
          label="Doctor"
          icon={User}
          selected={selectedDoctor}
          onChange={setSelectedDoctor}
          options={doctorOptions}
        />
      </div>

      <div className=" md34:!flex md11:!hidden flex-col gap-[12px]">
       <div className=' grid grid-cols-2 gap-x-[10px] justify-between w-[100%]'>


          <ModernDatePicker
            label="From Date"
            selectedDate={dateFrom}
            setSelectedDate={setDateFrom}
          />
          <ModernDatePicker
            label="To Date"
            selectedDate={dateTo}
            setSelectedDate={setDateTo}
          />
        </div>
        <div className=' grid grid-cols-2 gap-x-[10px] justify-between w-[100%]'>


          <AnimatedDropdown
            label="Service"
            icon={Filter}
            selected={selectedService}
            onChange={setSelectedService}
            options={serviceOptions}
          />
          <AnimatedDropdown
            label="Doctor"
            icon={User}
            selected={selectedDoctor}
            onChange={setSelectedDoctor}
            options={doctorOptions}
          />
        </div>
      </div>
    </div>
  );
}
