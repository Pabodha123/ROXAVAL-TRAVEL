const env = require('../config/env');

/**
 * Generic branded wrapper for every transactional notification email.
 * Kept deliberately simple (matches the existing password-reset email's
 * plain inline-HTML style) rather than a full template system, since every
 * notify() call site already supplies title/message/link and nothing more.
 */
const itineraryTable = (itinerary) => {
  if (!itinerary?.days?.length) return '';
  const rows = itinerary.days
    .map(
      (d) => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600; color:#0f3d2e; vertical-align:top;">Day ${d.dayNumber}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; color:#333;">
            <strong>${d.title}</strong><br/>
            <span style="color:#555;">${d.schedule || ''}</span>
            ${d.meals?.length ? `<br/><span style="color:#999; font-size:12px;">Meals: ${d.meals.join(', ')}</span>` : ''}
          </td>
        </tr>`
    )
    .join('');
  return `
    <table style="width:100%; border-collapse:collapse; margin-top:16px;">
      <tbody>${rows}</tbody>
    </table>
  `;
};

/**
 * Generic branded wrapper for every transactional notification email.
 * Kept deliberately simple (matches the existing password-reset email's
 * plain inline-HTML style) rather than a full template system, since every
 * notify() call site already supplies title/message/link and nothing more.
 * When `itinerary` is passed (only the itinerary_ready notification does
 * this today), a day-by-day summary table is rendered inline.
 */
const notificationEmail = ({ title, message, link, itinerary }) => {
  const url = link ? (link.startsWith('http') ? link : `${env.CLIENT_URL}${link}`) : '';
  return `
    <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <p style="color:#0f3d2e; font-size:18px; font-weight:600; margin-bottom:4px;">${env.COMPANY.name}</p>
      <h2 style="color:#0f3d2e; margin-top:24px;">${title}</h2>
      <p style="color:#333; line-height:1.6;">${message}</p>
      ${itineraryTable(itinerary)}
      ${url ? `<p style="margin-top:20px;"><a href="${url}" style="background:#c8a24c; color:#0f3d2e; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600; display:inline-block;">View Details</a></p>` : ''}
      <p style="color:#999; font-size:12px; margin-top:32px;">${env.COMPANY.name}${env.COMPANY.phone ? ` &middot; ${env.COMPANY.phone}` : ''}${env.COMPANY.email ? ` &middot; ${env.COMPANY.email}` : ''}</p>
    </div>
  `;
};

/**
 * Email accompanying a hotel voucher PDF attachment. `audience` swaps the
 * tone: 'hotel' asks the hotel to confirm the reservation (matching the
 * register travel agencies typically use with partner hotels), 'customer'
 * is a simple informational copy.
 */
const hotelVoucherEmail = ({ voucher, audience }) => {
  const stayLine = `${new Date(voucher.checkInDate).toDateString()} &rarr; ${new Date(voucher.checkOutDate).toDateString()} (${voucher.nights} night${voucher.nights === 1 ? '' : 's'})`;
  const intro =
    audience === 'hotel'
      ? `Kindly confirm the reservation as per the details below and the attached voucher. If any rooms are sold out or the rate has changed, please let us know immediately.`
      : `Please find your hotel voucher for ${voucher.hotelSnapshot.name} attached. Present this voucher (printed or on your phone) at check-in.`;

  return `
    <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <p style="color:#0f3d2e; font-size:18px; font-weight:600; margin-bottom:4px;">${env.COMPANY.name}</p>
      <h2 style="color:#0f3d2e; margin-top:24px;">${audience === 'hotel' ? 'Hotel Reservation Request' : 'Your Hotel Voucher'}</h2>
      <p style="color:#333; line-height:1.6;">${intro}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 0; color:#999;">Voucher No</td><td style="padding:6px 0; color:#333; font-weight:600;">${voucher.voucherNumber}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Guest Name</td><td style="padding:6px 0; color:#333;">${voucher.customerName}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Hotel</td><td style="padding:6px 0; color:#333;">${voucher.hotelSnapshot.name}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Stay</td><td style="padding:6px 0; color:#333;">${stayLine}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Room</td><td style="padding:6px 0; color:#333;">${voucher.numberOfRooms} &times; ${voucher.roomType || 'Standard'} (${voucher.mealPlan})</td></tr>
        </tbody>
      </table>
      <p style="color:#999; font-size:12px; margin-top:32px;">${env.COMPANY.name}${env.COMPANY.phone ? ` &middot; ${env.COMPANY.phone}` : ''}${env.COMPANY.email ? ` &middot; ${env.COMPANY.email}` : ''}</p>
    </div>
  `;
};

/**
 * Sent to the company inbox whenever a visitor submits the public Contact
 * Us form (backend/src/controllers/contact.controller.js).
 */
const contactInquiryEmail = ({ name, email, phone, subject, message }) => {
  return `
    <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <p style="color:#0f3d2e; font-size:18px; font-weight:600; margin-bottom:4px;">${env.COMPANY.name}</p>
      <h2 style="color:#0f3d2e; margin-top:24px;">New Contact Us Inquiry</h2>
      <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 0; color:#999; width:90px;">Name</td><td style="padding:6px 0; color:#333; font-weight:600;">${name}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">Email</td><td style="padding:6px 0; color:#333;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:6px 0; color:#999;">Phone</td><td style="padding:6px 0; color:#333;">${phone}</td></tr>` : ''}
          <tr><td style="padding:6px 0; color:#999;">Subject</td><td style="padding:6px 0; color:#333;">${subject}</td></tr>
        </tbody>
      </table>
      <p style="color:#333; line-height:1.6; margin-top:16px; white-space:pre-wrap;">${message}</p>
    </div>
  `;
};

module.exports = { notificationEmail, hotelVoucherEmail, contactInquiryEmail };
