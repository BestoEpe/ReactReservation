import React, { useState, useEffect } from "react";
import "../reservation.css";
import formData from 'form-data';
import Mailgun from 'mailgun.js';



const Reserve = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [boxReserved, setBoxReserved] = useState(false);
  const [reservations, setReservations] = useState({});
  const [selectedBox, setSelectedBox] = useState(1);

  useEffect(() => {
    const reservationsData = localStorage.getItem("reservations");
    if (reservationsData) {
      setReservations(JSON.parse(reservationsData));
    }
  }, []);
//--------


 async function send() {

  const API_KEY = 'd44d6c4a11d48c59ed7fbe0f086557c2-102c75d8-6dcc3236';
  const DOMAIN = 'sandbox588d65f567fc423690aca1b843cc4817.mailgun.org';
  
  const mailgun = new Mailgun(formData);
  const client = mailgun.client({username: 'api', key: API_KEY});
  
  const messageData = {
    from: 'Excited User <botti@samples.mailgun.org>',
    to: 'erno.ratto@edu.salpaus.fi',
    subject: 'Hello',
    text: `thank you for reservation ${name} on time ${selectedDay} ${time}`
  };
  
  client.messages.create(DOMAIN, messageData)
   .then((res) => {
     console.log(res);
   })
   .catch((err) => {
     console.log(err);
   });

}


//--------------



  const handleReservation = (e) => {
    e.preventDefault();
    if (!selectedDay || !time) {
      console.error("Please select a day and time.");
      return;
    }
    const emailExists = Object.values(reservations).some(
      (r) => Object.values(r).some((res) => res.email === email)
    );
    if (emailExists) {
      console.error("An email can only be used for one reservation.");
      return;
    }
    // check if the selected box is already reserved
    if (
      reservations[selectedDay] &&
      Object.values(reservations[selectedDay]).some(
        (r) => r.box === selectedBox && r.time === time
      )
    ) {
      console.log(`Box ${selectedBox} is already reserved at ${time} on ${selectedDay}.`);
      return;
    }
  
    const newReservation = {
      name,
      email,
      day: selectedDay,
      time,
      box: selectedBox,
    };
  
    const newReservations = {
      ...reservations,
      [selectedDay]: {
        ...reservations[selectedDay],
        [time]: newReservation,
      },
    };
  
    localStorage.setItem("reservations", JSON.stringify(newReservations));
    setReservations(newReservations);
    setBoxReserved(true);
  
    console.log(
      `Reservation confirmed for ${selectedDay}, ${time}, ${name}, ${email}, Box ${selectedBox}`
    );
  
    setName("");
    setEmail("");
    setTime("");
    setSelectedDay("");
    setSelectedBox(1);
  };
  

  const handleTimeSelection = (time) => {
    setTime(time);
  };

  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let i = 8; i < 16; i++) {
      const timeSlot = `${i}:00 - ${i + 1}:00`;
      const reservedName =
        reservations[selectedDay] && reservations[selectedDay][timeSlot]
          ? reservations[selectedDay][timeSlot].name.email
          : "";
      const isReserved =
        reservations[selectedDay] &&
        reservations[selectedDay][timeSlot] &&
        reservations[selectedDay][timeSlot].box === selectedBox;
      timeSlots.push(
        <button
          type="button"
          key={timeSlot}
          className={time === timeSlot ? "time-slot selected" : "time-slot"}
          onClick={() => handleTimeSelection(timeSlot)}
          disabled={!selectedDay || boxReserved || isReserved}
        >
          {isReserved ? "Reserved" : reservedName ? `${timeSlot} (${reservedName})` : timeSlot}
        </button>
      );
    }
    return timeSlots;
  };

  const handleDaySelection = (day) => {
    setSelectedDay(day);
  };

  const generateDays = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return days.map((day) => (
      <button
        type="button"
        key={day}
        className={selectedDay === day ? "day selected" : "day"}
        onClick={() => handleDaySelection(day)}
        disabled={boxReserved}
      >
        {day}
      </button>
    ));
  };

  const handleReset = () => {
    setReservations({});
    setSelectedDay("");
    setTime("");
    setBoxReserved(false);
    localStorage.removeItem("reservations");
  };

  function handleReload() {
    window.location.reload();
  }

  const handleBoxSelection = (boxNumber) => {
    setSelectedBox(boxNumber);
  };

  return (
    <div className="boxes">
      <div className="box-selection-container">
        <h2>Box Selection</h2>
        <div className="box-selection">
          <button
            type="button"
            className={selectedBox === 1 ? "box1 selected" : "box1"}
            onClick={() => handleBoxSelection(1)}
            disabled={boxReserved}
          >
            Box 1
          </button>
          <button
            type="button"
            className={selectedBox === 2 ? "box1 selected" : "box1"}
            onClick={() => handleBoxSelection(2)}
            disabled={boxReserved}
          >
            Box 2
          </button>
        </div>
      </div>
      <div className="reservation-form-container">
        <h3 className="h4">Reservation Form</h3>
        <form onSubmit={handleReservation}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={boxReserved}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={boxReserved}
              required
            />
          </label>
          <div className="day-selection">
            <label>Select a Day:</label>
            {generateDays()}
          </div>
          <div className="time-slot-selection">
            <label>Select a Time:</label>
            {selectedDay ? (
              generateTimeSlots()
            ) : (
              <p>Please select a day to see available time slots.</p>
            )}
          </div>
          <button type="submit" disabled={boxReserved} onClick={send} className="resetbutton">
            {boxReserved ? "Reserved" : "Reserve"}
          </button>
          {boxReserved && console.log("toimi")}
          <button type="button" onClick={handleReset} className="resetbutton">
            Reset
          </button>
          <button type="button" onClick={handleReload} className="resetbutton">
            Make another reservation
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reserve;
