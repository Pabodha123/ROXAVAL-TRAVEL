const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const { sendEmail } = require('../utils/email');
const { newsletterSubscriptionEmail } = require('../utils/emailTemplates');

// Public: "Get travel inspiration in your inbox" footer form
const subscribe = catchAsync(async (req, res) => {
  const { email } = req.body;

  await sendEmail({
    to: env.COMPANY.email || 'info@roxavaltravels.com',
    subject: 'New Newsletter Subscription',
    html: newsletterSubscriptionEmail({ email }),
  });

  new ApiResponse(200, null, "You're subscribed! Watch your inbox for travel inspiration.").send(res);
});

module.exports = { subscribe };
