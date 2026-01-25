import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  structuredData?: object;
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const defaultMeta = {
  title: "Bride Family Medical Aid Foundation (BFMAF)",
  description: "Faith-based medical assistance for believers facing overwhelming medical conditions. We provide prayer, support, and financial aid to Christians in medical crises.",
  keywords: "medical aid, christian charity, faith-based assistance, medical fundraising, healthcare support, medical bills help, christian foundation, medical crisis support",
  image: "/og-image.png",
  url: "https://bfmaf.lovable.app",
};

const SEO = ({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = "website",
  structuredData,
  robots = "index, follow",
  publishedTime,
  modifiedTime,
}: SEOProps) => {
  const fullTitle = title 
    ? `${title} | BFMAF` 
    : defaultMeta.title;

  const absoluteImage = image.startsWith("http") ? image : `${defaultMeta.url}${image}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    name: "Bride Family Medical Aid Foundation",
    alternateName: "BFMAF",
    url: defaultMeta.url,
    logo: `${defaultMeta.url}/favicon.png`,
    description: defaultMeta.description,
    sameAs: [
      "https://facebook.com/BFMAF",
      "https://twitter.com/BFMAF",
      "https://instagram.com/BFMAF",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-XXX-XXX-XXXX",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="BFMAF" />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />
      
      {/* Additional SEO Tags */}
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />
      <meta httpEquiv="content-language" content="en" />
      <meta name="geo.region" content="NG" />
      <meta name="geo.placename" content="Jos, Nigeria" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content="BFMAF" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:site" content="@BFMAF" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
