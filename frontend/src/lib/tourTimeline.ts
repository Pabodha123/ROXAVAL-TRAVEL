// Canonical timeline stages for the custom-tour journey, derived entirely
// from real backend enums (CustomTourRequest.status, Itinerary.status,
// Booking.status) — no invented status strings. Two views share one
// resolver family: a 5-stage "this request" view and a 7-stage "whole tour"
// view that continues past booking creation using the linked Booking's own
// status (booking.service.js flips CustomTourRequest.status to
// 'Booking Confirmed' the instant a Booking is created, so the request's
// own status can't distinguish "just booked" from "trip completed" —
// the Booking status picks up from there).

export interface TimelineStage {
  key: string;
  label: string;
}

export interface TimelineResult {
  stages: TimelineStage[];
  currentIndex: number;
  halted: boolean;
  haltedLabel?: string;
  caption?: string;
}

export const REQUEST_STAGES: TimelineStage[] = [
  { key: 'submitted', label: 'Inquiry Submitted' },
  { key: 'reviewing', label: 'Admin Reviewing' },
  { key: 'prepared', label: 'Itinerary Prepared' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'booked', label: 'Booking Confirmed' },
];

export const FULL_STAGES: TimelineStage[] = [
  { key: 'submitted', label: 'Inquiry' },
  { key: 'reviewing', label: 'Planning' },
  { key: 'prepared', label: 'Updated' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'payment', label: 'Payment' },
  { key: 'booked', label: 'Booked' },
  { key: 'completed', label: 'Completed' },
];

type RequestStatus = 'Pending' | 'Under Review' | 'Awaiting Customer Approval' | 'Approved' | 'Rejected' | 'Booking Confirmed' | string;
type ItineraryStatus = 'Draft' | 'Sent' | 'Changes Requested' | 'Accepted' | 'Rejected' | string;
type BookingStatus = 'Pending' | 'Awaiting Approval' | 'Approved' | 'Payment Pending' | 'Payment Verification' | 'Confirmed' | 'Completed' | 'Cancelled' | string;

export function resolveRequestStage({
  requestStatus,
  itineraryStatus,
}: {
  requestStatus: RequestStatus;
  itineraryStatus?: ItineraryStatus;
}): TimelineResult {
  if (requestStatus === 'Rejected') {
    return { stages: REQUEST_STAGES, currentIndex: 2, halted: true, haltedLabel: 'Rejected' };
  }

  const indexByStatus: Record<string, number> = {
    Pending: 0,
    'Under Review': 1,
    'Awaiting Customer Approval': 2,
    Approved: 3,
    'Booking Confirmed': 4,
  };
  const currentIndex = indexByStatus[requestStatus] ?? 0;

  const caption =
    currentIndex === 2 && (itineraryStatus === 'Sent' || itineraryStatus === 'Changes Requested') ?
    'Waiting for your response' :
    undefined;

  return { stages: REQUEST_STAGES, currentIndex, halted: false, caption };
}

export function resolveFullStage({
  requestStatus,
  itineraryStatus,
  bookingStatus,
}: {
  requestStatus: RequestStatus;
  itineraryStatus?: ItineraryStatus;
  bookingStatus?: BookingStatus | null;
}): TimelineResult {
  if (requestStatus === 'Rejected') {
    return { stages: FULL_STAGES, currentIndex: 2, halted: true, haltedLabel: 'Rejected' };
  }
  if (bookingStatus === 'Cancelled') {
    return { stages: FULL_STAGES, currentIndex: 4, halted: true, haltedLabel: 'Cancelled' };
  }

  if (requestStatus !== 'Booking Confirmed' || !bookingStatus) {
    const preBookingIndex: Record<string, number> = {
      Pending: 0,
      'Under Review': 1,
      'Awaiting Customer Approval': 2,
      Approved: 3,
    };
    const currentIndex = preBookingIndex[requestStatus] ?? 0;
    const caption =
      currentIndex === 2 && (itineraryStatus === 'Sent' || itineraryStatus === 'Changes Requested') ?
      'Waiting for your response' :
      undefined;
    return { stages: FULL_STAGES, currentIndex, halted: false, caption };
  }

  const postBookingIndex: Record<string, number> = {
    Pending: 4,
    'Awaiting Approval': 4,
    Approved: 4,
    'Payment Pending': 4,
    'Payment Verification': 4,
    Confirmed: 5,
    Completed: 6,
  };
  const currentIndex = postBookingIndex[bookingStatus] ?? 4;

  return { stages: FULL_STAGES, currentIndex, halted: false };
}
