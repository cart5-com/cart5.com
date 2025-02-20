import type { Item, MenuRoot } from './menuType';

// CSV column mapping type
type CSVMenuRow = {
    id: string;
    label: string;
    type: string;
    price: string;
    description: string;
    isSoldOut: string;
    children: string;
    preSelectedQuantity: string;
    optionPrice: string;
    max: string;
    min: string;
    chargeAbove: string;
    refundBelow: string;
}

// Convert CSV type to menu item type
function convertCSVRowToMenuItem(row: CSVMenuRow): Item {
    console.log('row', row);
    return {
        id: row.id || `${row.type}-${crypto.randomUUID()}`,
        lbl: row.label,
        t: convertTypeString(row.type),
        prc: row.price ? Number(row.price) : undefined,
        dsc: row.description || undefined,
        cIds: row.children ? row.children.split(',') : undefined,
        defQ: row.preSelectedQuantity ? Number(row.preSelectedQuantity) : undefined,
        opPrc: row.optionPrice ? Number(row.optionPrice) : undefined,
        maxQ: row.max ? Number(row.max) : undefined,
        minQ: row.min ? Number(row.min) : undefined,
        chrgAbvQ: row.chargeAbove ? Number(row.chargeAbove) : undefined,
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

// Parse CSV content and return MenuRoot structure
export function importMenuFromCSV(csvContent: string): MenuRoot {
    const lines = parseCSVLines(csvContent);
    const headers = lines[0].map(h => h.trim());

    const menuRoot: MenuRoot = {
        children: [],
        allItems: {}
    };

    // Process each line (skipping header)
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        const row = headers.reduce((obj, header, index) => {
            obj[header as keyof CSVMenuRow] = values[index] || '';
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
export function validateCSVHeaders(headers: string[]): boolean {
    const requiredHeaders = [
        'id', 'label', 'type', 'price', 'description',
        'isSoldOut', 'children', 'preSelectedQuantity',
        'optionPrice', 'max', 'min', 'chargeAbove', 'refundBelow'
    ];

    return requiredHeaders.every(header =>
        headers.includes(header)
    );
} 