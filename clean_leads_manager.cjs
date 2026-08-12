const fs = require('fs');
let code = fs.readFileSync('resources/js/components/LeadsManager.jsx', 'utf8');

// 1. Remove states
code = code.replace(/    const \[quotationModalOpen.*?;\n/, '');
code = code.replace(/    const \[activeQuotationPrint.*?;\n/, '');
code = code.replace(/    const \[quoteForm, setQuoteForm\] = useState\(\{[\s\S]*?status: 'Draft'\n    \}\);\n/, '');

// 2. Remove actions
code = code.replace(/    \/\/ ==========================================\n    \/\/ QUOTATION ACTIONS\n    \/\/ ==========================================\n[\s\S]*?    \/\/ Filter leads/g, '    // Filter leads');

// 3. Remove split views column classes
code = code.replace(/grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100/, '');
code = code.replace(/pr-0 md:pr-3/, '');

// 4. Remove quotations column
code = code.replace(/                            \{\/\* Quotations Column \*\/\}[\s\S]*?\{\/\* Split views: Follow-ups and Quotations \*\/}/g, '');
// Wait, the order is split views comment, then follow ups column, then quotations column.
// Let's replace the whole quotations column
code = code.replace(/                            \{\/\* Quotations Column \*\/\}[\s\S]*?(?=                        <\/div>\n                    <\/div>\n                \) : \()/g, '');

// 5. Remove Modals
code = code.replace(/            \{\/\* Quotation Generator Modal \*\/\}[\s\S]*?(?=        <\/div>\n    \);\n})/g, '');

fs.writeFileSync('resources/js/components/LeadsManager.jsx', code);
