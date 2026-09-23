
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import CustomOrdersTab from './CustomOrdersTab';
import HowItWorksStepper from '../../components/HowItWorksStepper';

const CustomCakesPage = () => {
  return (
    <PageWrapper>
      <div className="bg-gray-50 min-h-screen pt-14 lg:pt-16 flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-0 pb-6 sm:pb-8 w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2d170a] mb-2">
              Custom Cake Requests
            </h1>
            <p className="text-[#5c4033] max-w-2xl mx-auto">
              Track your custom cake quotes or request a new design from scratch.
            </p>
          </div>
          
          <div className="mb-8">
            <HowItWorksStepper hideCTA={true} />
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4">
            <CustomOrdersTab />
          </div>
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default CustomCakesPage;
