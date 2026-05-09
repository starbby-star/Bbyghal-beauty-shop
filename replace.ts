import fs from 'fs';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ['>${', '>KSh {'],
  ['-${', '-KSh {'],
  ['Sales ($)', 'Sales (KSh)'],
  ['Profit ($)', 'Profit (KSh)'],
  ['+$${', '+KSh ${'],
  ['-$${', '-KSh ${'],
  ['Discount Amount ($)', 'Discount Amount (KSh)'],
  ['Wholesale Price ($)', 'Wholesale Price (KSh)'],
  ['Pay $${', 'Pay KSh ${'],
  ['Due: $${', 'Due: KSh ${'],
  ['-${receiptSale.discount}', '-KSh {receiptSale.discount}'], // wait, if it's inside JSX text
  ['>${(receiptSale', '>KSh {(receiptSale'],
  ['>${receiptSale', '>KSh {receiptSale'],
];

for (const [search, replace] of replacements) {
    appCode = appCode.split(search).join(replace);
}

// Handle literal $ numbers
appCode = appCode.replace(/\$([0-9]+)/g, 'KSh $1');

// Handle the +$${profit} which is actually literally +${profit} or +$${profit}
appCode = appCode.replace(/\+\$\{/g, '+KSh {');

fs.writeFileSync('src/App.tsx', appCode);

console.log("Replaced in App.tsx");
