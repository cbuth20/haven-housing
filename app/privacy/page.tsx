import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none space-y-6">
        <p>
          At Haven Housing Solutions, we respect your privacy and are committed to protecting your personal information.
          This Privacy Policy outlines how we collect, use, and protect the information you provide us.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p>
            We collect contact information through our website&apos;s contact form, including your name, email address,
            and phone number. This information is essential for communicating with you regarding business operations,
            answering inquiries, confirming appointments, and providing updates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p>We use your contact information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To respond to your inquiries and questions.</li>
            <li>To communicate updates and confirmations related to appointments and business operations.</li>
            <li>To maintain internal business records.</li>
          </ul>
          <p className="mt-4">
            We may share your contact information within Haven Housing Solutions for legitimate business purposes.
            However, we do not share, sell, or disclose your information to third parties or affiliates for marketing
            or promotional purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
          <p>
            SMS Terms and Conditions & Privacy Policy Upon messaging opt-in, the end user agrees to receive messages
            from Haven Housing Solutions regarding temporary housing services. End users can opt-out by replying STOP
            or request more information by replying HELP. Message frequency varies. Message and data rates may apply.
            If you need assistance or have questions about our SMS service, reply with &quot;HELP&quot; to any SMS message you
            receive, or contact our customer support team at{' '}
            <a href="mailto:support@havenhousingsolutions.com" className="text-blue-600 hover:underline">
              support@havenhousingsolutions.com
            </a>
            . No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.
            All the stated categories in this privacy policy exclude text messaging originator opt-in data and consent;
            this information will not be shared with any third parties. End users can opt out of receiving further messages
            by replying STOP or ask for more information by replying HELP. Message frequency varies. Message and data rates
            may apply.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">SMS Terms and Conditions</h2>
          <p>You have the right to opt out of receiving communications from us at any time. To do so, you can:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Reply to any message with &quot;STOP&quot; to discontinue text communications.</li>
            <li>
              Email us at{' '}
              <a href="mailto:support@havenhousingsolutions.com" className="text-blue-600 hover:underline">
                support@havenhousingsolutions.com
              </a>{' '}
              to opt out of further contact.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Opt Out</h2>
          <p>
            If you wish to review, update, or request changes to your personal information, please contact us at{' '}
            <a href="mailto:support@havenhousingsolutions.com" className="text-blue-600 hover:underline">
              support@havenhousingsolutions.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Your Information</h2>
          <p>
            For further information about our privacy practices or if you have any concerns, please email us at{' '}
            <a href="mailto:support@havenhousingsolutions.com" className="text-blue-600 hover:underline">
              support@havenhousingsolutions.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
