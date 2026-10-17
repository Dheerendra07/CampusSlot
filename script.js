/**
 * CampusSlot — Campus Resource Booking Desk
 * Vanilla JavaScript application logic
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DATA CONSTANTS & DEFINITIONS
  // =========================================================================

  const STORAGE_KEY = 'campusslot_bookings_v1.0';

  /**
   * Predefined Campus Facilities
   * 7 realistic rooms with capacities, types, and locations (exceeds requirement of 6).
   */
  const ROOMS = [
    {
      id: 'RM-AUD-101',
      name: 'Grand Horizon Auditorium',
      location: 'Building A, West Wing - 1st Floor',
      type: 'Auditorium',
      capacity: 250
    },
    {
      id: 'RM-CONF-204',
      name: 'Executive Boardroom Alpha',
      location: 'Admin Quad, Tower 1 - 2nd Floor',
      type: 'Conference',
      capacity: 24
    },
    {
      id: 'RM-LAB-302',
      name: 'Advanced Computing & AI Lab',
      location: 'Science Complex, Wing B - 3rd Floor',
      type: 'Computer Lab',
      capacity: 45
    },
    {
      id: 'RM-SEM-105',
      name: 'Marie Curie Seminar Hall',
      location: 'Engineering Block - 1st Floor',
      type: 'Seminar Hall',
      capacity: 80
    },
    {
      id: 'RM-STUD-401',
      name: 'Multimedia & Podcast Studio',
      location: 'Fine Arts Center - 4th Floor',
      type: 'Studio Lab',
      capacity: 15
    },
    {
      id: 'RM-COLLAB-110',
      name: 'Innovation & Synergy Collab Hub',
      location: 'Central Library - Ground Floor',
      type: 'Collab Workspace',
      capacity: 18
    },
    {
      id: 'RM-LEC-201',
      name: 'Lecture Amphitheater Beta',
      location: 'Academic Hall - 2nd Floor',
      type: 'Lecture Hall',
      capacity: 120
    }
  ];

  // Helper date calculation for demo fixtures relative to user's real today
  function getOffsetDateString(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Predictable sample dataset seeded strictly on genuine first run
   */
  function generateDefaultDemoBookings() {
    const today = getOffsetDateString(0);
    const tomorrow = getOffsetDateString(1);
    const dayAfter = getOffsetDateString(2);
    const nextWeek = getOffsetDateString(5);

    return [
      {
        id: 'CS-1001',
        requester: 'Prof. Alan Turing',
        purpose: 'Artificial Intelligence Capstone Defense',
        roomId: 'RM-LAB-302',
        date: today,
        startTime: '10:00',
        endTime: '12:00',
        attendees: 38,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'CS-1002',
        requester: 'Dr. Rachel Green',
        purpose: 'Dean of Faculty Quarterly Briefing',
        roomId: 'RM-CONF-204',
        date: today,
        startTime: '14:00',
        endTime: '15:30',
        attendees: 20,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'CS-1003',
        requester: 'Marcus Holloway',
        purpose: 'Hackathon Organizing Committee Sprint',
        roomId: 'RM-COLLAB-110',
        date: today,
        startTime: '16:00',
        endTime: '17:30',
        attendees: 14,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'CS-1004',
        requester: 'Siddharth Rao',
        purpose: 'Robotics Club Annual Showcase Rehearsal',
        roomId: 'RM-AUD-101',
        date: tomorrow,
        startTime: '09:30',
        endTime: '12:30',
        attendees: 180,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'CS-1005',
        requester: 'Elena Rostova',
        purpose: 'Creative Media Portfolio Review',
        roomId: 'RM-STUD-401',
        date: tomorrow,
        startTime: '13:00',
        endTime: '14:30',
        attendees: 10,
        status: 'cancelled',
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
      },
      {
        id: 'CS-1006',
        requester: 'Dr. Sarah Connor',
        purpose: 'Quantum Computing Colloquium',
        roomId: 'RM-SEM-105',
        date: dayAfter,
        startTime: '11:00',
        endTime: '13:00',
        attendees: 65,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'CS-1007',
        requester: 'Campus Biotech Society',
        purpose: 'Bioinformatics Workshop Module 1',
        roomId: 'RM-LEC-201',
        date: nextWeek,
        startTime: '15:00',
        endTime: '17:00',
        attendees: 95,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  }

  // =========================================================================
  // 2. APPLICATION STATE & PERSISTENCE
  // =========================================================================

  let bookings = [];
  let pendingCancelBookingId = null;

  // Filter & Search State
  const filterState = {
    search: '',
    roomId: 'ALL',
    status: 'ALL',
    dateRange: 'ALL',
    sortBy: 'soonest'
  };

  /**
   * Safely load bookings from localStorage
   */
  function loadBookings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        // Genuine first run: seed demo records
        bookings = generateDefaultDemoBookings();
        saveBookings();
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          bookings = parsed;
        } else {
          bookings = generateDefaultDemoBookings();
          saveBookings();
        }
      }
    } catch (err) {
      console.error('Error reading localStorage, falling back to default:', err);
      bookings = generateDefaultDemoBookings();
    }
  }

  /**
   * Persist bookings to localStorage
   */
  function saveBookings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
      showToast('Warning: Unable to save locally (storage quota reached).', 'error');
    }
  }

  // =========================================================================
  // 3. UTILITY FUNCTIONS
  // =========================================================================

  function getTodayString() {
    return getOffsetDateString(0);
  }

  function getRoomById(id) {
    return ROOMS.find(r => r.id === id) || null;
  }

  /**
   * Parse 'HH:MM' into minutes from midnight
   */
  function timeStringToMinutes(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  }

  /**
   * Format 24h 'HH:MM' to human-friendly 12h 'h:mm AM/PM'
   */
  function format12Hour(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${suffix}`;
  }

  /**
   * Format ISO date string 'YYYY-MM-DD' into readable form
   */
  function formatDateReadable(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Escape HTML to prevent XSS injection
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Escape strings for compliant RFC 4180 CSV export
   */
  function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // =========================================================================
  // 4. CONFLICT DETECTION ENGINE
  // =========================================================================

  /**
   * Overlapping interval rule:
   * A conflict exists if and only if:
   * 1. Same facility room
   * 2. Same calendar date
   * 3. Booking is active (not cancelled)
   * 4. newStart < existingEnd AND newEnd > existingStart
   *
   * Consequently:
   * 10:00-11:00 and 11:00-12:00 in same room = ALLOWED (back-to-back)
   * 10:00-11:00 and 10:30-11:30 in same room = CONFLICT
   * Different rooms at same time = ALLOWED
   * Cancelled bookings = IGNORED
   */
  function checkBookingConflict(candidate, excludeBookingId = null) {
    const candStartMin = timeStringToMinutes(candidate.startTime);
    const candEndMin = timeStringToMinutes(candidate.endTime);

    for (const b of bookings) {
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

  // =========================================================================
  // 5. VALIDATION
  // =========================================================================

  let formElements = {};
  let errorElements = {};

  function initFormElementRefs() {
    formElements = {
      form: document.getElementById('booking-form'),
      requester: document.getElementById('field-requester'),
      purpose: document.getElementById('field-purpose'),
      room: document.getElementById('field-room'),
      date: document.getElementById('field-date'),
      startTime: document.getElementById('field-start-time'),
      endTime: document.getElementById('field-end-time'),
      attendees: document.getElementById('field-attendees'),
      generalFeedback: document.getElementById('form-general-feedback')
    };

    errorElements = {
      requester: document.getElementById('error-requester'),
      purpose: document.getElementById('error-purpose'),
      room: document.getElementById('error-room'),
      date: document.getElementById('error-date'),
      startTime: document.getElementById('error-start-time'),
      endTime: document.getElementById('error-end-time'),
      attendees: document.getElementById('error-attendees')
    };
  }

  function clearAllFormErrors() {
    Object.keys(errorElements).forEach(key => {
      if (errorElements[key]) errorElements[key].textContent = '';
    });
    Object.keys(formElements).forEach(key => {
      if (formElements[key] && formElements[key].classList) {
        formElements[key].classList.remove('is-invalid');
      }
    });
    if (formElements.generalFeedback) {
      formElements.generalFeedback.textContent = '';
      formElements.generalFeedback.className = 'form-alert hidden';
    }
  }

  function setFieldError(fieldKey, message) {
    if (errorElements[fieldKey]) {
      errorElements[fieldKey].textContent = message;
    }
    if (formElements[fieldKey]) {
      formElements[fieldKey].classList.add('is-invalid');
    }
  }

  /**
   * Comprehensive validation according to product specification
   */
  function validateBookingForm() {
    clearAllFormErrors();
    let isValid = true;
    const todayStr = getTodayString();

    const requester = formElements.requester.value.trim();
    const purpose = formElements.purpose.value.trim();
    const roomId = formElements.room.value;
    const date = formElements.date.value;
    const startTime = formElements.startTime.value;
    const endTime = formElements.endTime.value;
    const attendeesVal = formElements.attendees.value.trim();

    // 1. Requester Validation
    if (!requester) {
      setFieldError('requester', 'Requester name cannot be empty or whitespace.');
      isValid = false;
    } else if (requester.length < 2) {
      setFieldError('requester', 'Name must be at least 2 characters.');
      isValid = false;
    }

    // 2. Purpose Validation
    if (!purpose) {
      setFieldError('purpose', 'Purpose / event title cannot be empty.');
      isValid = false;
    } else if (purpose.length < 3) {
      setFieldError('purpose', 'Purpose must be at least 3 characters.');
      isValid = false;
    }

    // 3. Room Selection
    let room = null;
    if (!roomId) {
      setFieldError('room', 'Please select a campus facility.');
      isValid = false;
    } else {
      room = getRoomById(roomId);
      if (!room) {
        setFieldError('room', 'Selected room is invalid.');
        isValid = false;
      }
    }

    // 4. Date Validation
    if (!date) {
      setFieldError('date', 'Please select a booking date.');
      isValid = false;
    } else if (date < todayStr) {
      setFieldError('date', 'Cannot book slots on past dates.');
      isValid = false;
    }

    // 5. Time Validation
    let validTimes = true;
    if (!startTime) {
      setFieldError('startTime', 'Start time is required.');
      isValid = false;
      validTimes = false;
    }

    if (!endTime) {
      setFieldError('endTime', 'End time is required.');
      isValid = false;
      validTimes = false;
    }

    if (validTimes) {
      const startMin = timeStringToMinutes(startTime);
      const endMin = timeStringToMinutes(endTime);

      if (endMin <= startMin) {
        setFieldError('endTime', 'End time must be strictly after start time.');
        isValid = false;
      } else if (endMin - startMin < 15) {
        setFieldError('endTime', 'Reservation slot must be at least 15 minutes.');
        isValid = false;
      }
    }

    // 6. Attendees & Capacity Validation
    if (!attendeesVal) {
      setFieldError('attendees', 'Attendee count is required.');
      isValid = false;
    } else {
      const attendeesNum = Number(attendeesVal);
      if (!Number.isInteger(attendeesNum) || attendeesNum < 1) {
        setFieldError('attendees', 'Enter a valid whole number (minimum 1 attendee).');
        isValid = false;
      } else if (room && attendeesNum > room.capacity) {
        setFieldError('attendees', `Exceeds max room capacity of ${room.capacity} seats for ${room.name}.`);
        isValid = false;
      }
    }

    // If basic validation failed, abort before conflict check
    if (!isValid) {
      return null;
    }

    // 7. Schedule Overlap / Conflict Validation
    const candidate = {
      requester,
      purpose,
      roomId,
      date,
      startTime,
      endTime,
      attendees: parseInt(attendeesVal, 10)
    };

    const conflictResult = checkBookingConflict(candidate);
    if (conflictResult.conflict) {
      const conf = conflictResult.conflictingBooking;
      const confMsg = `Schedule Conflict: ${room.name} is already booked from ${format12Hour(conf.startTime)} to ${format12Hour(conf.endTime)} for "${conf.purpose}" (${conf.requester}).`;
      
      formElements.generalFeedback.textContent = confMsg;
      formElements.generalFeedback.className = 'form-alert form-alert-error';
      setFieldError('startTime', 'Overlaps with an existing reservation.');
      setFieldError('endTime', 'Overlaps with an existing reservation.');
      return null;
    }

    return candidate;
  }

  // =========================================================================
  // 6. UI RENDERING & DASHBOARD DERIVATION
  // =========================================================================

  /**
   * Live Clock
   */
  function updateLiveClock() {
    const clockEl = document.getElementById('current-datetime');
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' • ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Derive stats from active bookings dynamically
   */
  function renderDashboardMetrics() {
    const today = getTodayString();
    const activeBookings = bookings.filter(b => b.status === 'confirmed');
    
    // Active bookings
    document.getElementById('stat-active-count').textContent = activeBookings.length;

    // Today's bookings
    const todayActive = activeBookings.filter(b => b.date === today);
    document.getElementById('stat-today-count').textContent = todayActive.length;

    // Total attendees across confirmed bookings
    const totalPax = activeBookings.reduce((sum, b) => sum + (b.attendees || 0), 0);
    document.getElementById('stat-total-attendees').textContent = totalPax.toLocaleString();

    // Room Availability Calculation:
    // Determine how many rooms are currently occupied vs available right now
    const nowMinutes = (new Date().getHours() * 60) + new Date().getMinutes();
    const occupiedRoomIdsRightNow = new Set();

    todayActive.forEach(b => {
      const s = timeStringToMinutes(b.startTime);
      const e = timeStringToMinutes(b.endTime);
      if (nowMinutes >= s && nowMinutes < e) {
        occupiedRoomIdsRightNow.add(b.roomId);
      }
    });

    const availableCount = ROOMS.length - occupiedRoomIdsRightNow.size;
    document.getElementById('stat-available-rooms').textContent = `${availableCount} / ${ROOMS.length}`;
  }

  /**
   * Populate room selection drop-down and room directory sidebar
   */
  function renderRooms() {
    const selectEl = document.getElementById('field-room');
    const filterSelectEl = document.getElementById('filter-room');
    const directoryListEl = document.getElementById('room-directory-list');

    // Retain selected values if re-rendered
    const curVal = selectEl.value;
    const curFilterVal = filterSelectEl.value;

    selectEl.innerHTML = '<option value="">-- Choose a room --</option>';
    filterSelectEl.innerHTML = '<option value="ALL">All Facilities</option>';
    directoryListEl.innerHTML = '';

    ROOMS.forEach(room => {
      // Form Select
      const opt = document.createElement('option');
      opt.value = room.id;
      opt.textContent = `${room.name} (${room.capacity} max pax)`;
      selectEl.appendChild(opt);

      // Filter Select
      const filterOpt = document.createElement('option');
      filterOpt.value = room.id;
      filterOpt.textContent = room.name;
      filterSelectEl.appendChild(filterOpt);

      // Directory List item
      const li = document.createElement('li');
      li.className = 'room-list-item';
      li.innerHTML = `
        <div class="room-main-info">
          <span class="room-code-tag">${escapeHTML(room.id)}</span>
          <span class="room-name-text">${escapeHTML(room.name)}</span>
          <span class="room-loc-text">${escapeHTML(room.location)}</span>
        </div>
        <div>
          <span class="badge badge-neutral" title="Room Type: ${escapeHTML(room.type)}">${escapeHTML(room.type)}</span>
          <span class="badge badge-info" title="Max capacity: ${room.capacity}">${room.capacity} seats</span>
        </div>
      `;
      directoryListEl.appendChild(li);
    });

    if (curVal) selectEl.value = curVal;
    if (curFilterVal) filterSelectEl.value = curFilterVal;
  }

  /**
   * Filter and Sort current bookings
   */
  function getFilteredAndSortedBookings() {
    const today = getTodayString();
    const query = filterState.search.toLowerCase().trim();

    return bookings.filter(b => {
      const room = getRoomById(b.roomId);
      const roomName = room ? room.name.toLowerCase() : '';
      const roomLoc = room ? room.location.toLowerCase() : '';

      // Search match across purpose, requester, room name, location, and ID
      if (query) {
        const matchesQuery = 
          b.purpose.toLowerCase().includes(query) ||
          b.requester.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query) ||
          roomName.includes(query) ||
          roomLoc.includes(query);
        if (!matchesQuery) return false;
      }

      // Room filter
      if (filterState.roomId !== 'ALL' && b.roomId !== filterState.roomId) {
        return false;
      }

      // Status filter
      if (filterState.status !== 'ALL' && b.status !== filterState.status) {
        return false;
      }

      // Date filter
      if (filterState.dateRange === 'TODAY' && b.date !== today) {
        return false;
      }
      if (filterState.dateRange === 'UPCOMING' && b.date < today) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'soonest') {
        // Earliest date first, then earliest start time
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      } else if (filterState.sortBy === 'furthest') {
        // Latest date first, then latest start time
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.startTime.localeCompare(a.startTime);
      } else if (filterState.sortBy === 'created_desc') {
        // Newest created first
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      }
      return 0;
    });
  }

  /**
   * Render Bookings Table
   */
  function renderBookingsTable() {
    const tbody = document.getElementById('bookings-tbody');
    const emptyState = document.getElementById('empty-state');
    const countText = document.getElementById('results-count-text');
    const resetFiltersBtn = document.getElementById('btn-reset-filters');

    const filtered = getFilteredAndSortedBookings();

    // Check if any filters are active
    const isFiltered = (
      filterState.search.trim() !== '' ||
      filterState.roomId !== 'ALL' ||
      filterState.status !== 'ALL' ||
      filterState.dateRange !== 'ALL'
    );
    resetFiltersBtn.classList.toggle('hidden', !isFiltered);

    countText.textContent = `Showing ${filtered.length} of ${bookings.length} reservations`;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = filtered.map(b => {
      const room = getRoomById(b.roomId);
      const isCancelled = b.status === 'cancelled';
      const statusBadge = isCancelled 
        ? `<span class="badge badge-danger">Cancelled</span>`
        : `<span class="badge badge-success">Active</span>`;

      return `
        <tr class="${isCancelled ? 'row-cancelled' : ''}" data-booking-id="${escapeHTML(b.id)}">
          <td>${statusBadge}</td>
          <td>
            <div class="cell-time">${format12Hour(b.startTime)} – ${format12Hour(b.endTime)}</div>
            <div class="cell-date">${formatDateReadable(b.date)}</div>
          </td>
          <td>
            <div class="cell-room-badge">
              <span class="font-bold">${escapeHTML(room ? room.name : b.roomId)}</span>
              <span class="text-muted text-sm">${escapeHTML(room ? room.location : '')}</span>
            </div>
          </td>
          <td class="cell-purpose font-bold">${escapeHTML(b.purpose)}</td>
          <td class="cell-requester">${escapeHTML(b.requester)}</td>
          <td>
            <span class="badge badge-neutral">${b.attendees} / ${room ? room.capacity : '?'}</span>
          </td>
          <td class="text-right">
            <div class="cell-actions">
              <button 
                type="button" 
                class="btn btn-sm btn-action-view" 
                data-action="view-detail" 
                data-id="${escapeHTML(b.id)}"
                title="View full booking dossier"
              >
                Details
              </button>
              ${
                !isCancelled 
                  ? `<button 
                      type="button" 
                      class="btn btn-sm btn-action-cancel" 
                      data-action="prompt-cancel" 
                      data-id="${escapeHTML(b.id)}"
                      title="Cancel this reservation"
                    >
                      Cancel
                    </button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Synchronize the entire user interface
   */
  function refreshUI() {
    renderDashboardMetrics();
    renderBookingsTable();
  }

  // =========================================================================
  // 7. TOAST FEEDBACK NOTIFICATIONS
  // =========================================================================

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  // =========================================================================
  // 8. CSV EXPORT
  // =========================================================================

  function exportFilteredBookingsToCSV() {
    const dataToExport = getFilteredAndSortedBookings();

    if (dataToExport.length === 0) {
      showToast('No bookings match the current filter to export.', 'warning');
      return;
    }

    const headers = [
      'Booking ID',
      'Purpose / Title',
      'Requester Name',
      'Facility ID',
      'Facility Name',
      'Facility Location',
      'Date',
      'Start Time',
      'End Time',
      'Attendees',
      'Room Capacity',
      'Status',
      'Created At Timestamp'
    ];

    const rows = dataToExport.map(b => {
      const room = getRoomById(b.roomId);
      return [
        escapeCSV(b.id),
        escapeCSV(b.purpose),
        escapeCSV(b.requester),
        escapeCSV(b.roomId),
        escapeCSV(room ? room.name : ''),
        escapeCSV(room ? room.location : ''),
        escapeCSV(b.date),
        escapeCSV(b.startTime),
        escapeCSV(b.endTime),
        escapeCSV(b.attendees),
        escapeCSV(room ? room.capacity : ''),
        escapeCSV(b.status),
        escapeCSV(b.createdAt)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', url);
    const timeStamp = new Date().toISOString().slice(0, 10);
    downloadLink.setAttribute('download', `CampusSlot_Bookings_${timeStamp}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    showToast(`Exported ${dataToExport.length} bookings to CSV.`, 'success');
  }

  // =========================================================================
  // 9. MODALS & DETAIL VIEWS
  // =========================================================================

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      // Focus the close button or first action
      const closeBtn = modal.querySelector('button');
      if (closeBtn) closeBtn.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function setupModalDismissal() {
    // Backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-close-modal');
        closeModal(`modal-${type}`);
      });
    });

    // Escape key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['modal-detail', 'modal-cancel', 'modal-reset'].forEach(closeModal);
      }
    });
  }

  function showBookingDetails(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const room = getRoomById(booking.roomId);
    const contentEl = document.getElementById('modal-detail-content');

    const isCancelled = booking.status === 'cancelled';
    const statusMarkup = isCancelled
      ? '<span class="badge badge-danger">Cancelled</span>'
      : '<span class="badge badge-success">Active / Confirmed</span>';

    contentEl.innerHTML = `
      <div class="detail-grid">
        <div class="detail-label">Booking ID</div>
        <div class="detail-value font-bold">${escapeHTML(booking.id)}</div>

        <div class="detail-label">Status</div>
        <div class="detail-value">${statusMarkup}</div>

        <div class="detail-label">Purpose / Event</div>
        <div class="detail-value font-bold">${escapeHTML(booking.purpose)}</div>

        <div class="detail-label">Requester</div>
        <div class="detail-value">${escapeHTML(booking.requester)}</div>

        <div class="detail-label">Facility / Room</div>
        <div class="detail-value">
          <strong>${escapeHTML(room ? room.name : booking.roomId)}</strong>
          <br><span class="text-muted text-sm">${escapeHTML(room ? room.location : '')}</span>
          <br><span class="badge badge-neutral text-sm">${escapeHTML(room ? room.type : '')} • Max Capacity: ${room ? room.capacity : 'N/A'}</span>
        </div>

        <div class="detail-label">Date</div>
        <div class="detail-value">${formatDateReadable(booking.date)} (${escapeHTML(booking.date)})</div>

        <div class="detail-label">Time Interval</div>
        <div class="detail-value font-bold">${format12Hour(booking.startTime)} – ${format12Hour(booking.endTime)}</div>

        <div class="detail-label">Attendees</div>
        <div class="detail-value">${booking.attendees} attendees registered</div>

        <div class="detail-label">Registered At</div>
        <div class="detail-value text-muted text-sm">${new Date(booking.createdAt).toLocaleString()}</div>
      </div>
    `;

    openModal('modal-detail');
  }

  function promptCancelBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || booking.status === 'cancelled') return;

    pendingCancelBookingId = bookingId;
    const room = getRoomById(booking.roomId);

    const summaryBox = document.getElementById('cancel-summary-details');
    summaryBox.innerHTML = `
      <div><strong>${escapeHTML(booking.purpose)}</strong> (${escapeHTML(booking.id)})</div>
      <div class="text-sm">Facility: <strong>${escapeHTML(room ? room.name : booking.roomId)}</strong></div>
      <div class="text-sm">Date &amp; Time: ${formatDateReadable(booking.date)} @ ${format12Hour(booking.startTime)} - ${format12Hour(booking.endTime)}</div>
      <div class="text-sm">Requested by: ${escapeHTML(booking.requester)}</div>
    `;

    openModal('modal-cancel');
  }

  function confirmCancelBooking() {
    if (!pendingCancelBookingId) return;

    const index = bookings.findIndex(b => b.id === pendingCancelBookingId);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
      bookings[index].cancelledAt = new Date().toISOString();
      saveBookings();
      refreshUI();
      showToast(`Reservation #${pendingCancelBookingId} cancelled. Slot is now free.`, 'info');
    }

    pendingCancelBookingId = null;
    closeModal('modal-cancel');
  }

  // =========================================================================
  // 10. FORM SUBMISSION & HANDLING
  // =========================================================================

  function handleCreateBooking(e) {
    e.preventDefault();

    const validatedData = validateBookingForm();
    if (!validatedData) {
      return;
    }

    // Generate unique ID with collision safety
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `CS-${timestamp}-${randomSuffix}`;

    const newBooking = {
      id: newId,
      requester: validatedData.requester,
      purpose: validatedData.purpose,
      roomId: validatedData.roomId,
      date: validatedData.date,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      attendees: validatedData.attendees,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Prepend to top of bookings
    bookings.unshift(newBooking);
    saveBookings();
    refreshUI();

    showToast(`Slot reserved successfully! Booking ID: ${newId}`, 'success');

    // Reset Form
    formElements.form.reset();
    clearAllFormErrors();
    formElements.date.value = getTodayString();
    updateRoomPreviewBox();
  }

  function updateRoomPreviewBox() {
    const previewBox = document.getElementById('room-detail-preview');
    const roomId = formElements.room.value;
    if (!roomId) {
      previewBox.classList.add('hidden');
      return;
    }

    const room = getRoomById(roomId);
    if (!room) {
      previewBox.classList.add('hidden');
      return;
    }

    document.getElementById('preview-room-name').textContent = room.name;
    document.getElementById('preview-room-loc').textContent = room.location;
    document.getElementById('preview-room-cap').textContent = `Max ${room.capacity} seats`;
    document.getElementById('preview-room-type').textContent = room.type;
    previewBox.classList.remove('hidden');

    // Auto-update attendees input max attribute
    formElements.attendees.setAttribute('max', room.capacity);
  }

  // =========================================================================
  // 11. EVENT LISTENERS & INITIALIZATION
  // =========================================================================

  function setupEventListeners() {
    // Clock update timer
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // Form room change preview
    formElements.room.addEventListener('change', updateRoomPreviewBox);

    // Form submission
    formElements.form.addEventListener('submit', handleCreateBooking);

    // Clear form button
    document.getElementById('btn-clear-form').addEventListener('click', () => {
      formElements.form.reset();
      clearAllFormErrors();
      formElements.date.value = getTodayString();
      updateRoomPreviewBox();
    });

    // Real-time error dismissal on field input
    ['requester', 'purpose', 'date', 'startTime', 'endTime', 'attendees'].forEach(key => {
      const el = formElements[key];
      if (el) {
        el.addEventListener('input', () => {
          if (errorElements[key]) errorElements[key].textContent = '';
          el.classList.remove('is-invalid');
          if (formElements.generalFeedback) {
            formElements.generalFeedback.textContent = '';
            formElements.generalFeedback.className = 'form-alert hidden';
          }
        });
      }
    });

    // Filter toolbar controls
    document.getElementById('filter-search').addEventListener('input', (e) => {
      filterState.search = e.target.value;
      renderBookingsTable();
    });

    document.getElementById('filter-room').addEventListener('change', (e) => {
      filterState.roomId = e.target.value;
      renderBookingsTable();
    });

    document.getElementById('filter-status').addEventListener('change', (e) => {
      filterState.status = e.target.value;
      renderBookingsTable();
    });

    document.getElementById('filter-date').addEventListener('change', (e) => {
      filterState.dateRange = e.target.value;
      renderBookingsTable();
    });

    document.getElementById('sort-by').addEventListener('change', (e) => {
      filterState.sortBy = e.target.value;
      renderBookingsTable();
    });

    // Reset filters button
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
      filterState.search = '';
      filterState.roomId = 'ALL';
      filterState.status = 'ALL';
      filterState.dateRange = 'ALL';

      document.getElementById('filter-search').value = '';
      document.getElementById('filter-room').value = 'ALL';
      document.getElementById('filter-status').value = 'ALL';
      document.getElementById('filter-date').value = 'ALL';
      renderBookingsTable();
    });

    // Export CSV
    document.getElementById('btn-export-csv').addEventListener('click', exportFilteredBookingsToCSV);

    // Table Actions (delegated)
    document.getElementById('bookings-tbody').addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const bookingId = target.getAttribute('data-id');

      if (action === 'view-detail') {
        showBookingDetails(bookingId);
      } else if (action === 'prompt-cancel') {
        promptCancelBooking(bookingId);
      }
    });

    // Confirm cancel action
    document.getElementById('btn-confirm-cancellation').addEventListener('click', confirmCancelBooking);

    // Reset demo button trigger
    document.getElementById('btn-reset-demo').addEventListener('click', () => {
      openModal('modal-reset');
    });

    // Confirm reset demo action
    document.getElementById('btn-confirm-reset').addEventListener('click', () => {
      bookings = generateDefaultDemoBookings();
      saveBookings();
      refreshUI();
      closeModal('modal-reset');
      showToast('System reset to demo dataset.', 'info');
    });

    setupModalDismissal();
  }

  // Initialization
  function init() {
    initFormElementRefs();
    loadBookings();
    renderRooms();
    
    // Set default date picker to today and min to today
    const today = getTodayString();
    if (formElements.date) {
      formElements.date.value = today;
      formElements.date.min = today;
    }

    setupEventListeners();
    refreshUI();
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
