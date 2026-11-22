import type { Screen } from '../../types'
import { pageContentClass, screenClass } from '../../styles/classes'
import { Header } from '../Header'

interface TermsPageProps {
  onNavigate: (screen: Screen) => void
}

const sections = [
  ['1. About DMK', `DMK – De_Mayor Kitchen is a food and catering business providing freshly prepared meals, food packages, bulk food orders, catering services and related services for individuals, families, students, organisations and special occasions.

Our services may include weddings, birthdays, corporate events, convocations and other approved occasions.`],
  ['2. Placing an Order', `Customers may place orders through the official DMK website or other ordering channels officially recognised by DMK.

Customers are responsible for providing accurate information when placing an order, including names, phone numbers, selected meals, quantities, delivery details and any special instructions. Orders should be carefully reviewed before submission.

An order request does not automatically constitute an accepted order. Orders become confirmed when DMK acknowledges and verifies the order. DMK may contact customers for clarification where necessary.`],
  ['3. Prices and Payments', `All prices are displayed in Nigerian Naira (₦), unless otherwise stated. Payments may be processed through Paystack or other payment methods officially approved by DMK.

An order is treated as paid only after successful payment verification. Customers should retain payment receipts or transaction references until their orders have been fulfilled.

Customers must not make payments into unofficial accounts claiming to represent DMK. If a payment is deducted but the order is not confirmed, contact DMK with the transaction reference. Additional delivery or service charges will be communicated before payment.`],
  ['4. Order Changes and Availability', `Customers should contact DMK as soon as possible if they wish to modify an order. Changes depend on food availability, preparation status and operational capacity.

DMK will communicate where a selected meal or package becomes unavailable. Where an agreed replacement cannot be provided, the customer may choose an alternative or request a refund for the unavailable item.`],
  ['5. Delivery and Collection', `DMK may offer delivery, customer collection or designated pickup arrangements, depending on availability.

Customers are responsible for accurate delivery addresses and reachable contact information. Delivery fees, estimated times and collection instructions will be communicated before order confirmation.

Customers should be available to receive orders at the agreed time or collection point. DMK may notify customers of delays and is not responsible for delays caused by circumstances reasonably outside its control, while making reasonable efforts to minimise their impact.`],
  ['6. Order Cancellation and Refunds', `Customers should cancel through DMK’s official communication channels as early as possible. Cancellation is assessed based on the order type, request time and whether preparation or procurement has commenced.

Customised, bulk, event and catering orders may have applicable cancellation arrangements communicated before confirmation.

Where DMK cancels an order without an agreed replacement, the customer is entitled to an appropriate refund. For an incorrect, incomplete or materially defective order, DMK will investigate and may offer replacement, correction or refund.

Eligible refunds will be processed through an agreed payment channel. Refund timing may depend on the payment provider or receiving institution. These terms do not remove cancellation or refund rights available under Nigerian law.`],
  ['7. Food Quality, Safety and Allergies', `DMK is committed to responsible food preparation and handling and appropriate food hygiene standards.

Menu descriptions and images provide a reasonable representation of offered meals; minor presentation differences may occur. Customers with allergies, intolerances or dietary restrictions should notify DMK before ordering and should not assume a meal is allergen-free unless confirmed.

Customers should follow any storage, handling or consumption instructions and report concerns about food quality or safety immediately.`],
  ['8. Customer Responsibilities', `Customers agree to provide accurate and complete ordering information, make payments through approved channels, treat DMK employees and representatives respectfully, avoid fraudulent transactions and false payment claims, ensure someone is available for delivery, and communicate genuine complaints through official channels.`],
  ['9. Complaints and Customer Support', `Customers should report issues as soon as reasonably possible, providing the order number, payment reference and relevant details. DMK will review complaints and communicate an appropriate resolution.

Where a complaint cannot be resolved directly, customers retain the right to seek assistance from the relevant consumer protection authorities.`],
  ['10. Privacy and Customer Information', `DMK may collect names, phone numbers, email addresses, delivery addresses and order details to process orders and provide services.

Customer information is handled in accordance with applicable Nigerian data protection laws and may be shared with relevant service providers only where reasonably necessary to process payments, fulfil orders, provide services or comply with legal obligations.`],
  ['11. Service Interruptions and Unforeseen Circumstances', `DMK may occasionally experience equipment failures, ingredient shortages, severe weather, transport disruptions or other unforeseen events.

Where these affect a confirmed order, DMK will make reasonable efforts to notify the customer and agree on an appropriate solution.`],
  ['12. Amendments to These Terms', `DMK may review and update these Terms and Conditions when necessary. Updated versions will be published on the official website with their effective dates.

Changes do not retrospectively remove rights already acquired under applicable law.`],
  ['13. Applicable Law', `These Terms and Conditions are interpreted in accordance with the laws of the Federal Republic of Nigeria.

Disputes arising from DMK services should first be addressed through reasonable communication and mutual efforts to reach a resolution, without limiting either party’s legal rights.`],
] as const

export function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className={`${screenClass} pb-8`}>
      <Header title="Terms & Conditions" onNavigate={onNavigate} />
      <article className={`${pageContentClass} mx-auto max-w-[840px] px-4 py-5 text-[#514740] min-[700px]:px-8 min-[700px]:py-8`}>
        <div className="mb-6">
          <p className="text-sm font-bold text-[#e9550b]">Effective Date: 20th November 2026</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#2a201b]">DMK – De_Mayor Kitchen</h1>
          <h2 className="mt-1 text-lg font-bold">Terms and Conditions of Service</h2>
          <p className="mt-3 text-sm leading-6 text-justify">
            Welcome to DMK – De_Mayor Kitchen (“DMK”, “we”, “our” or “us”). These terms govern access to and use of our website, ordering platform and food services.
            By placing an order through our website, you acknowledge that you have read, understood and agreed to these Terms and Conditions.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h3 className="text-base font-bold text-[#2a201b]">{title}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-justify">{body}</p>
            </section>
          ))}
        </div>

        <section className="mt-6">
          <h3 className="text-base font-bold text-[#2a201b]">14. Contact Information</h3>
          <p className="mt-2 text-sm leading-6 text-justify">For enquiries, complaints, order issues or clarification regarding these Terms and Conditions:</p>
          <p className="mt-2 text-sm"><strong>DMK – De_Mayor Kitchen</strong></p>
          <p className="mt-1 text-sm">Phone/WhatsApp: <a className="font-semibold text-[#e9550b]" href="tel:+2348055833975">+2348055833975</a></p>
          <p className="mt-1 text-sm">Email: <a className="font-semibold text-[#e9550b]" href="mailto:demayorkitchen@yahoo.com">demayorkitchen@yahoo.com</a></p>
          <p className="mt-4 text-sm font-semibold">Thank you for choosing DMK – De_Mayor Kitchen.</p>
          <p className="mt-1 text-sm text-[#77706a]">Great food. Memorable moments. Excellent service.</p>
        </section>
      </article>
    </div>
  )
}
