const env = require('../config/env');
const { t } = require('../i18n/strings');

/**
 * Generic branded wrapper for every transactional notification email.
 * Kept deliberately simple (matches the existing password-reset email's
 * plain inline-HTML style) rather than a full template system, since every
 * notify() call site already supplies title/message/link and nothing more.
 */
const itineraryTable = (itinerary, lang) => {
  if (!itinerary?.days?.length) return '';
  const s = t(lang, 'email');
  const rows = itinerary.days
    .map(
      (d) => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:600; color:#0f3d2e; vertical-align:top;">${s.day} ${d.dayNumber}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; color:#333;">
            <strong>${d.title}</strong><br/>
            <span style="color:#555;">${d.schedule || ''}</span>
            ${d.meals?.length ? `<br/><span style="color:#999; font-size:12px;">${s.meals}: ${d.meals.join(', ')}</span>` : ''}
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
const notificationEmail = ({ title, message, link, itinerary, lang = 'en' }) => {
  const s = t(lang, 'email');
  const url = link ? (link.startsWith('http') ? link : `${env.CLIENT_URL}${link}`) : '';
  return `
    <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <p style="color:#0f3d2e; font-size:18px; font-weight:600; margin-bottom:4px;">${env.COMPANY.name}</p>
      <h2 style="color:#0f3d2e; margin-top:24px;">${title}</h2>
      <p style="color:#333; line-height:1.6;">${message}</p>
      ${itineraryTable(itinerary, lang)}
      ${url ? `<p style="margin-top:20px;"><a href="${url}" style="background:#c8a24c; color:#0f3d2e; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600; display:inline-block;">${s.viewDetails}</a></p>` : ''}
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
const hotelVoucherEmail = ({ voucher, audience, lang = 'en' }) => {
  const s = t(lang, 'email');
  const stayLine = `${new Date(voucher.checkInDate).toDateString()} &rarr; ${new Date(voucher.checkOutDate).toDateString()} (${s.nights(voucher.nights)})`;
  const intro = audience === 'hotel' ? s.hotelConfirmIntro : s.customerVoucherIntro(voucher.hotelSnapshot.name);

  return `
    <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <p style="color:#0f3d2e; font-size:18px; font-weight:600; margin-bottom:4px;">${env.COMPANY.name}</p>
      <h2 style="color:#0f3d2e; margin-top:24px;">${audience === 'hotel' ? s.hotelReservationRequest : s.yourHotelVoucher}</h2>
      <p style="color:#333; line-height:1.6;">${intro}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 0; color:#999;">${s.voucherNo}</td><td style="padding:6px 0; color:#333; font-weight:600;">${voucher.voucherNumber}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">${s.guestName}</td><td style="padding:6px 0; color:#333;">${voucher.customerName}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">${s.hotel}</td><td style="padding:6px 0; color:#333;">${voucher.hotelSnapshot.name}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">${s.stay}</td><td style="padding:6px 0; color:#333;">${stayLine}</td></tr>
          <tr><td style="padding:6px 0; color:#999;">${s.room}</td><td style="padding:6px 0; color:#333;">${voucher.numberOfRooms} &times; ${voucher.roomType || s.standard} (${voucher.mealPlan})</td></tr>
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
