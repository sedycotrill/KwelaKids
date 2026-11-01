
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import kwelakidsLogo from "@/assets/multipurposever.svg";

function TermsAndCondition() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen w-full bg-[#F5F8FC] px-4 py-10">
      {/* TOP-LEFT LOGO */}
      <img
        src={kwelakidsLogo}
        alt="KwelaKids"
        className="absolute left-6 top-6 h-auto w-[150px] object-contain sm:left-10 sm:top-8 sm:w-[170px]"
      />

      {/* CONTENT CARD */}
      <div className="mx-auto mt-20 w-full max-w-[800px] rounded-xl border border-[#D9E9F5] bg-white px-6 py-8 shadow-[0_2px_10px_rgba(36,111,179,0.08)] sm:px-10 sm:py-9">

        {/* HEADER */}
        <div className="border-b border-[#D9E9F5] pb-5">
          <span className="mb-3 inline-block rounded-full bg-[#D9E9F5] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#164B9B]">
            KWELAKIDS
          </span>

          <h1 className="text-[26px] font-bold tracking-[-0.5px] text-[#164B9B] sm:text-[30px]">
            Terms and Conditions
          </h1>

          <p className="mt-2 text-[14px] leading-relaxed text-[#666666]">
            Please read these Terms and Conditions carefully before using
            KwelaKids.
          </p>
        </div>

        {/* CONTENT */}
        <div className="mt-6 space-y-6 text-[14px] leading-[1.8] text-[#252525]">
          <p>
            Welcome to KwelaKids, a web-based educational platform designed
            to support learning and familiarization with Filipino Sign
            Language (FSL) through interactive learning materials and
            activities.
          </p>

          <p>
            By accessing or using KwelaKids, you acknowledge that you have
            read, understood, and agreed to the following Terms and Conditions.
          </p>

          {/* 1. ACCEPTANCE OF TERMS */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using KwelaKids, users agree to follow these
              Terms and Conditions. If you do not agree with any part of
              these terms, please discontinue using the platform.
            </p>
          </section>

          {/* 2. PURPOSE OF THE PLATFORM */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              2. Purpose of the Platform
            </h2>
            <p>
              KwelaKids is intended to provide an accessible learning
              environment for individuals interested in learning Filipino
              Sign Language. The platform may include lessons, visual
              demonstrations, learning categories, and other educational
              resources.
            </p>
            <p className="mt-2">
              The platform is designed to support learning and does not
              replace formal instruction from qualified Filipino Sign
              Language educators or instructors.
            </p>
          </section>

          {/* 3. USER ACCOUNTS */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              3. User Accounts
            </h2>
            <p>
              Certain features of KwelaKids may require users to create an
              account. Users are responsible for providing accurate
              information and maintaining the security of their accounts.
            </p>

            <p className="mt-2">Users agree to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Provide accurate and complete registration information.</li>
              <li>Keep their login credentials confidential.</li>
              <li>Not access another user's account without permission.</li>
              <li>Notify the platform administrator of suspected unauthorized access.</li>
            </ul>
          </section>

          {/* 4. LEARNING MATERIALS */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              4. Learning Materials and Educational Content
            </h2>
            <p>
              Learning materials available on KwelaKids are provided for
              educational purposes. These may include images, illustrations,
              videos, text, audio, and other instructional resources related
              to Filipino Sign Language.
            </p>
            <p className="mt-2">
              Users are encouraged to use the materials responsibly and
              understand that sign language learning may require guidance,
              practice, and interaction with knowledgeable FSL users or
              instructors.
            </p>
          </section>

          {/* 5. PROPER USE */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              5. Proper Use of the Platform
            </h2>
            <p>Users agree to use KwelaKids responsibly and must not:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the platform for unlawful or unauthorized activities.</li>
              <li>Attempt to disrupt, damage, or gain unauthorized access to the system.</li>
              <li>Upload or distribute harmful, offensive, or misleading content.</li>
              <li>Misuse another user's account or personal information.</li>
              <li>Copy or distribute platform materials without proper authorization.</li>
            </ul>
          </section>

          {/* 6. INTELLECTUAL PROPERTY */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              6. Intellectual Property
            </h2>
            <p>
              The platform's original design, branding, text, illustrations,
              and learning materials are protected by applicable intellectual
              property laws. Users may access these materials for personal
              educational purposes but must not reproduce, redistribute, or
              commercially use them without permission from their respective
              owners.
            </p>
          </section>

          {/* 7. PRIVACY AND PERSONAL INFORMATION */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              7. Privacy and Personal Information
            </h2>
            <p>
              KwelaKids recognizes the importance of protecting users'
              personal information. Information provided during account
              registration or platform use should be handled responsibly and
              in accordance with the platform's applicable privacy practices.
            </p>
            <p className="mt-2">
              Users should avoid sharing passwords, sensitive personal
              information, or another person's private information through
              the platform.
            </p>
          </section>

          {/* 8. PLATFORM AVAILABILITY */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              8. Platform Availability and Limitations
            </h2>
            <p>
              KwelaKids aims to provide a reliable learning experience.
              However, uninterrupted access is not guaranteed. The platform
              may undergo maintenance, updates, or temporary service
              interruptions.
            </p>
            <p className="mt-2">
              The KwelaKids team may update, modify, or discontinue certain
              features when necessary.
            </p>
          </section>

          {/* 9. ACCOUNT RESTRICTIONS */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              9. Account Restrictions and Termination
            </h2>
            <p>
              KwelaKids reserves the right to review accounts and restrict
              access when users violate these Terms and Conditions, misuse
              platform features, or engage in activities that may harm the
              platform or its users.
            </p>
          </section>

          {/* 10. CHANGES TO TERMS */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              10. Changes to the Terms and Conditions
            </h2>
            <p>
              KwelaKids may revise these Terms and Conditions when necessary.
              Updated terms will be made available through the platform.
              Users are encouraged to review this page regularly.
            </p>
          </section>

          {/* 11. CONTACT INFORMATION */}
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[#246FB3]">
              11. Contact Information
            </h2>
            <p>
              For questions, concerns, or clarifications regarding these
              Terms and Conditions, users may contact the KwelaKids
              administrator through the platform's official contact channel.
            </p>

            <div className="mt-3 rounded-lg border border-[#D9E9F5] bg-[#F5F8FC] px-4 py-3">
              <p className="font-semibold text-[#164B9B]">
                KwelaKids Administrator
              </p>
              <p className="mt-1 text-[#666666]">
                Email: [Insert Official KwelaKids Email]
              </p>
            </div>
          </section>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-8 border-t border-[#D9E9F5] pt-5">
          <Button
            type="button"
            onClick={() => navigate("/signup")}
            className="h-10 rounded-lg bg-[#6254F5] px-6 text-[12px] font-semibold text-white shadow-none hover:bg-[#5144DC]"
          >
            Back to Sign Up
          </Button>
        </div>
      </div>
    </main>
  );
}

export default TermsAndCondition;
