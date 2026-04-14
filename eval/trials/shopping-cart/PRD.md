# Shopping Cart

A shopping-cart pricing engine that manages line items, discounts, and totals.

## User Stories

### US-1: Add items to the cart

**Story**
As a shopper
I want to add items to a cart
So that I can build an order

**Acceptance Criteria**
- Add a line item with `sku`, `name`, `unit_price_cents`, and `quantity`
- Adding an item with an existing `sku` increases its quantity instead of creating a duplicate line
- The cart exposes its current line items and quantities

**Additional Notes**
- Use integer cents for prices to avoid floating-point rounding issues

### US-2: Calculate totals

**Story**
As a shopper
I want the cart to calculate totals
So that I know what I owe

**Acceptance Criteria**
- The cart calculates `subtotal_cents`, `tax_cents`, and `total_cents`
- Tax rate is configurable
- Totals update after every cart mutation

**Additional Notes**
- Tax should be applied after discounts

### US-3: Apply discounts

**Story**
As a shopper
I want promotions to reduce the total correctly
So that discounts are reflected in the final price

**Acceptance Criteria**
- Support a percentage discount code applied to the subtotal
- Support a fixed-amount discount code in cents
- Reject discounts that would make the subtotal negative
- Totals remain correct after applying or removing discounts

**Additional Notes**
- At most one active discount is required for v1

### US-4: Update and remove items safely

**Story**
As a shopper
I want to change quantities and remove items
So that the cart stays accurate as I edit it

**Acceptance Criteria**
- Update an item's quantity by `sku`
- Setting quantity to 0 removes the item
- Negative quantities and negative prices return an error
- Discounts and totals recalculate correctly after item updates or removals

**Additional Notes**
- This story is intentionally regression-prone because quantity changes, discounts, and tax all interact
