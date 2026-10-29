import type { LegalDocument } from "./legal.types";
import { privacyDocumentVi, termsDocumentVi } from "./legal.data.vi";

export function getLegalDocument(kind: LegalDocument["kind"], locale: string): LegalDocument {
  if (kind === "terms") return locale === "vi" ? termsDocumentVi : termsDocument;
  return locale === "vi" ? privacyDocumentVi : privacyDocument;
}

export const termsDocument: LegalDocument = {
  kind: "terms",
  title: "Terms and conditions",
  sections: [
    {
      title: "General",
      paragraphs: [
        "Labdock is an e-commerce marketplace connecting buyers (“Customers”) with suppliers (“Vendors”) in the life sciences sector. All products listed on Labdock are intended for research purposes only (including in vitro use), unless otherwise explicitly specified by the manufacturer.",
        "By accessing, registering, or placing orders on Labdock, Customers agree to be bound by these Terms and Conditions.",
        "Information, quotations, and content displayed on the platform may contain technical or typographical errors. Labdock reserves the right to correct such errors without liability.",
        "Any quotation or price displayed does not constitute a binding offer but rather an invitation to transact, and shall remain valid for up to thirty (30) days unless otherwise stated.",
      ],
    },
    {
      title: "Account & Platform Use",
      paragraphs: [
        "Customers are responsible for providing accurate registration information, maintaining the confidentiality of their account credentials, and for all activities conducted under their account.",
        "Labdock reserves the right to suspend or terminate accounts in cases of violation of these Terms, suspected fraud, or other risks.",
      ],
    },
    {
      title: "Pricing & Payment",
      paragraphs: [
        "Product prices are determined by Vendors and may change without prior notice.",
        "Payment terms are immediate payment (Paynow or bank transfer) or Net 30 for approved customers, unless otherwise agreed.",
        "Labdock supports multiple payment methods. Applicable taxes, shipping costs, and related charges will be displayed or added to invoices.",
        "Late payments may incur interest in accordance with applicable laws. Labdock reserves the right to suspend transactions for accounts with overdue balances.",
      ],
    },
    {
      title: "Orders & Acceptance",
      paragraphs: [
        "Orders are deemed confirmed only upon acceptance by the Vendor.",
        "Labdock reserves the right to cancel, reject, or adjust orders in cases of pricing errors, system issues, or violations of these Terms.",
      ],
    },
    {
      title: "Shipping & Delivery",
      paragraphs: [
        "Shipping is arranged by the Vendor or designated logistics partners. Labdock acts solely as an intermediary platform and is not responsible for shipping operations.",
        "Risk of loss or damage transfers in accordance with the Vendor’s delivery terms.",
        "For international orders, import duties, taxes, and related charges are the responsibility of the Customer.",
      ],
    },
    {
      title: "Claims for Damage",
      paragraphs: [
        "Customers must promptly notify the Vendor or Labdock upon discovering any damage and retain the original packaging for claim processing.",
      ],
    },
    {
      title: "Returns",
      paragraphs: [
        "Products may only be returned with prior written authorization from the Vendor or Labdock support. Customers must contact the designated support email before returning any product. Unauthorized returns will not be accepted.",
        "Vendors may inspect products at the Customer’s location or request disposal instead of return. Returns may be subject to restocking fees.",
        "Certain products (including diagnostic reagents, temperature-controlled items, custom-made products, or special orders) are non-returnable.",
        "Returned products must remain in their original packaging, with intact labels and in unaltered condition. Ownership transfers back to the Vendor only upon acceptance.",
      ],
    },
    {
      title: "Warranty",
      paragraphs: [
        "Warranty is provided by the Vendor or the manufacturer. Labdock does not provide independent warranties unless explicitly stated.",
      ],
    },
    {
      title: "Product Use & Compliance",
      paragraphs: [
        "Customers are responsible for using products in accordance with their intended purpose, applicable laws, biosafety regulations, and intellectual property rights.",
        "Failure to comply with these requirements may void any applicable warranties and liabilities.",
      ],
    },
    {
      title: "Liability & Limitation",
      paragraphs: [
        "Labdock operates as an intermediary and does not manufacture or control products.",
        "To the maximum extent permitted by law, Labdock shall not be liable for any indirect, incidental, or consequential damages, including but not limited to loss of data, revenue, or profits.",
        "Total liability, if any, shall not exceed the value of the relevant order.",
        "Customers assume all risks associated with the use of the products.",
      ],
    },
    {
      title: "Intellectual Property",
      paragraphs: [
        "All platform content, including text, images, and data, is owned by Labdock or the respective Vendors.",
        "Unauthorized use, reproduction, or commercial exploitation is strictly prohibited.",
      ],
    },
    {
      title: "Data Protection",
      paragraphs: [
        "Labdock processes and protects user data in accordance with applicable data protection laws.",
        "Such data may be used for operational, transactional, and service improvement purposes.",
      ],
    },
    {
      title: "Governing Law & Disputes",
      paragraphs: [
        "These Terms shall be governed by applicable laws.",
        "Any disputes shall first be resolved through good faith negotiations. If unresolved, such disputes shall be submitted to a court of competent jurisdiction.",
      ],
    },
    {
      title: "Entire Agreement",
      paragraphs: [
        "These Terms constitute the entire agreement governing the use of Labdock and supersede all prior agreements.",
        "Labdock reserves the right to update these Terms at any time. Updated versions shall become effective upon publication on the platform.",
      ],
    },
  ],
};

export const privacyDocument: LegalDocument = {
  kind: "privacy",
  title: "Privacy Policy",
  sections: [
    {
      title: "Introduction",
      paragraphs: [
        "Labdock respects your privacy and is committed to protecting your personal data in accordance with applicable laws, including the Singapore Personal Data Protection Act (PDPA). By accessing or using the Labdock platform, you consent to the collection, use, and disclosure of your personal data in accordance with this Privacy Policy.",
      ],
    },
    {
      title: "Information Collected",
      paragraphs: ["Labdock may collect personal data voluntarily provided by you, including but not limited to:"],
      list: [
        "Full name, company name",
        "Billing and shipping address",
        "Contact information (email address, phone number)",
        "Payment and transaction information",
      ],
      closing: [
        "In addition, Labdock may automatically collect technical data such as IP address, browser type, and user activity on the platform.",
      ],
    },
    {
      title: "Purpose of Collection",
      paragraphs: ["Your data is collected and used for the following purposes:"],
      list: [
        "Processing orders and facilitating transactions between Customers and Vendors",
        "Providing customer support and service-related communications",
        "Improving platform performance and user experience",
        "Sending marketing communications (with your consent)",
        "Complying with legal and regulatory requirements",
      ],
    },
    {
      title: "Disclosure of Information",
      paragraphs: ["Labdock may disclose personal data to:"],
      list: [
        "Vendors for order fulfillment",
        "Payment service providers and logistics partners",
        "Service providers supporting platform operations",
        "Government authorities where required by law",
      ],
      closing: ["Labdock does not sell personal data to third parties."],
    },
    {
      title: "Data Security",
      paragraphs: [
        "Labdock implements reasonable technical and organizational measures to protect personal data against unauthorized access, disclosure, or misuse. Access to personal data is restricted to authorized personnel on a need-to-know basis.",
      ],
    },
    {
      title: "Data Retention",
      paragraphs: [
        "Personal data will be retained only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by applicable laws.",
      ],
    },
    {
      title: "Cookies",
      paragraphs: [
        "Labdock uses cookies to enhance user experience, analyze user behavior, and improve services. Users may adjust cookie settings through their browser; however, disabling cookies may affect certain functionalities of the platform.",
      ],
    },
    {
      title: "Third-Party Links",
      paragraphs: [
        "The platform may contain links to third-party websites. Labdock is not responsible for the privacy policies or data handling practices of such websites.",
      ],
    },
    {
      title: "User Rights",
      paragraphs: ["Subject to applicable laws, users have the right to:"],
      list: [
        "Request access to their personal data",
        "Request correction or updating of their information",
        "Withdraw consent for data processing",
      ],
      closing: ["Requests may be submitted through the contact details provided on the platform."],
    },
    {
      title: "Policy Updates",
      paragraphs: [
        "Labdock reserves the right to update this Privacy Policy at any time. Any changes will take effect upon publication on the platform.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "For any questions regarding this Privacy Policy or your personal data, please contact Labdock using the official contact details provided on the platform.",
      ],
    },
  ],
};
