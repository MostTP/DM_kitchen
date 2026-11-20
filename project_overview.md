DMK – De_Mayor Kitchen
Website Development Requirements and Functional Specifications
1. PROJECT OVERVIEW
DMK (De_Mayor Kitchen) requires a website with two major sections:

PHASE 1: CUSTOMER ORDERING PORTAL

This is the public-facing section of the website. Customers can visit the website, select their preferred food packages, specify quantities, customise their orders, view the total cost, make payments and receive a unique Order ID and QR code.

PHASE 2: DMK ADMINISTRATION AND ORDER MANAGEMENT PORTAL

This is a private section accessible only to the DMK owner and authorised staff members.

It will allow the team to receive notifications, view customer orders, search for orders using Order IDs or QR codes, confirm payments, manage orders and organise food preparation and delivery.

The two sections must be connected to the same database.

PHASE 1: CUSTOMER ORDERING PORTAL
2. FOOD ORDERING SYSTEM
DMK will initially offer rice-based food packages.

There will be two main rice options:

A. Jollof Rice

Jollof rice only.

B. Mixed Rice

A combination of Jollof rice and Fried rice in the same plate.

Fried rice cannot be ordered independently.

Customers cannot select Fried rice only.

Customers should be able to select either Jollof Rice or Mixed Rice.

3. PLATE SIZES
There will be two available plate sizes:

Medium Plate.

Big Plate.

Each plate size should have its own pricing.

The customer should be able to specify the quantity of each plate size they want.

4. PROTEIN SELECTION
Customers should be able to choose their preferred protein for each category of rice and plate size.

Available proteins:

Beef.

Chicken.

The system must support different protein choices within the same order.

For example, a customer ordering 50 plates of Mixed Rice should be able to specify:

25 plates with Chicken.

25 plates with Beef.

Similarly, customers should be able to divide their Jollof Rice orders between Beef and Chicken.

This customisation should work independently for:

Jollof Rice.

Mixed Rice.

Medium Plates.

Big Plates.

The system must not force the customer to select only one protein for their entire order.

5. EXTRA FOOD ITEMS
Customers should have the option of adding extra proteins to their orders.

Available extras:

Extra item	Price
Extra Beef	₦800
Extra Chicken	₦1,300
Customers should be able to select the quantity of each extra item.

These extras should be calculated separately and added to the customer's total bill.

6. DRINKS SECTION
Drinks should have a separate section from the main food ordering section.

Available drinks:

Soft Drinks

Fanta

Pepsi

Coca-Cola

Sprite

Water

Table Water – ₦300

Each drink should have its own price and quantity selector.

Customers must be able to order different drinks in the same transaction.

For example:

10 Pepsi.

10 Fanta.

10 Coca-Cola.

10 Sprite.

50 Table Water.

The system should calculate the total cost of all selected drinks automatically.

7. FLEXIBLE BULK ORDERING SYSTEM
This is one of the most important features of the website.

DMK expects customers who may want to order 50, 100, 200, 450 or even more plates at once.

Therefore, the ordering system must support multiple food selections, different quantities, different proteins and multiple drink selections within one order.

Example of a customer order:

A customer wants 450 plates distributed as follows:

Mixed Rice

35 Medium Plates with Chicken.

25 Medium Plates with Beef.

Additional quantities can be specified for Big Plates.

Jollof Rice

20 Medium Plates with Beef.

15 Medium Plates with Chicken.

Drinks

10 Pepsi.

10 Fanta.

50 Table Water.

The customer should be able to enter all these quantities independently without having to submit separate orders.

The website should automatically calculate:

Total number of plates.

Total cost of each food category.

Total cost of selected proteins.

Total cost of extra proteins.

Total cost of drinks.

Grand total of the entire order.

The customer should see a clear order summary before proceeding to payment.

8. AUTOMATIC PRICE CALCULATION
Every food item, plate size, protein option, extra and drink must have its own configurable price.

The website should calculate the order total automatically based on the customer's selections.

The customer must not need to calculate anything manually.

The final order summary should show:

Food description.

Plate size.

Rice type.

Protein selection.

Quantity.

Unit price.

Subtotal.

Extra items.

Drinks.

Grand total.

Prices should be managed from the DMK administration portal so that authorised staff can update them when necessary.

9. CUSTOMER DETAILS
Before checkout, customers should provide the necessary information:

Full name.

Phone number.

Email address.

Delivery or collection information.

Preferred delivery/collection date and time, where applicable.

Additional instructions or special requests.

The form should be simple and mobile-friendly.

10. PAYMENT INTEGRATION
After reviewing their order, customers should proceed to payment.

The website should integrate a secure payment gateway.

The system should:

Display the amount payable.

Redirect customers to the payment gateway.

Verify successful payments automatically.

Update the order payment status.

Prevent an order from being marked as paid without verified payment confirmation.

After successful payment, the customer should receive:

An order confirmation message.

A unique Order ID.

A unique QR code linked to the order.

A summary of everything ordered.

Payment confirmation.

The Order ID and QR code should also be sent to the customer's registered email address, with an option to display or save them.

PHASE 2: DMK ADMINISTRATION AND ORDER MANAGEMENT PORTAL
11. PRIVATE ADMIN DASHBOARD
The second section of the website must be private.

Only the DMK owner and authorised staff members should have access.

Customers must not be able to access this portal.

The dashboard should require secure login credentials.

12. DASHBOARD OVERVIEW
When an authorised user logs in, they should see an overview of the business activities.

The dashboard should display:

Total orders received.

New orders.

Paid orders.

Pending payments.

Orders awaiting preparation.

Orders ready for collection or delivery.

Completed orders.

Cancelled orders.

Total sales.

13. NEW ORDER NOTIFICATIONS
Whenever a customer successfully places an order, DMK should receive a notification.

The notification should contain:

Customer's name.

Order ID.

Order amount.

Payment status.

Date and time of order.

The dashboard should clearly indicate new orders that have not yet been attended to.

14. ORDER SEARCH AND RETRIEVAL
This is another very important feature.

Every customer order must have a unique Order ID and QR code.

DMK staff should be able to retrieve an order in two ways:

Option A: Order ID Search

Staff enter the customer's unique Order ID into the dashboard search bar.

The system should immediately retrieve the complete order.

Option B: QR Code Scanning

Staff use a QR code scanner through a supported device or the website interface.

Once the customer's QR code is scanned, the system should retrieve the corresponding order.

Both methods should display the same order information.

15. COMPLETE ORDER DETAILS
When an order is retrieved, the dashboard should display:

Customer Information

Customer's full name.

Phone number.

Email address.

Delivery or collection information.

Food Order Details

Type of rice ordered.

Plate sizes.

Number of Jollof Rice plates.

Number of Mixed Rice plates.

Number of Beef plates.

Number of Chicken plates.

Extra Beef quantities.

Extra Chicken quantities.

Drinks

Drink types.

Quantities of each drink.

Payment Information

Total amount.

Payment reference.

Payment status.

Date and time of payment.

Order Information

Order ID.

QR code.

Date of order.

Fulfilment date and time.

Order status.

The information must be arranged clearly so staff can prepare and package the correct order without confusion.

16. ORDER STATUS MANAGEMENT
Authorised staff should be able to update the progress of an order.

Suggested order statuses:

New Order.

Payment Confirmed.

Processing.

Preparing.

Ready for Collection/Delivery.

Completed.

Cancelled.

The status should update in the database.

Where appropriate, customers should also receive updates about their orders.

17. ORDER MANAGEMENT AND STAFF ACCESS
The website should allow the owner to create accounts for authorised staff members.

The owner should be able to control who can access the administration portal and what each staff member is permitted to do.

Suggested access levels:

Owner / Super Administrator: Full access.

Manager: Order and operational management.

Order Management Staff: View and manage assigned order operations.

Other authorised staff: Access only to the functions assigned to them.

Staff should not automatically have permission to change sensitive settings, payment configurations or administrative privileges.

18. DATABASE AND RECORD KEEPING
All customer orders must be stored in a central database.

The system should retain:

Customer records.

Order history.

Food selections.

Drink selections.

Payment records.

Order IDs.

QR codes or their associated unique identifiers.

Order status history.

The owner should be able to search previous orders and retrieve records when necessary.

The system should also support exporting order records for business accounting and operational purposes.

19. IMPORTANT WEBSITE REQUIREMENTS
The following requirements must be considered during development:

The website must be mobile-friendly and responsive.

The ordering process must support bulk orders.

Customers must be able to customise different quantities and proteins within one order.

The system must calculate prices automatically.

Customers must receive unique Order IDs and QR codes after verified successful payment.

The administration portal must be protected by authentication.

The customer portal and administration portal must share the same database.

The system must prevent duplicate payment confirmations.

The system should support searching orders by Order ID and QR code.

The website must be designed so additional food categories, products and services can be introduced in the future without rebuilding the entire system.

20. FUTURE EXPANSION
Although DMK is initially focusing on rice packages, the website should be built with future expansion in mind.

DMK may introduce:

Additional food categories.

More food varieties.

New protein options.

Different food packages.

Event catering packages.

Corporate catering orders.

Online food ordering and other services.

The system architecture should allow these additions without disrupting the existing ordering and management system.

PROJECT OBJECTIVE

To build a professional, automated and reliable ordering and kitchen management platform for De_Mayor Kitchen, allowing customers to place customised bulk food orders conveniently while giving DMK complete control over order management, payment records, food preparation and fulfilment.