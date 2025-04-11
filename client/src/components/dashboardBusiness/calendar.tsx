"use client";

import { useState } from "react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calendar generation logic
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    const calendarDays = [];

    // Add empty cells for days before the start of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && today.getDate() === day;
      calendarDays.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isToday ? "today" : ""}`}
        >
          {day}
        </div>
      );
    }

    return calendarDays;
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth} className="nav-button">
          ←
        </button>
        <h2>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="nav-button">
          →
        </button>
      </div>

      <div className="weekdays">
        {daysOfWeek.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{generateCalendarDays()}</div>

      <style jsx>{`
        .calendar-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .calendar-header h2 {
          margin: 0;
          color: #333;
        }

        .nav-button {
          background: #f0f0f0;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
        }

        .nav-button:hover {
          background: #e0e0e0;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 10px;
          font-weight: bold;
        }

        .weekday {
          text-align: center;
          padding: 10px;
          color: #555;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }

        .calendar-day {
          position: relative;
          height: 80px;
          padding: 5px;
          text-align: right;
          border-radius: 5px;
          background: #f8f8f8;
          transition: background 0.2s;
        }

        .calendar-day:hover {
          background: #f0f0f0;
          cursor: pointer;
        }

        .calendar-day.empty {
          background: #ffffff;
          cursor: default;
        }

        .calendar-day.today {
          background: #e6f7ff;
          font-weight: bold;
          color: #0070f3;
          border: 1px solid #0070f3;
        }
      `}</style>
    </div>
  );
}
