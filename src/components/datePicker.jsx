// src/components/ui/EnhancedDatePicker.jsx
import React, { useState, useRef, useEffect } from 'react';

const EnhancedDatePicker = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecciona tu fecha de nacimiento',
  showAge = true,
  minAge = 1,
  maxAge = 100,
  className = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('decades');
  const [currentYear, setCurrentYear] = useState(1995);
  const [currentMonth, setCurrentMonth] = useState(5);
  const [selectedDate, setSelectedDate] = useState(value || '');
  const dropdownRef = useRef(null);

  // Sincronizar con props
  useEffect(() => {
    if (value !== selectedDate) {
      setSelectedDate(value || '');
    }
  }, [value]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const calculateAge = (dateString) => {
    if (!dateString) return '';
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isValidAge = (dateString) => {
    const age = calculateAge(dateString);
    return age >= minAge && age <= maxAge;
  };

  const handleDateSelect = (day) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (!isValidAge(dateString)) {
      alert(`La edad debe estar entre ${minAge} y ${maxAge} años.`);
      return;
    }

    setSelectedDate(dateString);
    onChange?.(dateString); // Llamar callback del padre
    setIsOpen(false);
  };

  // ... resto de métodos de renderizado (igual que antes)
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setView('months');
  };

  const handleMonthSelect = (month) => {
    setCurrentMonth(month);
    setView('calendar');
  };

  // Estilos base del componente
  const baseInputStyle = {
    borderRadius: '12px',
    border: '2px solid #22c55e',
    padding: '16px 20px',
    backgroundColor: 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    ...style,
  };

  const renderDecadesView = () => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - minAge;
    const minYear = currentYear - maxAge;
    const decades = [];

    for (
      let i = Math.floor(minYear / 10) * 10;
      i <= Math.floor(maxYear / 10) * 10;
      i += 10
    ) {
      decades.push(i);
    }

    return (
      <div className="p-4">
        <div className="text-center mb-3">
          <h6 className="text-primary fw-bold mb-0">Selecciona una década</h6>
        </div>
        <div className="row g-2">
          {decades.map((decade) => (
            <div key={decade} className="col-6">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  setCurrentYear(decade + 5);
                  setView('years');
                }}
              >
                {decade}s
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderYearsView = () => {
    const startYear = Math.floor(currentYear / 10) * 10;
    const currentYearActual = new Date().getFullYear();
    const maxYear = currentYearActual - minAge;
    const minYear = currentYearActual - maxAge;

    const years = [];
    for (
      let i = Math.max(startYear, minYear);
      i <= Math.min(startYear + 9, maxYear);
      i++
    ) {
      years.push(i);
    }

    return (
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setView('decades')}
          >
            <i className="fas fa-arrow-left me-1"></i>Décadas
          </button>
          <h6 className="text-primary fw-bold mb-0">{startYear}s</h6>
          <div></div>
        </div>
        <div className="row g-2">
          {years.map((year) => (
            <div key={year} className="col-6">
              <button
                type="button"
                className={`btn w-100 ${year === currentYear ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthsView = () => (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => setView('years')}
        >
          <i className="fas fa-arrow-left me-1"></i>Años
        </button>
        <h6 className="text-primary fw-bold mb-0">{currentYear}</h6>
        <div></div>
      </div>
      <div className="row g-2">
        {months.map((month, index) => (
          <div key={index} className="col-4">
            <button
              type="button"
              className={`btn w-100 btn-sm ${index === currentMonth ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleMonthSelect(index)}
            >
              {month.substring(0, 3)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDate === dateString;
      const isValidDay = isValidAge(dateString);

      days.push(
        <div key={day} className="p-1">
          <button
            type="button"
            className={`btn btn-sm w-100 ${
              isSelected
                ? 'btn-primary fw-bold'
                : !isValidDay
                  ? 'btn-outline-secondary text-muted'
                  : 'btn-outline-light text-dark'
            }`}
            style={{ height: '32px', fontSize: '0.85rem' }}
            onClick={() => handleDateSelect(day)}
            disabled={!isValidDay}
          >
            {day}
          </button>
        </div>
      );
    }

    return (
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setView('months')}
          >
            <i className="fas fa-arrow-left me-1"></i>Meses
          </button>
          <h6 className="text-primary fw-bold mb-0">
            {months[currentMonth]} {currentYear}
          </h6>
          <div className="d-flex gap-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1)
              }
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1)
              }
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="row g-1 mb-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
            <div key={day} className="col text-center">
              <small className="text-muted fw-bold">{day}</small>
            </div>
          ))}
        </div>

        <div className="row g-1">
          {days.map((day, index) => (
            <div key={index} className="col">
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`position-relative ${className}`} ref={dropdownRef}>
      <div
        className="form-control form-control-lg border-0 d-flex align-items-center justify-content-between"
        style={baseInputStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="d-flex align-items-center flex-grow-1">
          <i
            className="fas fa-calendar-alt me-3 text-primary"
            style={{ fontSize: '18px' }}
          ></i>
          <div>
            {selectedDate ? (
              <>
                <div
                  className="fw-semibold text-dark"
                  style={{ fontSize: '1rem' }}
                >
                  {formatDate(selectedDate)}
                </div>
                {showAge && (
                  <small className="text-success">
                    <i className="fas fa-birthday-cake me-1"></i>
                    {calculateAge(selectedDate)} años
                  </small>
                )}
              </>
            ) : (
              <span className="text-muted">{placeholder}</span>
            )}
          </div>
        </div>
        <i
          className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-primary`}
        ></i>
      </div>

      {isOpen && (
        <div
          className="position-absolute w-100 bg-white border rounded-3 shadow-lg"
          style={{
            top: '100%',
            left: 0,
            zIndex: 1050,
            marginTop: '5px',
            minWidth: '320px',
          }}
        >
          {view === 'decades' && renderDecadesView()}
          {view === 'years' && renderYearsView()}
          {view === 'months' && renderMonthsView()}
          {view === 'calendar' && renderCalendarView()}

          {selectedDate && (
            <div className="border-top bg-light px-3 py-2">
              <div className="text-center">
                <small className="text-success fw-semibold">
                  <i className="fas fa-check-circle me-1"></i>
                  {formatDate(selectedDate)} ({calculateAge(selectedDate)} años)
                </small>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedDatePicker;
