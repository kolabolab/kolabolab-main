import React from 'react';
import { Box } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>KolaboLab - Collaborate. Innovate. Impact.</title>
        <meta 
          name="description" 
          content="Connect with passionate entrepreneurs, skilled developers, and impact investors to build startups that solve the world's most pressing challenges. Join 15,000+ changemakers building the future." 
        />
        <meta name="keywords" content="startup collaboration, social impact, tech for good, entrepreneurs, developers, investors, sustainability, climate change, social justice" />
        <meta property="og:title" content="KolaboLab - Collaborate. Innovate. Impact." />
        <meta property="og:description" content="Join a global community of changemakers building startups that solve the world's most pressing challenges." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://kolabolab.com" />
      </Helmet>

      <Box>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
      </Box>
    </>
  );
};

export default HomePage;