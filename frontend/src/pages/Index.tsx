import { useState } from "react";
import { ALOHeader } from "@/components/ALOHeader";
import { LoanForm } from "@/components/LoanForm";
import { StepsSection } from "@/components/StepsSection";
import { EligibilitySection } from "@/components/EligibilitySection";
import { LoanTable } from "@/components/LoanTable";
import { RegistrationModal } from "@/components/RegistrationModal";

const Index = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLoanFormSubmit = () => {
    setShowRegistration(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <ALOHeader />
      
      <main>
        {/* Hero Section with Loan Form */}
        <section className="py-16 px-4">
          <LoanForm onSubmit={handleLoanFormSubmit} />
        </section>

        {/* Steps Section */}
        <StepsSection />

        {/* Eligibility Section */}
        <EligibilitySection />

        {/* Loan Table Section */}
        <LoanTable />
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h1 className="text-8xl font-bold">
              <span className="text-red-500">15</span><span className="text-green-700">S</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 ALO 15S - Nền tảng cho vay online uy tín, nhanh chóng, minh bạch
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Hotline: 0815.320.648 - 0927.996.903
          </p>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={showRegistration} 
        onClose={() => setShowRegistration(false)} 
      />
    </div>
  );
};

export default Index;
