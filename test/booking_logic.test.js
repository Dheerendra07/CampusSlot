import test from 'node:test';
import assert from 'node:assert/strict';

function timeStringToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + m;
}

function checkBookingConflict(candidate, existingBookings, excludeBookingId = null) {
  const candStartMin = timeStringToMinutes(candidate.startTime);
  const candEndMin = timeStringToMinutes(candidate.endTime);

  for (const b of existingBookings) {
    if (b.status === 'cancelled') continue;
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (b.roomId !== candidate.roomId) continue;
    if (b.date !== candidate.date) continue;

    const existingStartMin = timeStringToMinutes(b.startTime);
    const existingEndMin = timeStringToMinutes(b.endTime);

    const hasOverlap = (candStartMin < existingEndMin && candEndMin > existingStartMin);

    if (hasOverlap) {
      return {
        conflict: true,
        conflictingBooking: b
      };
    }
  }

  return { conflict: false, conflictingBooking: null };
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

test('timeStringToMinutes converts HH:MM properly', () => {
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('10:00'), 600);
  assert.equal(timeStringToMinutes('10:30'), 630);
  assert.equal(timeStringToMinutes('23:59'), 1439);
});

test('Overlapping intervals in the same room on the same date conflict', () => {
  const existing = [{
    id: 'B1',
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed'
  }];

  // 10:30 - 11:30 overlaps with 10:00 - 11:00
  const candidate = {
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '10:30',
    endTime: '11:30'
  };

  const res = checkBookingConflict(candidate, existing);
  assert.equal(res.conflict, true);
  assert.equal(res.conflictingBooking.id, 'B1');
});

test('Back-to-back bookings (10:00-11:00 and 11:00-12:00) in the same room are ALLOWED', () => {
  const existing = [{
    id: 'B1',
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed'
  }];

  const candidateAfter = {
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '11:00',
    endTime: '12:00'
  };
  const resAfter = checkBookingConflict(candidateAfter, existing);
  assert.equal(resAfter.conflict, false, '11:00-12:00 should not conflict with 10:00-11:00');

  const candidateBefore = {
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '09:00',
    endTime: '10:00'
  };
  const resBefore = checkBookingConflict(candidateBefore, existing);
  assert.equal(resBefore.conflict, false, '09:00-10:00 should not conflict with 10:00-11:00');
});

test('Identical time slots in different rooms are ALLOWED', () => {
  const existing = [{
    id: 'B1',
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed'
  }];

  const candidateOtherRoom = {
    roomId: 'RM-202',
    date: '2026-10-17',
    startTime: '10:00',
    endTime: '11:00'
  };

  const res = checkBookingConflict(candidateOtherRoom, existing);
  assert.equal(res.conflict, false);
});

test('Cancelled bookings do NOT block new bookings', () => {
  const existing = [{
    id: 'B1',
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '10:00',
    endTime: '11:00',
    status: 'cancelled'
  }];

  const candidate = {
    roomId: 'RM-101',
    date: '2026-10-17',
    startTime: '10:00',
    endTime: '11:00'
  };

  const res = checkBookingConflict(candidate, existing);
  assert.equal(res.conflict, false, 'Cancelled booking must not cause conflict');
});

test('escapeCSV handles commas, quotes, and newlines properly', () => {
  assert.equal(escapeCSV('Normal text'), 'Normal text');
  assert.equal(escapeCSV('Text with, comma'), '"Text with, comma"');
  assert.equal(escapeCSV('Text with "quotes"'), '"Text with ""quotes"""');
  assert.equal(escapeCSV('Line 1\nLine 2'), '"Line 1\nLine 2"');
  assert.equal(escapeCSV(null), '""');
});
