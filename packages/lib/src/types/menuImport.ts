import type { Item, MenuRoot } from './menuType';

// CSV column mapping type
type CSVMenuRow = {
    id: string;
    title: string;
    type: string;
    price: string;
    description: string;
    children: string;
    'default-quantity': string;
    'price-as-option': string;
    max: string;
    min: string;
    'charge-above': string;
    'is-sold-out': string;
    'refund-below': string;
}

// Convert CSV type to menu item type
function convertCSVRowToMenuItem(row: CSVMenuRow): Item {
    return {
        id: row.id || `${row.type}-${crypto.randomUUID()}`,
        lbl: row.title,
        t: convertTypeString(row.type),
        prc: row.price ? Number(row.price) : undefined,
        dsc: row.description || undefined,
        cIds: row.children ? row.children.split(',') : undefined,
        defQ: row['default-quantity'] ? Number(row['default-quantity']) : undefined,
        opPrc: row['price-as-option'] ? Number(row['price-as-option']) : undefined,
        maxQ: row.max ? Number(row.max) : undefined,
        minQ: row.min ? Number(row.min) : undefined,
        chrgAbvQ: row['charge-above'] ? Number(row['charge-above']) : undefined,
        // isSoldOut: row['is-sold-out'] ? row['is-sold-out'] === 'true' : undefined,
        // refundBelow: row['refund-below'] ? Number(row['refund-below']) : undefined,
    };
}

// Convert type string to menu item type
function convertTypeString(type: string): Item['t'] {
    switch (type.toLowerCase()) {
        case 'item':
        case 'i':
            return 'i';
        case 'category':
        case 'ct':
            return 'ct';
        case 'customization':
        case 'c':
            return 'c';
        case 'option':
        case 'o':
            return 'o';
        default:
            return 'i';
    }
}

// Convert type to string representation
function convertTypeToString(type: Item['t']): string {
    switch (type) {
        case 'i': return 'item';
        case 'ct': return 'category';
        case 'c': return 'customization';
        case 'o': return 'option';
        default: return 'item';
    }
}

export function getSampleMenuCSV(): string {
    const sampleMenu: MenuRoot = {
        children: ['cat1', 'cat2'],
        allItems: {
            'cat1': {
                id: 'cat1',
                lbl: 'Appetizers',
                t: 'ct',
                cIds: ['item1', 'item2']
            },
            'cat2': {
                id: 'cat2',
                lbl: 'Main Course',
                t: 'ct',
                cIds: ['item3']
            },
            'item1': {
                id: 'item1',
                lbl: 'Spring Rolls',
                t: 'i',
                prc: 5.99,
                dsc: 'Crispy vegetable spring rolls',
                cIds: ['custom1']
            },
            'item2': {
                id: 'item2',
                lbl: 'Salad',
                t: 'i',
                prc: 7.99,
                dsc: 'Fresh garden salad'
            },
            'item3': {
                id: 'item3',
                lbl: 'Burger',
                t: 'i',
                prc: 12.99,
                dsc: 'Classic beef burger',
                cIds: ['custom2']
            },
            'custom1': {
                id: 'custom1',
                lbl: 'Dipping Sauce',
                t: 'c',
                cIds: ['opt1', 'opt2']
            },
            'custom2': {
                id: 'custom2',
                lbl: 'Toppings',
                t: 'c',
                cIds: ['opt3', 'opt4']
            },
            'opt1': {
                id: 'opt1',
                lbl: 'Sweet Chili',
                t: 'o',
                opPrc: 0.50,
                chrgAbvQ: 1
            },
            'opt2': {
                id: 'opt2',
                lbl: 'Peanut Sauce',
                t: 'o',
                opPrc: 0.50,
                chrgAbvQ: 1
            },
            'opt3': {
                id: 'opt3',
                lbl: 'Extra Cheese',
                t: 'o',
                opPrc: 1.00,
                maxQ: 2
            },
            'opt4': {
                id: 'opt4',
                lbl: 'Bacon',
                t: 'o',
                opPrc: 2.00,
                defQ: 1
            }
        }
    };

    return exportMenuToCSV(sampleMenu);
}

export function exportMenuToCSV(menuRoot: MenuRoot): string {
    // Define CSV headers
    const headers = [
        'id',
        'title',
        'type',
        'price',
        'description',
        'children',
        'default-quantity',
        'price-as-option',
        'max',
        'min',
        'charge-above'
    ];

    // Create CSV rows
    const rows: string[][] = [headers];

    // Convert each item to CSV row
    Object.values(menuRoot.allItems || {}).forEach(item => {
        const row = [
            item.id || '',
            item.lbl || '',
            convertTypeToString(item.t || 'i'),
            item.prc?.toString() || '',
            item.dsc || '',
            item.cIds?.join(',') || '',
            item.defQ?.toString() || '',
            item.opPrc?.toString() || '',
            item.maxQ?.toString() || '',
            item.minQ?.toString() || '',
            item.chrgAbvQ?.toString() || ''
        ];
        rows.push(row);
    });

    // Convert rows to CSV string
    return rows.map(row =>
        row.map(field => {
            // Escape fields containing commas, quotes, or newlines
            if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
        }).join(',')
    ).join('\n');
}

// Parse CSV content and return MenuRoot structure
export function importMenuFromCSV(csvContent: string): MenuRoot {
    const lines = parseCSVLines(csvContent);
    const headers = lines[0]?.map(h => h.trim()) || [];

    const menuRoot: MenuRoot = {
        children: [],
        allItems: {}
    };

    // Process each line (skipping header)
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        const row = headers.reduce((obj, header, index) => {
            obj[header as keyof CSVMenuRow] = values?.[index] || '';
            return obj;
        }, {} as CSVMenuRow);

        // Convert row to menu item
        const item = convertCSVRowToMenuItem(row);

        // Add to allItems
        if (item.id) {
            menuRoot.allItems![item.id] = item;

            // If it's a category (root level item), add to children
            if (item.t === 'ct') {
                menuRoot.children!.push(item.id);
            }
        }
    }

    return menuRoot;
}

function parseCSVLines(csvContent: string): string[][] {
    // Clean problematic control characters
    csvContent = csvContent
        .replace(/\r/g, '')         // Carriage return
        .replace(/\u0000/g, '')     // Null character
        .replace(/\ufeff/g, '')     // Byte Order Mark (BOM)
        .replace(/[\v\f]/g, '')     // Vertical tab and Form feed
        .replace(/\u200b/g, '');    // Zero-width space


    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < csvContent.length; i++) {
        const char = csvContent[i];
        const nextChar = csvContent[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Handle escaped quotes
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // End of field
            currentLine.push(currentField);
            currentField = '';
        } else if (char === '\n' && !insideQuotes) {
            // End of line
            currentLine.push(currentField);
            if (currentLine.some(field => field !== '')) {
                lines.push(currentLine);
            }
            currentLine = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    // Handle last field and line
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        if (currentLine.some(field => field !== '')) {
            lines.push(currentLine);
        }
    }

    return lines;
}

// Helper function to validate CSV headers
// export function validateRequiredCSVHeaders(headers: string[]): boolean {
//     const requiredHeaders = [
//         'id', 'type',
//     ];

//     return requiredHeaders.every(header =>
//         headers.includes(header)
//     );
// } 