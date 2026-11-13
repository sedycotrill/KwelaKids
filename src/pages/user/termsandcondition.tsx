import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import kwelakidsLogo from "@/assets/multipurposever.svg";

function TermsAndCondition() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-4 py-10">
      
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

      {/* TOP-LEFT LOGO */}
      <img
        src={kwelakidsLogo}
        alt="KwelaKids"
        className="absolute left-6 top-6 h-auto w-35 object-contain sm:left-10 sm:top-8 sm:w-40"
      />

      {/* CONTENT CARD */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-200 rounded-3xl border border-[#B8DDF6] bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">

        {/* HEADER & TOP BUTTON CONTAINER */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <span className="mb-3 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-xs font-black tracking-wider text-[#164B9B]">
              KWELAKIDS
            </span>

            <h1 className="text-3xl font-black tracking-tight text-[#164B9B] sm:text-4xl">
              Terms and Conditions
            </h1>

            <p className="mt-2 text-sm sm:text-base font-medium text-slate-600">
              Please read these Terms and Conditions carefully before using KwelaKids.
            </p>
          </div>

          {/* BACK BUTTON SA ITAAS */}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="self-start sm:self-auto flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-sm transition-all hover:bg-sky-600 active:translate-y-0.5 active:border-b-2 shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Sign Up
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-6 space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
          <p className="font-medium">
            Welcome to KwelaKids, a web-based educational platform designed
            to support learning and familiarization with Filipino Sign
            Language (FSL) through interactive learning materials and
            activities.
          </p>

          <p className="font-medium">
            By accessing or using KwelaKids, you acknowledge that you have
            read, understood, and agreed to the following Terms and Conditions.
          </p>

          {/* 1. ACCEPTANCE OF TERMS */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              1. Acceptance of Terms
            </h2>
            <p className="font-medium">
              By accessing and using KwelaKids, users agree to follow these
              Terms and Conditions. If you do not agree with any part of
              these terms, please discontinue using the platform.
            </p>
          </section>

          {/* 2. PURPOSE OF THE PLATFORM */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              2. Purpose of the Platform
            </h2>
            <p className="font-medium">
              KwelaKids is intended to provide an accessible learning
              environment for individuals interested in learning Filipino
              Sign Language. The platform may include lessons, visual
              demonstrations, learning categories, and other educational
              resources.
            </p>
            <p className="font-medium">
              The platform is designed to support learning and does not
              replace formal instruction from qualified Filipino Sign
              Language educators or instructors.
            </p>
          </section>

          {/* 3. USER ACCOUNTS */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              3. User Accounts
            </h2>
            <p className="font-medium">
              Certain features of KwelaKids may require users to create an
              account. Users are responsible for providing accurate
              information and maintaining the security of their accounts.
            </p>

            <p className="font-medium">Users agree to:</p>
            <ul className="list-disc space-y-1 pl-5 font-medium text-slate-600">
              <li>Provide accurate and complete registration information.</li>
              <li>Keep their login credentials confidential.</li>
              <li>Not access another user's account without permission.</li>
              <li>Notify the platform administrator of suspected unauthorized access.</li>
            </ul>
          </section>

          {/* 4. LEARNING MATERIALS */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              4. Learning Materials and Educational Content
            </h2>
            <p className="font-medium">
              Learning materials available on KwelaKids are provided for
              educational purposes. These may include images, illustrations,
              videos, text, audio, and other instructional resources related
              to Filipino Sign Language.
            </p>
            <p className="font-medium">
              Users are encouraged to use the materials responsibly and
              understand that sign language learning may require guidance,
              practice, and interaction with knowledgeable FSL users or
              instructors.
            </p>
          </section>

          {/* 5. PROPER USE */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              5. Proper Use of the Platform
            </h2>
            <p className="font-medium">Users agree to use KwelaKids responsibly and must not:</p>
            <ul className="list-disc space-y-1 pl-5 font-medium text-slate-600">
              <li>Use the platform for unlawful or unauthorized activities.</li>
              <li>Attempt to disrupt, damage, or gain unauthorized access to the system.</li>
              <li>Upload or distribute harmful, offensive, or misleading content.</li>
              <li>Misuse another user's account or personal information.</li>
              <li>Copy or distribute platform materials without proper authorization.</li>
            </ul>
          </section>

          {/* 6. INTELLECTUAL PROPERTY */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              6. Intellectual Property
            </h2>
            <p className="font-medium">
              The platform's original design, branding, text, illustrations,
              and learning materials are protected by applicable intellectual
              property laws. Users may access these materials for personal
              educational purposes but must not reproduce, redistribute, or
              commercially use them without permission from their respective
              owners.
            </p>
          </section>

          {/* 7. PRIVACY AND PERSONAL INFORMATION */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              7. Privacy and Personal Information
            </h2>
            <p className="font-medium">
              KwelaKids recognizes the importance of protecting users'
              personal information. Information provided during account
              registration or platform use should be handled responsibly and
              in accordance with the platform's applicable privacy practices.
            </p>
            <p className="font-medium">
              Users should avoid sharing passwords, sensitive personal
              information, or another person's private information through
              the platform.
            </p>
          </section>

          {/* 8. PLATFORM AVAILABILITY */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              8. Platform Availability and Limitations
            </h2>
            <p className="font-medium">
              KwelaKids aims to provide a reliable learning experience.
              However, uninterrupted access is not guaranteed. The platform
              may undergo maintenance, updates, or temporary service
              interruptions.
            </p>
            <p className="font-medium">
              The KwelaKids team may update, modify, or discontinue certain
              features when necessary.
            </p>
          </section>

          {/* 9. ACCOUNT RESTRICTIONS */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              9. Account Restrictions and Termination
            </h2>
            <p className="font-medium">
              KwelaKids reserves the right to review accounts and restrict
              access when users violate these Terms and Conditions, misuse
              platform features, or engage in activities that may harm the
              platform or its users.
            </p>
          </section>

          {/* 10. CHANGES TO TERMS */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              10. Changes to the Terms and Conditions
            </h2>
            <p className="font-medium">
              KwelaKids may revise these Terms and Conditions when necessary.
              Updated terms will be made available through the platform.
              Users are encouraged to review this page regularly.
            </p>
          </section>

          {/* 11. CONTACT INFORMATION */}
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#164B9B]">
              11. Contact Information
            </h2>
            <p className="font-medium">
              For questions, concerns, or clarifications regarding these
              Terms and Conditions, users may contact the KwelaKids
              administrator through the platform's official contact channel.
            </p>

            <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
              <p className="font-black text-[#164B9B]">
                KwelaKids Administrator
              </p>
              <p className="mt-1 font-medium text-slate-600 text-sm">
                Email: [Insert Official KwelaKids Email]
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default TermsAndCondition;