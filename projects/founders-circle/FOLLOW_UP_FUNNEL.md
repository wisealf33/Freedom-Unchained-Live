# Founders Circle Follow-Up Funnel

This is the practical follow-up flow for people who apply to Founders Circle. The dashboard already tracks these stages: Applied, Details Completed, Call Booked, Approved, Weekly Call Invite Sent, Weekly Call Confirmed, PMA Sent, Payment, Member, and Declined.

## Funnel Stages

1. Applied
   Someone submitted the first application form, but has not booked an alignment call yet.

2. Call Booked
   Someone chose an alignment-call time. This should immediately send a confirmation with Garrett's Central Time and the applicant's local time.

3. Details Completed
   Someone completed the pre-call questions. This gives Garrett context before the alignment call.

4. Approved
   Garrett has reviewed the person and wants to invite them forward.

5. Weekly Call Invite Sent
   Garrett has invited the approved applicant to reply with availability for the first weekly Founders Circle call.

6. Weekly Call Confirmed
   The applicant has replied or otherwise confirmed they want to be included in the weekly call timing.

7. PMA Sent
   The applicant has been sent to the private membership agreement step.

8. Payment
   The applicant is working through the membership payment path.

9. Member
   The person completed the membership path.

10. Declined
   Garrett decided not to move them forward, or they opted out.

## Recommended Automations

### Applied, but no alignment call booked

Send immediately after the first application:

Subject: Your Founders Circle application was received

Hi {{first_name}},

Thank you for applying to Founders Circle. I received your information and the next step is to schedule a short alignment call.

The call is a 15-20 minute conversation to make sure there is a real values fit before we move toward the private membership agreement or payment step.

You can choose a time here:
{{alignment_call_link}}

Once you book, you will receive the call time in your timezone, and I will see it in Central Time on my calendar.

With appreciation,
Garrett

Follow-up timing if no call is booked:

- 2 hours after applying: gentle reminder to book the alignment call.
- 24 hours after applying: second reminder with a clearer "next step" message.
- 3 days after applying: final personal nudge, then stop unless Garrett wants manual follow-up.

### Alignment call booked

Send immediately after someone books:

Subject: Your Founders Circle alignment call is booked

Hi {{first_name}},

Your Founders Circle alignment call is booked.

Your time:
{{applicant_date}} at {{applicant_time}} {{applicant_timezone}}

Garrett's time:
{{central_date}} at {{central_time}} Central Time

This will be a short 15-20 minute conversation about your project, your alignment with the circle, and whether the next step makes sense.

Before the call, please complete the short pre-call questions if you have not already:
{{details_link}}

If something changes and you cannot make the call, reply to this email so we can find another time.

With appreciation,
Garrett

Reminder timing:

- Immediately after booking: confirmation email.
- 24 hours before the call: reminder with time and timezone.
- 2 hours before the call: short reminder.

### Details completed

Send after pre-call questions are submitted:

Subject: I received your pre-call answers

Hi {{first_name}},

Thank you for completing the pre-call questions. I have your answers and will review them before our alignment conversation.

The call will focus on fit, contribution, values, and whether Founders Circle is the right next step for both of us.

With appreciation,
Garrett

### Approved after call

Send manually or automatically when Garrett marks someone Approved:

Subject: Next step for Founders Circle

Hi {{first_name}},

Thank you for taking the time to connect. I feel there is enough alignment to invite you into the next step.

The next step is to review and complete the private membership agreement. Once that is complete, you can move into the membership/payment step.

Private membership agreement:
{{pma_link}}

With appreciation,
Garrett

### Weekly call invite

Send when Garrett marks someone Weekly Call Invite Sent:

Subject: First Founders Circle weekly call

Hi {{first_name}},

I am glad to invite you into the next step for Founders Circle.

I am organizing the first weekly call now and want to find a time that works for the approved founding members.

Can you reply with the best days and times for you over the next week?

Once I hear back from everyone, I will choose the strongest recurring time and send the calendar details.

With appreciation,
Garrett

### PMA sent, but not completed

Send 24 hours after PMA Sent if agreement is not signed:

Subject: Founders Circle agreement next step

Hi {{first_name}},

Just a quick reminder that the next step is reviewing and completing the private membership agreement.

You can continue here:
{{pma_link}}

Once that is complete, you will be able to move into the membership/payment step.

With appreciation,
Garrett

### Payment started, but not completed

Send 24 hours after Payment if payment is not submitted:

Subject: Founders Circle membership payment

Hi {{first_name}},

You are at the membership payment step for Founders Circle.

You can continue here:
{{payment_link}}

If you are using crypto or Bridge Bucks and have questions before sending payment, reply here before submitting.

With appreciation,
Garrett

### Member welcome

Send once marked Member:

Subject: Welcome to Founders Circle

Hi {{first_name}},

Welcome to Founders Circle. I am glad to have you inside the circle.

This space is for serious founders, builders, and contributors who want to support one another's real projects with integrity, discernment, and practical action.

I will follow up with the next member steps and any private access details.

With appreciation,
Garrett

## Implementation Notes

- Use SendFox for marketing/funnel follow-up lists once the SendFox token and stage list IDs are configured.
- Use Resend for transactional emails, like instant admin notifications and booking confirmations.
- The system should move people into the right email segment when their stage changes.
- Avoid sending every email forever. Most reminder paths should stop after two or three nudges unless Garrett wants manual follow-up.
- Every email should include a clear single next step.
