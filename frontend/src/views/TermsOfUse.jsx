import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar alwaysOpaque={true} />

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#364a6b] hover:text-[#2a3a54] mb-8 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Terms of Use Content */}
          <h1 className="text-4xl font-bold text-[#1e293b] mb-4">
            Terms of Use
          </h1>
          <p className="text-lg text-[#64748b] mb-8">
            Effective date: March 2026
          </p>

          <div className="text-[#475569] leading-relaxed space-y-6">
            <p>
              Welcome to SkinX, an innovative AI-powered skin analysis platform
              developed by a newly building startup based in Dhaka, Bangladesh
              ("Company", "we", "us", or "our"). These Terms of Use ("Terms")
              constitute a legally binding agreement between you ("you", "your",
              or "User") and our company governing your access to and use of our
              website located at https://skinx.tech (the "Site") and any
              services, applications, tools, content, and features made
              available through the Site (collectively, the "Services").
            </p>

            <p>
              By accessing or using our Services, you acknowledge that you have
              read, understood, and agreed to be bound by these Terms. If you do
              not agree to these Terms, please do not use or access our
              Services.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              1. Eligibility and User Obligations
            </h3>
            <p>
              To use our Services, you must be at least 18 years old, or the age
              of legal majority in your jurisdiction. By using the Services, you
              represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You are legally capable of entering into binding contracts;
              </li>
              <li>
                You will comply with these Terms and all applicable laws and
                regulations;
              </li>
              <li>
                You are using the Services solely for personal, non-commercial
                use unless expressly authorized.
              </li>
            </ul>
            <p>
              If you are using the Services on behalf of a company or legal
              entity, you represent that you have the authority to bind that
              entity to these Terms.
            </p>
            <p>
              You agree to use the Services only for their intended purpose and
              in accordance with all applicable laws, rules, and regulations.
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use the Services in any way that may infringe the rights of
                others or restrict or inhibit their use of the Services;
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Services
                or any other systems or networks connected to the Services;
              </li>
              <li>
                Use bots, crawlers, or other automated methods to access the
                Services;
              </li>
              <li>Transmit or upload viruses or other harmful code.</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              2. Nature of the Services
            </h3>
            <p>
              SkinX provides AI-powered skin analysis tools that help users
              identify potential dermatological conditions or skin concerns
              based on user-submitted photos and information. These Services are
              intended solely for informational and educational purposes and are
              not a substitute for professional medical evaluation, diagnosis,
              or treatment.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <p className="font-semibold text-[#1e293b] mb-2">
                Important Notice:
              </p>
              <p>
                The information provided through the Services is generated by
                artificial intelligence algorithms and is not reviewed or
                verified by licensed dermatologists. Always consult a licensed
                medical professional or dermatologist for clinical diagnosis or
                treatment decisions. Never disregard professional medical advice
                or delay seeking it because of information obtained through our
                Services.
              </p>
            </div>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              3. Account Registration and Security
            </h3>
            <p>
              To access certain features of the Services, you may be required to
              create an account. You agree to provide accurate, current, and
              complete information when registering and to update such
              information as needed. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              under your account.
            </p>
            <p>
              We reserve the right to suspend or terminate your access to the
              Services if we suspect that the information you provided is
              inaccurate or incomplete, or if you have violated these Terms.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              4. Payments and Subscriptions
            </h3>
            <p>
              Some features of our Services may require payment, including but
              not limited to AI diagnostic reports, downloadable documentation,
              or subscriptions. By making a purchase, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Pay all applicable fees and taxes associated with your purchase;
              </li>
              <li>Authorize us to charge your selected payment method;</li>
              <li>
                Abide by the billing terms presented to you at the time of
                purchase.
              </li>
            </ul>
            <p>
              Plans automatically renew unless you cancel them before the
              renewal date. You may cancel your subscription through your
              account settings or by contacting support at{" "}
              <a
                href="mailto:support@skin-x.app"
                className="text-blue-600 hover:underline"
              >
                support@skin-x.app
              </a>
              .
            </p>
            <p>
              We reserve the right to change pricing and payment terms at any
              time, provided that any such changes will not apply retroactively.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              5. Intellectual Property Rights
            </h3>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Copy, reproduce, modify, adapt, publish, transmit, distribute,
                display, or otherwise exploit any content;
              </li>
              <li>
                Reverse-engineer, disassemble, or decompile any part of the
                Service;
              </li>
              <li>
                Use our trademarks or service marks without our prior written
                consent.
              </li>
            </ul>
            <p>
              You may use the Services only for personal, non-commercial
              purposes, unless you receive express written authorization from
              us.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              6. Privacy and Data Security
            </h3>
            <p>
              Your privacy is important to us. Our collection and use of your
              personal information is governed by our Privacy Policy, which is
              incorporated by reference into these Terms.
            </p>
            <p>
              By using our Services, you consent to the collection, use, and
              disclosure of your personal information as described in our
              Privacy Policy. You acknowledge that data transmission over the
              internet is never 100% secure and we cannot guarantee the security
              of any information transmitted to or from the Site.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              7. Third-Party Services and Links
            </h3>
            <p>
              Our Services may contain links to third-party websites or services
              that are not owned or controlled by us. We do not endorse, assume
              responsibility for, or have any control over the content,
              policies, or practices of any third-party websites or services.
            </p>
            <p>
              You acknowledge and agree that we are not responsible for any loss
              or damage caused by the use of any third-party websites or
              services.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              8. Disclaimer of Warranties
            </h3>
            <p>
              To the maximum extent permitted by applicable law, the Services
              are provided "AS IS" and "AS AVAILABLE" without warranties of any
              kind, whether express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose,
              accuracy, or non-infringement.
            </p>
            <p>We do not warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The Services will be uninterrupted, timely, secure, or
                error-free;
              </li>
              <li>
                The results obtained from using the Services will be accurate or
                reliable;
              </li>
              <li>Any errors in the Services will be corrected.</li>
            </ul>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              9. Limitation of Liability
            </h3>
            <p>
              To the fullest extent permitted by law, Compass Atlantica LLC
              shall not be liable for any direct, indirect, incidental,
              consequential, special, punitive, or exemplary damages, including
              but not limited to damages for loss of profits, goodwill, use,
              data, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Your access to or use of, or inability to access or use, the
                Services;
              </li>
              <li>
                Any conduct or content of any third party on the Services;
              </li>
              <li>Any content obtained from the Services;</li>
              <li>
                Unauthorized access, use, or alteration of your transmissions or
                content.
              </li>
            </ul>
            <p>
              This limitation applies even if we have been advised of the
              possibility of such damages.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              10. Termination
            </h3>
            <p>
              We reserve the right, at our sole discretion, to terminate or
              suspend your access to the Services at any time and for any
              reason, including violation of these Terms or if we believe your
              actions may cause legal liability or harm to others.
            </p>
            <p>
              Upon termination, your right to use the Services will immediately
              cease. The following sections shall survive termination:
              Intellectual Property, Disclaimers, Limitation of Liability,
              Indemnification, and Governing Law.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              11. Governing Law and Jurisdiction
            </h3>
            <p>
              These Terms shall be governed by principles of fair use and good
              faith. In the event of any dispute arising from your use of the
              Services, we encourage you to first contact us directly so we can
              work together in good faith to resolve the issue informally.
            </p>
            <p>
              If a formal resolution is required, both parties agree to seek a
              solution through appropriate and mutually acceptable channels, in
              accordance with applicable laws in the user's region or country of
              residence.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              12. Modifications to the Terms
            </h3>
            <p>
              We reserve the right to update or modify these Terms at any time
              without prior notice. Any changes will be effective immediately
              upon posting the revised Terms on the Site. Your continued use of
              the Services after the effective date constitutes your acceptance
              of the updated Terms.
            </p>
            <p>
              We encourage you to review these Terms periodically to stay
              informed.
            </p>

            <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
              13. Contact Us
            </h3>
            <p>
              If you have any questions or concerns about these Terms or the
              Services, please contact us by e-mail at{" "}
              <a
                href="mailto:support@skin-x.app"
                className="text-blue-600 hover:underline"
              >
                support@skin-x.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
