import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar alwaysOpaque={true} />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-12 pt-24">
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

        {/* Privacy Policy Content */}
        <h1 className="text-4xl font-bold text-[#1e293b] mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-[#64748b] mb-8">
          Effective date: March 2026
        </p>

        <div className="text-[#475569] leading-relaxed space-y-6">
          <p>
            This Privacy Policy (the "Policy") describes how Yasen SIA and its
            affiliates. (also referred to as "Company," "we," "us," or "our"),
            collects, stores, uses and protects your information when you use
            our website at http://skinx.com/ (the "Site"), any mobile
            applications that hyperlink to this Policy and are available for
            download in the Google Play Store, Apple App Store or any other
            third party app store, or are pre-installed on third party devices
            (the "Apps"), or any other websites, pages, features, or content
            owned or operated by Yasen SIA (collectively, including the Site and
            Apps, the "Services").
          </p>

          <p>
            This Privacy Policy is part of, and is governed by, the terms and
            conditions set forth in our Terms of Service located at
            http://skinx.com/terms/terms_of_use.html. Please read the Terms of
            Service carefully before you use our Services.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            1. Acceptance of this Policy
          </h3>
          <p>
            By accessing, visiting or using our Services, you warrant and
            represent that you have read, understood and agreed to this Policy
            and our Terms of Service. If you disagree with anything in this
            Policy, you must not use or access the Services.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            2. Amendments to this Policy
          </h3>
          <p>
            We may periodically make changes to this Policy as we update or
            expand our Services. We will notify you of any material changes to
            this Privacy Policy by notifying you via the email we have on file
            for you, or by means of a notice on our Services in advance of the
            effective date of the changes. If you do not agree to the changes,
            you should discontinue your use of the Services prior to the time
            the modified Policy takes effect. If you continue using the Services
            after the modified Policy takes effect, you will be bound by the
            modified Policy.
          </p>
          <p>
            Furthermore, we may provide you with "just-in-time" disclosures or
            additional information about the data collection, use and sharing
            practices of specific Services. These notices may provide more
            information about our privacy practices, or provide you with
            additional choices about how we process your personal information.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            3. Information Collected through the Services
          </h3>
          <p>
            In this Policy, the term "personal information" includes any
            information that identifies or makes an individual identifiable.
            When you access or use our Services, we may generally collect the
            personal information described below.
          </p>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            A. Information You Directly and Voluntarily Provide to Us
          </h4>
          <p>
            When you access or use our Services, you may provide the following
            information to us:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Customer Support Information:</strong> If you are a
              visitor to the Site, or a user of the Apps, we may collect
              information that you provide to us when you communicate with any
              of our departments such as customer service or technical services.
            </li>
            <li>
              <strong>Contact Information:</strong> When you sign up to create
              an account with some of our Apps, you will be required to provide
              an email address as part of the registration process.
              Alternatively, you can use your Facebook Account or other third
              party social network accounts (together, "Social Media Account")
              to register for the Services.
            </li>
            <li>
              <strong>Social Media Account Information:</strong> When you sign
              up with a Social Media Account, you will be asked to choose which
              information you would like to share with us, such as your email
              address, birthday, friends list, or public profile information.
            </li>
            <li>
              <strong>Profile Information:</strong> When using some of our
              Services, you may be able to add information to your profile, such
              as an avatar or profile picture, birthday, nickname or username,
              or country. You voluntarily provide this information to us.
            </li>
            <li>
              <strong>Your Content:</strong> When using some of our Services,
              you can create, post, upload or share content by providing us with
              access to your photos, media and files, and your device's camera
              and microphone. You voluntarily provide this information to us.
            </li>
          </ul>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            B. Information Automatically Collected Through the Services
          </h4>
          <p>
            We automatically collect information about you when you use the
            Services, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Device Information:</strong> If you access the Services
              through a mobile device, we may be able to identify the general
              location of your mobile device (not precise geolocation data),
              your mobile device's brand, model, operating system, resolution,
              screen size, system version, Bluetooth settings, internet
              connection, random-access memory ("RAM"), the application you have
              installed, the applications you have running in the background,
              mobile device's advertising ID.
            </li>
            <li>
              <strong>Cookies & Similar Tracking Information:</strong> We use
              cookies and similar tracking technologies to collect information
              about your interactions with our Services.
            </li>
            <li>
              <strong>Content Sharing:</strong> When you choose to share content
              with us, we automatically collect information about your Wi-Fi
              connection, and call information.
            </li>
          </ul>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            C. Information You Share on Third Party Websites or through Social
            Media Services
          </h4>
          <p>
            The Services may include links to third-party websites and social
            media services where you may be able to post comments, stories,
            reviews or other information. Your use of these third-party websites
            and social media services may result in the collection or sharing of
            information about you by these third-party websites and social media
            services.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            4. How We Use the Information We Collect
          </h3>
          <p>
            We use the personal information we gather through the Services for
            the purposes described below. If we use your personal information in
            any other ways, we will disclose this to you.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide the Services to you.</li>
            <li>To provide customer service.</li>
            <li>To enforce terms, agreements or policies.</li>
            <li>To send you Service-related communications.</li>
            <li>For security purposes.</li>
            <li>To maintain legal and regulatory compliance.</li>
            <li>To personalize your experience on the Services.</li>
            <li>To conduct research and development.</li>
            <li>To engage in marketing activities.</li>
          </ul>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            5. How We Share Your Information with Third Parties
          </h3>
          <p>
            We may share your personal information with third parties in the
            following circumstances:
          </p>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            A. Employees, Third-Party Processors and Third-Party Service
            Providers
          </h4>
          <p>
            We disclose your personal information to our employees, contractors,
            affiliates, distributors, dealers, vendors and suppliers ("Service
            Providers") who provide certain services to us or on our behalf.
          </p>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            B. Response to Subpoenas or Court Orders
          </h4>
          <p>
            To the extent permitted by law, we will disclose your personal
            information if required to do so by law, or in response to a
            subpoena or court order.
          </p>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            C. Business Transfers or Bankruptcy
          </h4>
          <p>
            In the event of a merger, acquisition, bankruptcy or other sale of
            all or a portion of our assets, any personal information owned or
            controlled by us may be one of the assets transferred to third
            parties.
          </p>

          <h4 className="text-lg font-semibold text-[#1e293b] mt-6 mb-3">
            D. Our Affiliates
          </h4>
          <p>
            Based on your consent, we may share some or all of your contact
            information with our parent company, subsidiaries and corporate
            affiliates.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            6. Children
          </h3>
          <p>
            We do not knowingly collect personal information from children under
            18 years old, unless permitted to do so by applicable law. If we
            become aware that we have unknowingly collected personal information
            from a child, we will make commercially reasonable efforts to delete
            such information in our database.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            7. Security
          </h3>
          <p>
            We are committed to ensuring the security of your personal
            information. We have physical, technical and administrative
            safeguards in place to protect the confidentiality of your personal
            information.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            8. Retention of Personal Information
          </h3>
          <p>
            We will try to limit the storage of your personal information to the
            time necessary to serve the purpose(s) for which your personal
            information was processed.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            9. Information for Residents in the European Economic Area, United
            Kingdom and Switzerland
          </h3>
          <p>
            This section only applies to users of our Services that are located
            in the European Economic Area, United Kingdom and/or Switzerland at
            the time of data collection.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            10. Special Information for California Residents
          </h3>
          <p>
            California law allows users of the Services who are California
            residents to request and receive once a year, free of charge, a
            notice from us describing what categories of personal information we
            shared with third parties.
          </p>

          <h3 className="text-xl font-bold text-[#1e293b] mt-8 mb-4">
            11. How to Contact Us
          </h3>
          <p>
            If you have any questions about this Privacy Policy, please feel
            free to contact us at{" "}
            <a
              href="mailto:support@skin-x.app"
              className="text-blue-600 hover:underline"
            >
              support@skin-x.app
            </a>
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-[#1e293b] mb-2">
              Contact us at:{" "}
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

export default PrivacyPolicy;
