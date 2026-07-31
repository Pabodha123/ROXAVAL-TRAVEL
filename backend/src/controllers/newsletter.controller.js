const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { sendEmail } = require('../utils/email');
const { newsletterSubscriptionEmail } = require('../utils/emailTemplates');

// Newsletter sign-ups always go to this inbox, independent of the
// admin-configurable COMPANY_EMAIL used for general contact inquiries.
const NEWSLETTER_INBOX = 'info@roxavaltravels.com';

// Public: "Get travel inspiration in your inbox" footer form
const subscribe = catchAsync(async (req, res) => {
  const { email } = req.body;

  await sendEmail({
    to: NEWSLETTER_INBOX,
    subject: 'New Newsletter Subscription',
    html: newsletterSubscriptionEmail({ email }),
  });

  new ApiResponse(200, null, "You're subscribed! Watch your inbox for travel inspiration.").send(res);
});

module.exports = { subscribe };
