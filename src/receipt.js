export function extractReceipt(text='') {
 const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const totalLines=lines.filter(l=>/\b(total|amount due|balance due)\b/i.test(l)&&!/subtotal|tax|change/i.test(l));
 const amounts=(totalLines.length?totalLines:lines).flatMap(l=>[...l.matchAll(/(?:\$\s*)?(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})\b/g)].map(m=>Number(m[1].replaceAll(',','')+'.'+m[2])));
 const raw=text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/); const us=text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2}|\d{2})\b/);
 let date=raw?`${raw[1]}-${raw[2].padStart(2,'0')}-${raw[3].padStart(2,'0')}`:us?`${us[3].length===2?'20'+us[3]:us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`:'';
 if(date&&Number.isNaN(Date.parse(date)))date='';
 return {vendor:lines.find(l=>/[a-z]{3}/i.test(l)&&!/^receipt|^invoice|^date/i.test(l))||'',date,amount:amounts.length?Math.max(...amounts):'',ocrText:text,status:'draft',needsConfirmation:true};
}
