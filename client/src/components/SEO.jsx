import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ title, description }) => {
  const siteTitle = title ? `${title} | Sri Tirupathi Bakery` : 'Sri Tirupathi Bakery';
  const metaDescription = description || 'Experience the perfect blend of tradition, quality, and flavor in every bite. Order delicious cakes, pastries, and party supplies online.';

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={metaDescription} />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default SEO;
