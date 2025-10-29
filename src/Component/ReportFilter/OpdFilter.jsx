import React, { useEffect, useMemo, useState } from 'react';
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

const OPD_SERVICES = [
  'All Services',
  'Appointment',
  'Reception Staff',
  'Doctor Service',
  'Diagnostic Services (Pathology)',
  'Diagnostic Services (Radiology)',
  'Cleanliness',
  'Security',
];

const CONCERN_SERVICES = [
  'All Services',
  'Doctor Services',
  'Nursing',
  'Billing Services',
  'Housekeeping',
  'Maintenance',
  'Diagnostic Services',
  'Dietitian Services',
  'Security',
];

function normalizeServiceLabel(label, variant = 'opd') {
  if (!label) return 'All Services';
  if (variant === 'opd') {
    if (label === 'Lab') return 'Diagnostic Services';
    if (label === 'All Services') return 'All Services';
    return label;
  }
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
  isAdmin = false,
}) {
  const [dateFrom, setDateFrom] = useState(parseToDate(value?.from));
  const [dateTo, setDateTo] = useState(parseToDate(value?.to));
  const [selectedService, setSelectedService] = useState(
    toDisplayServiceLabel(value?.service, serviceVariant) || 'All Services'
  );
  const [selectedDoctor, setSelectedDoctor] = useState(
    value?.doctor ? value.doctor : 'All Doctors'
  );

  // ✅ Service options
  const serviceOptions = useMemo(() => {
    if (Array.isArray(services) && services.length) return services;
    return serviceVariant === 'concern' ? CONCERN_SERVICES : OPD_SERVICES;
  }, [services, serviceVariant]);

  // ✅ Doctor options (coming from parent)
  const doctorOptions = useMemo(() => {
    let opts = Array.isArray(doctors) && doctors.length ? doctors : [];
    // always prepend "All Doctors"
    if (!opts.includes('All Doctors')) {
      opts = ['All Doctors', ...opts];
    }
    return opts;
  }, [doctors]);

  const shouldShowServiceDropdown = 
    serviceVariant === "concern" ? isAdmin : true;
  


  useEffect(() => {
    if (!value) return;
    setDateFrom(parseToDate(value.from));
    setDateTo(parseToDate(value.to));
    if (value.service !== undefined) {
      setSelectedService(toDisplayServiceLabel(value.service, serviceVariant) || 'All Services');
    }
    if (value.doctor !== undefined) {
      setSelectedDoctor(value.doctor || 'All Doctors');
    }
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

  // ✅ keep service option valid
  useEffect(() => {
    if (!serviceOptions.includes(selectedService)) {
      const display = toDisplayServiceLabel(
        normalizeServiceLabel(selectedService, serviceVariant),
        serviceVariant
      );
      setSelectedService(serviceOptions.includes(display) ? display : 'All Services');
    }
  }, [serviceOptions, selectedService, serviceVariant]);

  return (
    <div className="">
      <div className="md34:!hidden md11:!grid grid-cols-2 md11:grid-cols-4 gap-x-[9px]">
        <ModernDatePicker label="From Date" selectedDate={dateFrom} setSelectedDate={setDateFrom} />
        <ModernDatePicker label="To Date" selectedDate={dateTo} setSelectedDate={setDateTo} />
        {shouldShowServiceDropdown && (
          <AnimatedDropdown
            label="Service"
            icon={Filter}
            selected={selectedService}
            onChange={setSelectedService}
            options={serviceOptions}
          />
        )}
        {doctorOptions.length > 1 && (
          <AnimatedDropdown
            label="Doctor"
            icon={User}
            selected={selectedDoctor}
            onChange={setSelectedDoctor}
            options={doctorOptions}
          />
        )}
      </div>

      <div className="md34:!flex md11:!hidden flex-col mt-[10px] gap-[12px]">
        <div className="grid grid-cols-2 gap-x-[10px] w-[100%]">
          <ModernDatePicker label="From Date" selectedDate={dateFrom} setSelectedDate={setDateFrom} />
          <ModernDatePicker label="To Date" selectedDate={dateTo} setSelectedDate={setDateTo} />
        </div>
        <div className="grid grid-cols-2 gap-x-[10px] w-[100%]">
          <AnimatedDropdown
            label="Service"
            icon={Filter}
            selected={selectedService}
            onChange={setSelectedService}
            options={serviceOptions}
          />
          {doctorOptions.length > 1 && (
            <AnimatedDropdown
              label="Doctor"
              icon={User}
              selected={selectedDoctor}
              onChange={setSelectedDoctor}
              options={doctorOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
