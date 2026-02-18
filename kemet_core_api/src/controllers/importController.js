const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const xlsx = require('xlsx');
const { cleanRow } = require('../services/dataCleaningService');

/**
 * Preview the import from an uploaded Excel file.
 * Returns the first 10 rows and available columns so user can map them.
 */
const previewImport = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        const columns = Object.keys(data[0]);
        const preview = data.slice(0, 10);

        res.json({
            columns,
            preview,
            totalRows: data.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Process the full import using user-provided mapping.
 */
const processImport = async (req, res) => {
    const { mapping, fileName } = req.body;
    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    if (!req.file && !mapping) {
        return res.status(400).json({ message: 'Missing file or mapping' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const cleanedData = data.map(row => ({
            ...cleanRow(row, mapping),
            organizationId,
            createdById: userId,
        })).filter(customer => customer.email || customer.phone); // Require at least one contact point

        // Import in chunks to avoid database timeouts
        const chunkSize = 100;
        let importedCount = 0;

        for (let i = 0; i < cleanedData.length; i += chunkSize) {
            const chunk = cleanedData.slice(i, i + chunkSize);

            // We use createMany for speed if the DB supports it, otherwise loop.
            // Note: createMany with skipDuplicates: true is good for deduplication.
            const result = await prisma.customer.createMany({
                data: chunk,
                skipDuplicates: true,
            });
            importedCount += result.count;
        }

        res.json({
            message: 'Import complete',
            totalProcessed: cleanedData.length,
            totalImported: importedCount,
            duplicatesSkipped: cleanedData.length - importedCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    previewImport,
    processImport,
};
