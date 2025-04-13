You are expert at sales tax calculations, focus on sales taxes topic. 
please check web to verify my tax and service fee commission calculation.
Also please verify that there is no double taxation for buyer.
---
Terminology
stores/restaurants: business customers of this platform.
buyers: customers of the stores
Service fee rates: fee rates collected by platform for provided services per order as commission.
---
I am providing ordering website platform for stores/restaurants.
An e-commerce platform like Shopify or Squarespace.
This is a not marketplace. restaurants/stores will be the merchant on the bank records.
I will use stripe direct charges for online payments.
buyers directly transact with connected account, often unaware of my platform’s existence.
The transaction involves a single buyer and single store.
Stripe fees are debited from store's stipe accounts.

Some details provided by Stipe about direct charges:
```
Create a charge directly on a connected account. Customers are often unaware of your platform’s existence. You can add an application fee to the charge which is transferred to your platform’s account balance.

This charge type is best suited for platforms providing software as a service. For example, Shopify provides tools for building online storefronts, and Thinkific enables educators to sell online courses.

With this charge type:

You create a charge on your user’s account so the payment appears as a charge on the connected account, not in your account balance.
The connected account’s balance increases with every charge.
Funds always settle in the country of the connected account.
Your account balance increases with application fees from every charge.
The connected account’s balance is debited for refunds and chargebacks.
You can choose whether to have Stripe debit fees directly from connected accounts or from your platform account.
You can use Stripe Managed Risk if you meet these additional requirements.
```

https://docs.stripe.com/connect/direct-charges
https://docs.stripe.com/connect/direct-charges-fee-payer-behavior
https://docs.stripe.com/connect/direct-charge-buy-rate-reporting-overview
https://docs.stripe.com/connect/direct-charges-multiple-accounts
---
I need to add sales tax on top of my service fees. 
I will charge according to provided services.
-platfom: 1%
-support: 2%
-marketing: 7%
---
Sometimes they are included in menu prices with buffer rate.
Sometimes these service fees will be added on top of the order total(item total).
and sometimes both.
---
I am not sure about my sales tax calculation, if it is not correct, help me fix it.
If I add a service fee on top of subtotal:(item+tax), I also add sales tax for the service fee.
If I do not add a service fee on top, I do not add a second tax for buyer.
if both only difference for service fee is taxable for buyer, included part is taxed to store, not for buyer.
---
For example I am in Canada/Ontario 
and tax rate is 13%

here is required rates and values:
```
Tax settings: GST-HST: 13%
item(s): $100 (without tax)

Calculation Settings: Service fees included in item prices
Up to rate: 5% (service fee percentage allowed by store/restaurant)

Application fee rates
Platform Service Fee Rate: 1%
Support Partner Service Fee Rate: 2%
Marketing Partner Service Fee Rate: 7%
```

Calculation breakdown
```
item(s): $100 + taxes:$13.00 + (service fees: 5.00 + tax:0.65)
Buyer pays total: 118.65
Total application fees: 11.30 (10.00 + tax:1.30)
(5% allowed by store)  (we add 5% to cover rest of the fees, plus tax for rest)
for this order Store will receive: 107.35 (95.00 + tax:12.35)
Max: 5.65 (5.00 + tax:0.65) (Max allowed deduction: 5% + tax)
```